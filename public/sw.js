// Service Worker for Push Notifications
const CACHE_NAME = 'cocoapapers-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

// Push event - Handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push received:', event);
  
  let notificationData = {
    title: 'New Document',
    body: 'You have received a new document',
    icon: '/asset/images/cocoa-logo.png',
    badge: '/asset/images/cocoa-logo.png',
    tag: 'new-document',
    data: {
      url: '/incoming'
    }
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || 'New Document Received',
        body: data.body || `From: ${data.sentBy}\nSubject: ${data.subject}`,
        icon: data.icon || '/asset/images/cocoa-logo.png',
        badge: '/asset/images/cocoa-logo.png',
        tag: data.tag || 'new-document-' + Date.now(),
        data: {
          url: data.url || '/incoming',
          documentId: data.documentId
        },
        requireInteraction: true,
        vibrate: [200, 100, 200],
        actions: [
          { action: 'view', title: 'View Document' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      };
    } catch (e) {
      console.error('Error parsing push data:', e);
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: notificationData.requireInteraction,
      vibrate: notificationData.vibrate,
      actions: notificationData.actions
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data;

  if (action === 'dismiss') {
    return;
  }

  // Default action or 'view' action
  const urlToOpen = notificationData?.url || '/incoming';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});
