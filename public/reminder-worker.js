// Service Worker for handling reminder checks
self.addEventListener('install', (event) => {
  console.log('Reminder Service Worker installing...');
});

self.addEventListener('activate', (event) => {
  console.log('Reminder Service Worker activating...');
});

// Handle periodic sync events
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-reminders') {
    event.waitUntil(checkReminders());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/notification-icon.png',
        badge: '/notification-badge.png',
        data: data.data
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data?.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

async function checkReminders() {
  try {
    const response = await fetch('/api/reminders/today');
    if (!response.ok) {
      throw new Error('Failed to fetch reminders');
    }

    const reminders = await response.json();
    
    for (const reminder of reminders) {
      await self.registration.showNotification(`Reminder: ${reminder.title}`, {
        body: reminder.description || 'Due today',
        icon: '/notification-icon.png',
        badge: '/notification-badge.png',
        data: {
          url: `/connection/${reminder.connectionId}`
        }
      });
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
} 