import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScoreTrendChartProps {
  previousScore: number;
  currentScore: number;
  previousLabel: string;
  currentLabel: string;
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

export function ScoreTrendChart({
  previousScore,
  currentScore,
  previousLabel,
  currentLabel,
}: ScoreTrendChartProps) {
  const data = [
    { report: previousLabel, score: previousScore },
    { report: currentLabel, score: currentScore },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Health Score Trend</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
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
                dot={{ r: 5, strokeWidth: 0, fill: "#2563eb" }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}