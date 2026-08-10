import { ShieldAlert, ArrowUp, ArrowDown, Minus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RiskComparison } from "@/types/comparison";

interface RiskComparisonCardProps {
  data: RiskComparison;
}

const riskBadgeStyles: Record<string, string> = {
  Low: "bg-emerald-500/10 text-emerald-400 border-0",
  Medium: "bg-amber-500/10 text-amber-400 border-0",
  High: "bg-red-500/10 text-red-400 border-0",
};

export function RiskComparisonCard({ data }: RiskComparisonCardProps) {
  const TrendIcon = data.trend === "improved" ? ArrowDown : data.trend === "needs_attention" ? ArrowUp : Minus;
  const trendColor =
    data.trend === "improved"
      ? "text-emerald-400"
      : data.trend === "needs_attention"
      ? "text-red-400"
      : "text-muted-foreground";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldAlert className="h-4 w-4 text-brand" />
          Risk Comparison
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap items-center gap-3">
          <Badge className={riskBadgeStyles[data.previous] ?? "bg-muted text-muted-foreground border-0"}>
            Previous: {data.previous}
          </Badge>

          <span className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
          </span>

          <Badge className={riskBadgeStyles[data.current] ?? "bg-muted text-muted-foreground border-0"}>
            Current: {data.current}
          </Badge>

          {data.changed && (
            <span className="text-xs font-medium text-muted-foreground">Risk level changed</span>
          )}
        </div>

        {/* Never show a risk badge without reasoning. */}
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
          <p className="text-xs font-medium text-muted-foreground">Reason for risk change</p>
          <p className="mt-1 text-sm text-foreground">{data.reason}</p>
        </div>
      </CardContent>
    </Card>
  );
}