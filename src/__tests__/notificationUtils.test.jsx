import { describe, it, expect } from 'vitest';
import { buildNotificationFeed, getUnreadNotificationCount } from '../app/notificationUtils.js';

describe('notification utilities', () => {
  it('prefers the live notification list and counts unread items', () => {
    const data = {
      notifications: [
        { id: 1, title: 'New alert', body: 'A', read: false, time: 'Now' },
        { id: 2, title: 'Seen alert', body: 'B', read: true, time: 'Before' }
      ],
      announcements: [{ id: 10, title: 'Announcement', body: 'Old', priority: 'High' }],
      incidents: [{ id: 20, type: 'Incident', description: 'Old incident' }]
    };

    const feed = buildNotificationFeed(data);

    expect(feed).toHaveLength(2);
    expect(feed[0].title).toBe('New alert');
    expect(getUnreadNotificationCount(data.notifications)).toBe(1);
  });

  it('falls back to announcements and incidents when no notifications exist', () => {
    const data = {
      announcements: [{ id: 10, title: 'Announcement', body: 'Old', priority: 'High' }],
      incidents: [{ id: 20, type: 'Incident', description: 'Old incident' }]
    };

    const feed = buildNotificationFeed(data);

    expect(feed[0].title).toBe('Announcement');
    expect(feed[1].title).toBe('Incident report');
  });
});
