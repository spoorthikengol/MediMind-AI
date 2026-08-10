import { useCallback, useEffect, useRef, useState } from "react";

import { api } from "@/lib/api";
import type { AppNotification } from "@/types/notification";

const POLL_INTERVAL_MS = 30000;

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [justArrived, setJustArrived] = useState(false);

  const unreadCountRef = useRef(0);

  const fetchList = useCallback(() => {
    setLoading(true);
    setError(null);

    api
      .getNotifications()
      .then((res: AppNotification[]) => {
        setNotifications(res);
        const unread = res.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
        unreadCountRef.current = unread;
      })
      .catch((err) => {
        setError(err?.message || "Unable to load notifications.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Lightweight polling just for the count, so the bell can animate
  // when a new notification arrives without refetching the whole list.
  useEffect(() => {
    fetchList();

    const interval = setInterval(() => {
      api
        .getUnreadNotificationCount()
        .then((res: { count: number }) => {
          if (res.count > unreadCountRef.current) {
            setJustArrived(true);
            fetchList();
          }
          unreadCountRef.current = res.count;
          setUnreadCount(res.count);
        })
        .catch(() => {
          // Silent — polling failures shouldn't interrupt the UI;
          // the next manual open of the panel will retry via fetchList.
        });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchList]);

  const clearJustArrived = useCallback(() => setJustArrived(false), []);

  const markAsRead = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    api.markNotificationRead(id).catch(() => {
      // Revert on failure by refetching the real state.
      fetchList();
    });
  }, [fetchList]);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    api.markAllNotificationsRead().catch(() => {
      fetchList();
    });
  }, [fetchList]);

  const removeNotification = useCallback((id: number) => {
    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id);
      if (target && !target.is_read) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      return prev.filter((n) => n.id !== id);
    });

    api.deleteNotification(id).catch(() => {
      fetchList();
    });
  }, [fetchList]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);

    api.clearAllNotifications().catch(() => {
      fetchList();
    });
  }, [fetchList]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    justArrived,
    clearJustArrived,
    refetch: fetchList,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };
}