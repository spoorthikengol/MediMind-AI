import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TestTrend, TrendDirection } from "@/types/insights";

interface TrendGridProps {
  trends: Record<string, TestTrend>;
}

const directionConfig: Record<
  TrendDirection,
  { icon: typeof TrendingUp; label: string; className: string }
> = {
  improving: { icon: TrendingUp, label: "Improving", className: "text-emerald-400 bg-emerald-500/10" },
  declining: { icon: TrendingDown, label: "Declining", className: "text-red-400 bg-red-500/10" },
  stable: { icon: Minus, label: "Stable", className: "text-muted-foreground bg-white/5" },
  needs_attention: { icon: AlertTriangle, label: "Needs Attention", className: "text-amber-400 bg-amber-500/10" },
};

export function TrendGrid({ trends }: TrendGridProps) {
  const entries = Object.entries(trends);

  if (entries.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Health Trend Analysis</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {entries.map(([testName, trend], i) => {
            const config = directionConfig[trend.direction];
            const Icon = config.icon;

            return (
              <motion.div
                key={testName}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{testName}</p>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-md ${config.className}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                </div>

                <p className="mt-2 text-lg font-semibold text-foreground">
                  {trend.latest_value}
                </p>

                <p className={`mt-0.5 text-xs font-medium ${config.className.split(" ")[0]}`}>
                  {config.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}