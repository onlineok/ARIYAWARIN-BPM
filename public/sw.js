/**
 * ARIYAWARIN Blood Pressure Monitor - Service Worker
 * Handles background push notifications, badge updates, and notification clicks.
 */

self.addEventListener('install', (event) => {
  // Activate worker immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming Web Push events
self.addEventListener('push', (event) => {
  let data = {
    title: '🔔 แจ้งเตือนวัดความดันโลหิต - ARIYAWARIN',
    body: 'ถึงเวลาบันทึกค่าความดันโลหิตตามช่วงเวลาที่กำหนดแล้ว กรุณานั่งพัก 5 นาทีแล้วเริ่มวัด',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: 'ariyawarin-push-notification',
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon.svg',
    badge: data.badge || '/icon.svg',
    tag: data.tag || 'ariyawarin-bp-alert',
    renotify: true,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: [
      { action: 'record', title: '✍️ บันทึกตอนนี้' },
      { action: 'dismiss', title: 'ปิด' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification click: focus app window or open it
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Open or focus application window
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          // Send message to open real-time entry tab
          client.postMessage({ type: 'NAVIGATE_TO_TAB', tab: 'realtime' });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
