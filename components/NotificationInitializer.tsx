'use client';

import { useEffect, useState } from 'react';
import { requestNotificationPermission, startReminderChecks } from '@/lib/notificationService';

export default function NotificationInitializer() {
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);

  useEffect(() => {
    const initializeNotifications = async () => {
      if (!hasRequestedPermission) {
        const granted = await requestNotificationPermission();
        setHasRequestedPermission(true);
        
        if (granted) {
          // Only do an immediate check - further checks will be handled by service worker
          startReminderChecks();
        }
      }
    };

    // Only initialize if running in browser
    if (typeof window !== 'undefined') {
      initializeNotifications();
    }
  }, [hasRequestedPermission]);

  return null; // This is a utility component that doesn't render anything
} 