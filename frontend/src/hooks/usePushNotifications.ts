import { useEffect, useCallback } from 'react';

const TOKEN_KEY = 'auth_token';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) { view[i] = rawData.charCodeAt(i); }
  return view;
}

export function usePushNotifications() {
  const token = localStorage.getItem(TOKEN_KEY);

  const subscribeToNotifications = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Send subscription to backend
      await fetch('/api/v1/notifications/push-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subscription),
      });

      console.log('✅ Push subscription activated');
    } catch (err) {
      console.error('Push subscription failed:', err);
    }
  }, [token]);

  useEffect(() => {
    if (token && VAPID_PUBLIC_KEY) {
      // Delay to not block page load
      const timer = setTimeout(() => subscribeToNotifications(), 3000);
      return () => clearTimeout(timer);
    }
  }, [token, subscribeToNotifications]);

  return { subscribeToNotifications };
}
