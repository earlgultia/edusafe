function buildNotificationFeed(data = {}) {
  const notifications = Array.isArray(data?.notifications) ? data.notifications : [];

  if (notifications.length) {
    return notifications.map((item) => ({
      id: item.id,
      title: item.title || 'Notification',
      summary: item.body || '',
      time: item.time || '',
      tone: item.type === 'emergency' ? 'alert' : 'normal',
      read: Boolean(item.read),
      type: item.type || 'general',
      raw: item
    }));
  }

  const announcements = (data?.announcements || []).slice(0, 2).map((item) => ({
    id: `announcement-${item.id}`,
    title: item.title || 'Announcement',
    summary: item.body || '',
    time: item.priority === 'High' ? 'Just now' : 'Today',
    tone: item.priority === 'Critical' ? 'alert' : 'normal',
    read: false,
    type: 'announcement',
    raw: item
  }));

  const incidents = (data?.incidents || []).slice(0, 1).map((item) => ({
    id: `incident-${item.id}`,
    title: `${item.type || 'Incident'} report`,
    summary: item.description || '',
    time: 'Today',
    tone: 'alert',
    read: false,
    type: 'incident',
    raw: item
  }));

  return [...announcements, ...incidents].slice(0, 3);
}

function getUnreadNotificationCount(notifications = []) {
  return (notifications || []).filter((item) => !item.read).length;
}

export { buildNotificationFeed, getUnreadNotificationCount };
