import type { LucideIcon } from "lucide-react";
import {
  Upload,
  Bot,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CalendarClock,
  Stethoscope,
  Settings,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

import type { AppNotification, NotificationType } from "@/types/notification";
import { NotificationBadge } from "./NotificationBadge";

interface NotificationCardProps {
  notification: AppNotification;
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
}

const typeIcons: Record<NotificationType, LucideIcon> = {
  report_uploaded: Upload,
  analysis_completed: Bot,
  high_risk_detected: AlertTriangle,
  score_improved: TrendingUp,
  score_decreased: TrendingDown,
  follow_up_reminder: CalendarClock,
  doctor_recommendation: Stethoscope,
  system: Settings,
};

function formatRelativeTime(value: string): string {
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function NotificationCard({ notification, onRead, onDelete }: NotificationCardProps) {
  const Icon = typeIcons[notification.type] ?? Settings;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.2 }}
      onClick={() => !notification.is_read && onRead(notification.id)}
      className={`group relative flex gap-3 rounded-xl border p-3.5 transition-colors ${
        notification.is_read
          ? "border-white/5 bg-transparent"
          : "border-brand/20 bg-brand/[0.04] cursor-pointer hover:bg-brand/[0.07]"
      }`}
    >
      {!notification.is_read && (
        <span
          className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand"
          aria-label="Unread"
        />
      )}

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground">{notification.title}</p>
          <NotificationBadge priority={notification.priority} />
        </div>

        <p className="mt-0.5 text-xs text-muted-foreground">{notification.message}</p>

        <p className="mt-1.5 text-[11px] text-muted-foreground/70">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>

      <button
        type="button"
        aria-label="Delete notification"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification.id);
        }}
        className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-white/10 hover:text-foreground group-hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}