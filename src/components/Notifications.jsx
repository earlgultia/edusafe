import React, { useState } from 'react';
import { Bell, User, AlertTriangle, Calendar, Thermometer, FileText, Check } from 'lucide-react';

function Notifications({ notifications = [], actions = {} }) {
  const [open, setOpen] = useState(false);
  const unread = (notifications || []).filter((n) => !n.read).length;

  const markRead = (id) => {
    if (actions.markNotificationRead) actions.markNotificationRead(id);
    if (actions.acknowledgeEmergency) {
      const note = (notifications || []).find((n) => n.id === id && n.type === 'emergency');
      if (note) actions.acknowledgeEmergency(note.id, 'currentUser');
    }
  };

  const markAllRead = () => {
    if (!actions.markNotificationRead) return;
    (notifications || []).forEach((notification) => {
      if (!notification.read) actions.markNotificationRead(notification.id);
    });
  };

  const iconFor = (type) => {
    switch (type) {
      case 'visitor': return <User size={18} />;
      case 'emergency': return <AlertTriangle size={18} />;
      case 'event': return <Calendar size={18} />;
      case 'clinic': return <Thermometer size={18} />;
      case 'incident': return <FileText size={18} />;
      case 'attendance': return <Check size={18} />;
      default: return <Bell size={18} />;
    }
  };

  return (
    <div className="notificationsWrap">
      <button className="iconBtn" onClick={() => setOpen((v) => !v)} aria-label="Notifications">
        <Bell />
        {unread > 0 && <span className="badge">{unread}</span>}
      </button>
      {open && (
        <div className="notifDropdown">
          <div className="notifHead">
            <div><strong>Notifications</strong></div>
            <div className="notifHeadActions">
              <button type="button" className="textButton" onClick={markAllRead}>Mark all read</button>
              <button type="button" className="textButton" onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>
          <div className="notifList">
            {(notifications || []).slice(0, 20).map((n) => (
              <button key={n.id} className={`notifItem ${n.read ? 'read' : 'unread'}`} onClick={() => markRead(n.id)}>
                <div className="notifIcon">{iconFor(n.type)}</div>
                <div className="notifBody">
                  <div className="notifTitleRow">
                    <strong className="notifTitle">{n.title}</strong>
                    <span className="muted">{n.time}</span>
                  </div>
                  <div className="notifText">{n.body}</div>
                </div>
              </button>
            ))}
            {!notifications.length && <div className="emptyText">No notifications</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export { Notifications };