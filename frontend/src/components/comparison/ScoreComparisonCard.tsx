import { ArrowUp, ArrowDown, Minus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScoreComparison } from "@/types/comparison";

interface ScoreComparisonCardProps {
  data: ScoreComparison;
}

export function ScoreComparisonCard({ data }: ScoreComparisonCardProps) {
  const TrendIcon = data.trend === "improved" ? ArrowUp : data.trend === "needs_attention" ? ArrowDown : Minus;
  const trendColor =
    data.trend === "improved"
      ? "text-emerald-400"
      : data.trend === "needs_attention"
      ? "text-red-400"
      : "text-muted-foreground";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Health Score Comparison</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Previous</p>
            <p className="text-2xl font-semibold text-foreground">{data.previous}</p>
          </div>

          <div className={`flex flex-col items-center ${trendColor}`}>
            <TrendIcon className="h-5 w-5" />
            <span className="text-xs font-medium">
              {data.difference > 0 ? "+" : ""}
              {data.difference}
            </span>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="text-2xl font-semibold text-foreground">{data.current}</p>
          </div>

          {data.percent_change !== null && (
            <div className={`ml-auto rounded-full px-2.5 py-1 text-xs font-medium ${trendColor} bg-white/5`}>
              {data.percent_change > 0 ? "+" : ""}
              {data.percent_change}%
            </div>
          )}
        </div>

        {/* Never show a score without explaining why. */}
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
          <p className="text-xs font-medium text-muted-foreground">Reason</p>
          <p className="mt-1 text-sm text-foreground">{data.reason}</p>

          {data.driven_by.length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-white/10 pt-3">
              {data.driven_by.map((factor) => (
                <li key={factor.name} className="flex items-center gap-1.5 text-sm text-foreground">
                  {factor.name}
                  {factor.direction === "up" ? (
                    <ArrowUp className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5 text-red-400" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}