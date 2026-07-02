import React, { useState } from 'react';

function LostFoundForm({ close, actions, foundBy = 'Teacher' }) {
  const [item, setItem] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateFound, setDateFound] = useState(new Date().toISOString().slice(0, 10));
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onPublish = async () => {
    if (!item && !description) return;
    const payload = { item, description, location, date: dateFound, foundBy };

    // Try server upload first
    try {
      const form = new FormData();
      form.append('item', item);
      form.append('description', description);
      form.append('location', location);
      form.append('date', dateFound);
      form.append('foundBy', foundBy);
      if (photoFile) form.append('photo', photoFile);

      setUploading(true);
      const res = await fetch('/api/lostfound', { method: 'POST', body: form });
      setUploading(false);
      if (res.ok) {
        const json = await res.json();
        if (actions && actions.addLostFoundServer) actions.addLostFoundServer(json.item);
        if (window.showToast) window.showToast('Lost item published');
        close();
        return;
      }
      throw new Error('Server error');
    } catch (e) {
      setUploading(false);
      // fallback to client-side store (data URL)
      if (photoFile) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          payload.photo = ev.target.result;
          actions.addLostFound(payload);
          if (window.showToast) window.showToast('Lost item published (local)');
          close();
        };
        reader.readAsDataURL(photoFile);
      } else {
        actions.addLostFound(payload);
        if (window.showToast) window.showToast('Lost item published (local)');
        close();
      }
    }
  };

  return (
    <div className="lostFoundForm">
      <label>
        Take photo
        <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} />
      </label>
      <label>
        Item description
        <input value={item} onChange={(e) => setItem(e.target.value)} placeholder="e.g., Black backpack" />
      </label>
      <label>
        Details
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </label>
      <label>
        Location found
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Gym locker" />
      </label>
      <label>
        Date found
        <input type="date" value={dateFound} onChange={(e) => setDateFound(e.target.value)} />
      </label>
      <div className="actionRow">
        <button className="smallBtn" type="button" onClick={onPublish} disabled={uploading}>{uploading ? 'Publishing...' : 'Publish'}</button>
        <button className="textButton" type="button" onClick={close}>Cancel</button>
      </div>
    </div>
  );
}

export { LostFoundForm };
