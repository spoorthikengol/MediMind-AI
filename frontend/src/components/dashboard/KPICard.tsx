import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

import { Card } from "@/components/ui/card";
import type { TrendDirection } from "@/types/dashboard";

interface KPICardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  description: string;
  trend?: TrendDirection;
  trendLabel?: string;
  delay?: number;
}

const trendStyles: Record<TrendDirection, string> = {
  up: "text-emerald-400",
  down: "text-red-400",
  flat: "text-muted-foreground",
};

const trendIcon: Record<TrendDirection, LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

export function KPICard({
  icon: Icon,
  title,
  value,
  description,
  trend,
  trendLabel,
  delay = 0,
}: KPICardProps) {
  const TrendIcon = trend ? trendIcon[trend] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      whileHover={{ y: -3 }}
    >
      <Card className="border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/20">
        <div className="flex items-start justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>

          {trend && TrendIcon && (
            <span
              className={`flex items-center gap-1 text-xs font-medium ${trendStyles[trend]}`}
            >
              <TrendIcon className="h-3 w-3" aria-hidden="true" />
              {trendLabel}
            </span>
          )}
        </div>

        <p className="mt-4 text-2xl font-semibold text-foreground">
          {value}
        </p>

        <p className="mt-1 text-sm font-medium text-foreground/80">
          {title}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </Card>
    </motion.div>
  );
}