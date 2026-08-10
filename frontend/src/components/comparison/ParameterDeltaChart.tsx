import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ParameterComparison } from "@/types/comparison";

interface ParameterDeltaChartProps {
  parameters: ParameterComparison[];
}

const statusColor: Record<string, string> = {
  improved: "#34d399",
  needs_attention: "#f87171",
  stable: "#fbbf24",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const value = payload[0].value;

  return (
    <div className="rounded-lg border border-white/10 bg-card/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="font-medium text-foreground">{label}</p>
      <p className="mt-0.5 text-muted-foreground">
        Change: <span className="font-medium text-foreground">{value > 0 ? "+" : ""}{value}</span>
      </p>
    </div>
  );
}

export function ParameterDeltaChart({ parameters }: ParameterDeltaChartProps) {
  // Only chart parameters with a meaningful numeric change — a flat
  // bar chart of every stable-at-zero parameter is noise.
  const data = parameters
    .filter((p) => p.difference !== 0)
    .map((p) => ({ name: p.name, difference: p.difference, status: p.status }));

  if (data.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Parameter Change</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                angle={-35}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="difference" radius={[4, 4, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={statusColor[entry.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}