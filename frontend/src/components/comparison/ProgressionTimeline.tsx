import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HistoryPoint } from "@/types/insights";

interface ProgressionTimelineProps {
  history: HistoryPoint[];
}

function formatShortDate(value: string): string {
  const date = new Date(value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusColor(score: number): string {
  if (score >= 80) return "border-emerald-400 bg-emerald-500/10 text-emerald-400";
  if (score >= 50) return "border-amber-400 bg-amber-500/10 text-amber-400";
  return "border-red-400 bg-red-500/10 text-red-400";
}

export function ProgressionTimeline({ history }: ProgressionTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Health Score Timeline</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max items-start gap-1 px-1">
            
            {history.map((point, i) => {
              const isCurrent = i === history.length - 1;

              return (
                <div key={point.report_id} className="flex items-start">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.06 }}
                    className="flex w-24 flex-col items-center gap-2 text-center"
                  >
                    <span className="text-[11px] text-muted-foreground">
                      {isCurrent ? "Current" : formatShortDate(point.date)}
                    </span>

                    <span
                      className={`flex h-14 w-14 items-center justify-center rounded-full border-2 text-lg font-semibold transition-transform ${statusColor(
                        point.health_score
                      )} ${isCurrent ? "scale-110 ring-2 ring-brand/40" : ""}`}
                    >
                      {point.health_score}
                    </span>
                  </motion.div>

                  {i < history.length - 1 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.06 + 0.1 }}
                      style={{ transformOrigin: "left" }}
                      className="mt-7 h-px w-8 bg-white/15"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}