export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    
    // Only register service worker in production
    if (permission === 'granted' && process.env.NODE_ENV === 'production') {
      await registerServiceWorker();
    }
    
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/reminder-worker.js');
      console.log('Service Worker registered:', registration);
      
      // Start periodic sync if supported
      const periodicSync = 'periodicSync' in registration ? 
        (registration as ServiceWorkerRegistration & { periodicSync: { register: (tag: string, options: { minInterval: number }) => Promise<void> } }).periodicSync : 
        null;

      if (periodicSync) {
        try {
          await periodicSync.register('check-reminders', {
            minInterval: 30 * 60 * 1000 // 30 minutes
          });
        } catch (error) {
          console.log('Periodic Sync could not be registered:', error);
        }
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

export function sendBrowserNotification(title: string, options: NotificationOptions = {}) {
  if (!('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        icon: '/notification-icon.png', // You'll need to add this icon to your public folder
        badge: '/notification-badge.png', // You'll need to add this badge to your public folder
        ...options
      });

      notification.onclick = function() {
        window.focus();
        if (options.data?.url) {
          window.location.href = options.data.url;
        }
        notification.close();
      };
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
}

// Function to check for due reminders
export async function checkDueReminders() {
  try {
    const response = await fetch('/api/reminders/today');
    if (!response.ok) {
      throw new Error('Failed to fetch reminders');
    }

    const reminders = await response.json();
    
    for (const reminder of reminders) {
      sendBrowserNotification(`Reminder: ${reminder.title}`, {
        body: reminder.description || 'Due today',
        data: {
          url: `/connection/${reminder.connectionId}`
        }
      });
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
}

// In development, we'll use a regular interval instead of a service worker
export function startReminderChecks() {
  // Do an immediate check
  checkDueReminders();

  // In development, set up a regular interval
  if (process.env.NODE_ENV === 'development') {
    // Check every 5 minutes in development
    const interval = setInterval(checkDueReminders, 5 * 60 * 1000);
    
    // Clean up interval when the page is unloaded
    window.addEventListener('unload', () => {
      clearInterval(interval);
    });
  }
} 