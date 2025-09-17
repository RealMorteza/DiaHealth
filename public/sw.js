// public/sw.js
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data.json(); } catch(e) { data = { title: 'یادآوری', body: 'دارو' }; }
  const title = data.title || 'یادآوری دارو';
  const options = {
    body: data.body || '',
    icon: data.icon || '/pill.png',
    data: data, // اطلاعات اضافه
    badge: data.badge || '/pill.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});
