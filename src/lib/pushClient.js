async function registerDeviceToken({ token, email = '', role = '' }) {
  if (!token) throw new Error('Missing device token');

  try {
    const res = await fetch('/api/registerDevice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email, role })
    });
    return await res.json();
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export { registerDeviceToken };
