import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Optional Firebase Admin SDK for sending native pushes via FCM
let firebaseAdmin = null;
try {
  // lazy import to avoid hard dependency during development
  // resolve service account path relative to server folder
  const serviceAccountPath = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url))), 'serviceAccountKey.json');
  if (fs.existsSync(serviceAccountPath)) {
    const adminModule = await import('firebase-admin');
    firebaseAdmin = adminModule.default || adminModule;
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath));
    firebaseAdmin.initializeApp({ credential: firebaseAdmin.credential.cert(serviceAccount) });
    console.log('Firebase admin initialized for FCM');
  }
} catch (e) {
  // fall back quietly if firebase-admin isn't installed or service account missing
  firebaseAdmin = null;
}

// Optional Supabase admin client to validate incoming user tokens for admin operations
let supabaseAdmin = null;
try {
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    const { createClient } = await import('@supabase/supabase-js');
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    console.log('Supabase admin client initialized');
  }
} catch (e) {
  supabaseAdmin = null;
}

const app = express();
const port = process.env.PORT || 4000;
const ADMIN_KEY = process.env.ADMIN_KEY || '';
const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(serverRoot, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const dataFile = path.join(serverRoot, 'data.json');
let db = { lostFound: [], pushLog: [], deviceTokens: [] };
if (fs.existsSync(dataFile)) {
  try { db = JSON.parse(fs.readFileSync(dataFile)); } catch (e) { db = { lostFound: [], pushLog: [] }; }
}

const saveDb = () => fs.writeFileSync(dataFile, JSON.stringify(db, null, 2));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-z0-9.-]/gi,'_')}`)
});
const upload = multer({ storage });

app.use('/uploads', express.static(uploadsDir));

app.post('/api/lostfound', upload.single('photo'), (req, res) => {
  const { item, description, location, date, foundBy } = req.body;
  const id = Date.now();
  const photo = req.file ? `/uploads/${path.basename(req.file.path)}` : '';
  const record = { id, item, description, location, date, foundBy, photo, status: 'Found', createdAt: new Date().toISOString() };
  db.lostFound.unshift(record);
  saveDb();
  res.json({ ok: true, item: { ...record } });
});

app.post('/api/lostfound/:id/claim', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { claimant, contact } = req.body || {};
  const item = db.lostFound.find((it) => it.id === id);
  if (!item) return res.status(404).json({ ok: false, error: 'Not found' });
  item.status = 'Claimed';
  item.claim = { claimant, contact, time: new Date().toISOString() };
  // send push notification to all registered device tokens
  const push = { id: Date.now(), title: `Claim: ${claimant}`, body: `${claimant} claims item ${item.item || item.id}`, time: new Date().toISOString() };
  db.pushLog.unshift(push);
  saveDb();

  // attempt to send to all tokens (best-effort)
  const tokens = (db.deviceTokens || []).map((t) => t.token).filter(Boolean);
  if (tokens.length > 0) {
    void sendPush({ title: push.title, body: push.body, tokens }).catch(() => {});
  }

  res.json({ ok: true, item, push });
});

// Simple password reset flow for development: send code, verify, reset
if (!db.passwordResets) db.passwordResets = [];

app.post('/api/auth/send-reset', (req, res) => {
  const { email } = req.body || {};
  if (!email || !String(email).includes('@')) return res.status(400).json({ ok: false, error: 'Invalid email' });
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
  db.passwordResets = db.passwordResets.filter((r) => r.email !== String(email).toLowerCase());
  db.passwordResets.push({ email: String(email).toLowerCase(), code, expiresAt, used: false });
  saveDb();
  // If SMTP is configured, attempt to send the code via email.
  const SMTP_HOST = process.env.SMTP_HOST || '';
  const SMTP_PORT = process.env.SMTP_PORT || '';
  const SMTP_USER = process.env.SMTP_USER || '';
  const SMTP_PASS = process.env.SMTP_PASS || '';
  const SMTP_FROM = process.env.SMTP_FROM || `no-reply@${req.hostname || 'edusafe.local'}`;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    (async () => {
      try {
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: Number(SMTP_PORT) || 587,
          secure: String(process.env.SMTP_SECURE || '') === 'true',
          auth: { user: SMTP_USER, pass: SMTP_PASS }
        });

        const info = await transporter.sendMail({
          from: SMTP_FROM,
          to: email,
          subject: 'EduSafe password reset code',
          text: `Your EduSafe password reset code is: ${code}`
        });

        console.log('Password reset email sent:', info?.messageId || info);
      } catch (e) {
        console.error('Failed to send password reset email', e);
      }
    })();

    // In production do not return the code; still respond ok.
    res.json({ ok: true });
    return;
  }

  // Fallback for dev: log and return debug code.
  console.log(`Password reset code for ${email}: ${code}`);
  res.json({ ok: true, debugCode: process.env.NODE_ENV === 'production' ? undefined : code });
});

app.post('/api/auth/verify-reset', (req, res) => {
  const { email, code } = req.body || {};
  if (!email || !code) return res.status(400).json({ ok: false, error: 'Missing fields' });
  const record = (db.passwordResets || []).find((r) => r.email === String(email).toLowerCase() && !r.used);
  if (!record) return res.status(400).json({ ok: false, error: 'No reset requested' });
  if (Date.now() > record.expiresAt) return res.status(400).json({ ok: false, error: 'Code expired' });
  if (String(code).trim() !== String(record.code).trim()) return res.status(400).json({ ok: false, error: 'Invalid code' });
  record.verified = true;
  saveDb();
  res.json({ ok: true });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body || {};
  if (!email || !code || !newPassword) return res.status(400).json({ ok: false, error: 'Missing fields' });
  const record = (db.passwordResets || []).find((r) => r.email === String(email).toLowerCase() && !r.used);
  if (!record) return res.status(400).json({ ok: false, error: 'No reset requested' });
  if (Date.now() > record.expiresAt) return res.status(400).json({ ok: false, error: 'Code expired' });
  if (String(code).trim() !== String(record.code).trim()) return res.status(400).json({ ok: false, error: 'Invalid code' });
  // Mark used
  record.used = true;
  saveDb();
  // In a real backend you'd update the user's password; here we just acknowledge success
  res.json({ ok: true });
});

// Register a device token for push notifications
app.post('/api/registerDevice', (req, res) => {
  const { token, email, role } = req.body || {};
  if (!token) return res.status(400).json({ ok: false, error: 'Missing token' });

  const existing = db.deviceTokens.find((t) => t.token === token);
  if (!existing) {
    db.deviceTokens.unshift({ token, email: email || '', role: role || '', addedAt: new Date().toISOString() });
    saveDb();
  }

  res.json({ ok: true });
});

// Admin auth helper: either ADMIN_KEY header or a Supabase session token for an Admin user
async function ensureAdmin(req, res) {
  if (ADMIN_KEY) {
    const headerKey = req.headers['x-admin-key'] || req.headers['x-admin-key'.toLowerCase()];
    if (String(headerKey || '') === ADMIN_KEY) return { ok: true };
  }

  const auth = (req.headers.authorization || '')
    .toString()
    .replace(/^Bearer\s+/i, '')
    .trim();

  if (!auth) return { ok: false };

  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.auth.getUser(auth);
      if (!error && data?.user) {
        const role = data.user.user_metadata?.role || '';
        if (String(role).toLowerCase() === 'admin') return { ok: true, user: data.user };
      }
    } catch (e) {
      // fall through
    }
  }

  return { ok: false };
}

// Admin: list registered device tokens (requires ADMIN_KEY or valid Supabase Admin session)
app.get('/api/devices', async (req, res) => {
  const check = await ensureAdmin(req, res);
  if (!check.ok) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  res.json({ ok: true, devices: db.deviceTokens || [] });
});

// Admin: delete a device token (requires ADMIN_KEY or valid Supabase Admin session)
app.delete('/api/devices', async (req, res) => {
  const check = await ensureAdmin(req, res);
  if (!check.ok) return res.status(401).json({ ok: false, error: 'Unauthorized' });

  const { token } = req.body || {};
  if (!token) return res.status(400).json({ ok: false, error: 'Missing token' });

  db.deviceTokens = (db.deviceTokens || []).filter((t) => t.token !== token);
  saveDb();
  res.json({ ok: true });
});

// Admin: bulk delete device tokens (requires ADMIN_KEY or valid Supabase Admin session)
app.post('/api/devices/bulk', async (req, res) => {
  const check = await ensureAdmin(req, res);
  if (!check.ok) return res.status(401).json({ ok: false, error: 'Unauthorized' });

  const { tokens } = req.body || {};
  if (!Array.isArray(tokens) || !tokens.length) return res.status(400).json({ ok: false, error: 'Missing tokens array' });

  const tokenSet = new Set(tokens.map(String));
  db.deviceTokens = (db.deviceTokens || []).filter((t) => !tokenSet.has(String(t.token)));
  saveDb();
  res.json({ ok: true, removed: tokens.length });
});

// Admin: export registered devices as CSV (requires ADMIN_KEY or valid Supabase Admin session)
app.get('/api/devices/export', async (req, res) => {
  const check = await ensureAdmin(req, res);
  if (!check.ok) return res.status(401).json({ ok: false, error: 'Unauthorized' });

  const devices = db.deviceTokens || [];
  const rows = ['email,role,token,addedAt'];
  devices.forEach((d) => {
    const email = String(d.email || '').replace(/"/g, '""');
    const role = String(d.role || '').replace(/"/g, '""');
    const token = String(d.token || '');
    const added = String(d.addedAt || '');
    rows.push(`"${email}","${role}","${token}","${added}"`);
  });

  const csv = rows.join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="devices-${new Date().toISOString().slice(0,10)}.csv"`);
  res.send(csv);
});

