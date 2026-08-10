import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useNotifications } from "@/hooks/useNotification";
import { NotificationPanel } from "./NotificationPanel";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [ringing, setRinging] = useState(false);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    justArrived,
    clearJustArrived,
    refetch,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  // Trigger a brief ring animation whenever a genuinely new
  // notification arrives (detected by the hook's polling).
  useEffect(() => {
    if (justArrived) {
      setRinging(true);
      const timeout = setTimeout(() => setRinging(false), 900);
      clearJustArrived();
      return () => clearTimeout(timeout);
    }
  }, [justArrived, clearJustArrived]);

  return (
    <>
      <button
        type="button"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        onClick={() => setOpen(true)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
      >
        <motion.span
          animate={ringing ? { rotate: [0, -15, 12, -8, 5, 0] } : {}}
          transition={{ duration: 0.6 }}
        >
          <Bell className="h-4.5 w-4.5" aria-hidden="true" />
        </motion.span>

        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="unread-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <NotificationPanel
        open={open}
        onOpenChange={setOpen}
        notifications={notifications}
        loading={loading}
        error={error}
        onRetry={refetch}
        onRead={markAsRead}
        onDelete={removeNotification}
        onMarkAllRead={markAllAsRead}
        onClearAll={clearAll}
      />
    </>
  );
}