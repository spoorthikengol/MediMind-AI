import { AnimatePresence } from "framer-motion";
import { CheckCheck, Trash2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { NotificationCard } from "./NotificationCard";
import { NotificationEmptyState } from "./NotificationEmptyState";

import type { AppNotification } from "@/types/notification";

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: AppNotification[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export function NotificationPanel({
  open,
  onOpenChange,
  notifications,
  loading,
  error,
  onRetry,
  onRead,
  onDelete,
  onMarkAllRead,
  onClearAll,
}: NotificationPanelProps) {
  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>

        {notifications.length > 0 && (
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllRead}
              disabled={!hasUnread}
              className="text-xs"
            >
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
              Mark all read
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-xs text-muted-foreground hover:text-red-400"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Clear all
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-2">
          {loading ? (
            <LoadingState label="Loading notifications..." />
          ) : error ? (
            <ErrorState message={error} onRetry={onRetry} />
          ) : notifications.length === 0 ? (
            <NotificationEmptyState />
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {notifications.map((n) => (
                  <NotificationCard
                    key={n.id}
                    notification={n}
                    onRead={onRead}
                    onDelete={onDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}