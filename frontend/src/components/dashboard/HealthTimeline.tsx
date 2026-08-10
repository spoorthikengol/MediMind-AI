import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HealthHistoryPoint } from "@/types/dashboard";

interface HealthTimelineProps {
  history: HealthHistoryPoint[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-card/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="font-medium text-foreground">{label}</p>
      <p className="mt-0.5 text-muted-foreground">
        Score: <span className="font-medium text-brand">{payload[0].value}</span>
      </p>
    </div>
  );
}

export function HealthTimeline({ history }: HealthTimelineProps) {
  // Only the latest 10 reports — a 60+ point line is noise, not a story.
  const recent = history.slice(-10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Timeline</CardTitle>
      </CardHeader>

      <CardContent>
        {recent.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recent} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="report"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 0, fill: "#2563eb" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Upload reports to start tracking your health timeline.
          </p>
        )}
      </CardContent>
    </Card>
  );
}