// Send push via FCM (firebase-admin preferred, falls back to legacy HTTP if FCM_SERVER_KEY env provided)
async function sendPush({ title, body, tokens = [] }) {
  if (!Array.isArray(tokens) || tokens.length === 0) return { ok: false, reason: 'no-tokens' };

  try {
    if (firebaseAdmin) {
      const message = { notification: { title, body }, tokens };
      const resp = await firebaseAdmin.messaging().sendMulticast(message);
      return { ok: true, result: resp };
    }

    const serverKey = process.env.FCM_SERVER_KEY;
    if (serverKey) {
      const payload = { registration_ids: tokens, notification: { title, body } };
      const resp = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: { 'Authorization': `key=${serverKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await resp.json();
      return { ok: true, result: json };
    }

    // no send mechanism available; record for manual review
    db.pushLog.unshift({ id: Date.now(), title, body, queued: true, time: new Date().toISOString() });
    saveDb();
    return { ok: false, reason: 'no-send-mechanism' };
  } catch (e) {
    db.pushLog.unshift({ id: Date.now(), title, body, error: String(e), time: new Date().toISOString() });
    saveDb();
    return { ok: false, reason: 'exception', error: String(e) };
  }
}

app.post('/api/lostfound/:id/verify', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = db.lostFound.find((it) => it.id === id);
  if (!item) return res.status(404).json({ ok: false, error: 'Not found' });
  item.status = 'Returned';
  item.returnedAt = new Date().toISOString();
  saveDb();
  res.json({ ok: true, item });
});

app.get('/api/lostfound', (req, res) => {
  res.json({ ok: true, items: db.lostFound });
});

app.get('/api/pushLog', (req, res) => {
  res.json({ ok: true, log: db.pushLog });
});

// Send a push to all devices for a specific role (e.g., Parent)
app.post('/api/sendRole', async (req, res) => {
  const { role, title, body } = req.body || {};
  if (!role || !title) return res.status(400).json({ ok: false, error: 'Missing role or title' });

  if (ADMIN_KEY) {
    const key = (req.headers['x-admin-key'] || req.headers['x-admin-key'.toLowerCase()]) || req.headers['x-admin-key'];
    if (String(key || '') !== ADMIN_KEY) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  let tokens = [];
  if (String(role).toLowerCase() === 'all') {
    tokens = (db.deviceTokens || []).map((t) => t.token).filter(Boolean);
  } else {
    tokens = (db.deviceTokens || []).filter((t) => String(t.role || '').toLowerCase() === String(role).toLowerCase()).map((t) => t.token).filter(Boolean);
  }
  if (tokens.length === 0) return res.json({ ok: true, sent: 0, reason: 'no-tokens' });

  const result = await sendPush({ title, body: body || '', tokens });
  res.json({ ok: true, sent: tokens.length, result });
});

app.listen(port, () => {
  console.log(`EduSafe server prototype running on http://localhost:${port}`);
});
