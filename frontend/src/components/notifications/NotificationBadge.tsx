import { Badge } from "@/components/ui/badge";
import type { NotificationPriority } from "@/types/notification";

interface NotificationBadgeProps {
  priority: NotificationPriority;
}

const priorityConfig: Record<NotificationPriority, { label: string; className: string }> = {
  info: {
    label: "Info",
    className: "bg-brand/10 text-brand border-0",
  },
  warning: {
    label: "Warning",
    className: "bg-amber-500/10 text-amber-400 border-0",
  },
  critical: {
    label: "Critical",
    className: "bg-red-500/10 text-red-400 border-0",
  },
};

export function NotificationBadge({ priority }: NotificationBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <Badge className={`${config.className} text-[10px]`}>
      {config.label}
    </Badge>
  );
}