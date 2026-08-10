import { BellOff } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";

export function NotificationEmptyState() {
  return (
    <EmptyState
      icon={BellOff}
      title="No notifications yet."
      description="You'll see updates here when reports finish processing or your health status changes."
    />
  );
}