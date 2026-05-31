import { useCallback, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface RealtimeNotification {
  id: string;
  title: string;
  message: string;
  event?: string;
  unread: boolean;
  at: string;
}

/** MVP: realtime désactivé par défaut (backend stub sans gateway Socket.io). */
export function isRealtimeEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_REALTIME === 'true';
}

function getSocketBaseUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
  return apiUrl.replace(/\/api\/v1\/?$/, '');
}

function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}j`;
}

export function useRealtimeNotifications(enabled: boolean) {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const realtimeActive = enabled && isRealtimeEnabled();

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  useEffect(() => {
    if (!realtimeActive) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    let socket: Socket | null = null;

    const pushNotification = (payload: Record<string, unknown>) => {
      const at = (payload.at as string) || new Date().toISOString();
      setNotifications((prev) =>
        [
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title: (payload.title as string) || 'Notification',
            message: (payload.message as string) || '',
            event: payload.event as string | undefined,
            unread: true,
            at,
          },
          ...prev,
        ].slice(0, 30),
      );
    };

    socket = io(`${getSocketBaseUrl()}/realtime`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: false,
      timeout: 5000,
    });

    socket.on('connect_error', () => {
      socket?.disconnect();
    });

    socket.on('notification', pushNotification);
    socket.on('order:new', pushNotification);
    socket.on('order:otp_verified', pushNotification);
    socket.on('cart:abandoned', pushNotification);
    socket.on('customer:suspect', pushNotification);

    return () => {
      socket?.disconnect();
    };
  }, [realtimeActive]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const formattedNotifications = notifications.map((n) => ({
    ...n,
    time: formatRelativeTime(n.at),
  }));

  return { notifications: formattedNotifications, unreadCount, markAllRead };
}
