import { TrendingUp, TrendingDown, Minus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScoreEvolution } from "@/types/insights";

interface ScoreEvolutionCardProps {
  data: ScoreEvolution;
}

export function ScoreEvolutionCard({ data }: ScoreEvolutionCardProps) {
  const improving = data.current > data.previous;
  const declining = data.current < data.previous;

  const TrendIcon = improving ? TrendingUp : declining ? TrendingDown : Minus;
  const trendColor = improving
    ? "text-emerald-400"
    : declining
    ? "text-red-400"
    : "text-muted-foreground";

  const rows = [
    { label: "Current", value: data.current },
    { label: "Previous", value: data.previous },
    { label: "Best", value: data.best },
    { label: "Average", value: data.average },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Health Score Evolution</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-semibold text-foreground">{data.current}</span>
          <span className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            {data.improvement_pct !== null
              ? `${data.improvement_pct > 0 ? "+" : ""}${data.improvement_pct}% overall`
              : "No change yet"}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {rows.map((row) => (
            <div key={row.label} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <p className="text-xs text-muted-foreground">{row.label}</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{row.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}