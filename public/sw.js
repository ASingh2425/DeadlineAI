// DeadlineAI Service Worker for Web Push Notifications
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { title: 'DeadlineAI Reminder', body: 'You have an upcoming event deadline!' };
  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
