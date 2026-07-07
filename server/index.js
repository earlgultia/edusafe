import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 4000;
const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(serverRoot, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const dataFile = path.join(serverRoot, 'data.json');
let db = { lostFound: [], pushLog: [] };
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
  // simulate push notification to all users
  const push = { id: Date.now(), title: `Claim: ${claimant}`, body: `${claimant} claims item ${item.item || item.id}`, time: new Date().toISOString() };
  db.pushLog.unshift(push);
  saveDb();
  res.json({ ok: true, item, push });
});

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

app.listen(port, () => {
  console.log(`EduSafe server prototype running on http://localhost:${port}`);
});
