import { ShieldAlert, TrendingUp, TrendingDown, Minus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RiskAnalysis } from "@/types/insights";

interface RiskAnalysisCardProps {
  data: RiskAnalysis;
}

const riskBadgeStyles: Record<string, string> = {
  Low: "bg-emerald-500/10 text-emerald-400 border-0",
  Medium: "bg-amber-500/10 text-amber-400 border-0",
  High: "bg-red-500/10 text-red-400 border-0",
};

const trendConfig = {
  improving: { icon: TrendingUp, className: "text-emerald-400", label: "Improving" },
  worsening: { icon: TrendingDown, className: "text-red-400", label: "Worsening" },
  stable: { icon: Minus, className: "text-muted-foreground", label: "Stable" },
};

export function RiskAnalysisCard({ data }: RiskAnalysisCardProps) {
  const trend = trendConfig[data.trend];
  const TrendIcon = trend.icon;

  const rows = [
    { label: "Current", value: data.current },
    { label: "Previous", value: data.previous },
    { label: "Highest", value: data.highest },
    { label: "Lowest", value: data.lowest },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldAlert className="h-4 w-4 text-brand" />
          Risk Analysis
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2">
          <Badge className={riskBadgeStyles[data.current] ?? "bg-muted text-muted-foreground border-0"}>
            {data.current} Risk
          </Badge>
          <span className={`flex items-center gap-1 text-sm font-medium ${trend.className}`}>
            <TrendIcon className="h-4 w-4" />
            {trend.label}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {rows.map((row) => (
            <div key={row.label} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <p className="text-xs text-muted-foreground">{row.label}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{row.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}