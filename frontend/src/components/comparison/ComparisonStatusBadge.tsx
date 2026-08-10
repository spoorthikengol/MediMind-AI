import { Badge } from "@/components/ui/badge";
import type { ChangeStatus } from "@/types/comparison";

interface ComparisonStatusBadgeProps {
  status: ChangeStatus;
}

const statusConfig: Record<
  ChangeStatus,
  { label: string; className: string }
> = {
  improved: {
    label: "Improved",
    className: "bg-emerald-500/10 text-emerald-400 border-0",
  },
  needs_attention: {
    label: "Needs Attention",
    className: "bg-red-500/10 text-red-400 border-0",
  },
  stable: {
    label: "Stable",
    className: "bg-amber-500/10 text-amber-400 border-0",
  },
};

export function ComparisonStatusBadge({
  status,
}: ComparisonStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}

export const statusAccentColor: Record<ChangeStatus, string> = {
  improved: "border-l-emerald-400",
  needs_attention: "border-l-red-400",
  stable: "border-l-amber-400",
};