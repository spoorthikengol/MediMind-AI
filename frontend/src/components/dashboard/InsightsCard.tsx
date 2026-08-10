import { TrendingUp, AlertTriangle, ShieldAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "@/types/dashboard";

interface InsightsCardProps {
  data: DashboardData;
}

interface Insight {
  icon: typeof TrendingUp;
  tone: "positive" | "warning" | "neutral";
  text: string;
}

const toneStyles: Record<Insight["tone"], string> = {
  positive: "bg-emerald-500/10 text-emerald-400",
  warning: "bg-red-500/10 text-red-400",
  neutral: "bg-brand/10 text-brand",
};

/**
 * Builds a short list of real, data-backed insight bullets from the
 * existing dashboard payload. No AI text is dumped here, and nothing
 * is invented — every bullet traces back to a field already returned
 * by /dashboard/.
 */
function buildInsights(data: DashboardData): Insight[] {
  const insights: Insight[] = [];

  if (data.health_trend) {
    insights.push({
      icon: TrendingUp,
      tone: "positive",
      text: data.health_trend,
    });
  }

  if (data.abnormal_reports > 0) {
    insights.push({
      icon: AlertTriangle,
      tone: "warning",
      text: `${data.abnormal_reports} of ${data.total_reports} reports flagged abnormal values — worth a closer look.`,
    });
  }

  if (data.risk_level) {
    insights.push({
      icon: ShieldAlert,
      tone: data.risk_level.toLowerCase() === "low" ? "positive" : "warning",
      text: `Current risk level: ${data.risk_level}.`,
    });
  }

  return insights;
}

export function InsightsCard({ data }: InsightsCardProps) {
  const insights = buildInsights(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Insights</CardTitle>
      </CardHeader>

      <CardContent>
        {insights.length > 0 ? (
          <ul className="space-y-3">
            {insights.map((insight, i) => {
              const Icon = insight.icon;
              return (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3.5"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneStyles[insight.tone]}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="pt-1 text-sm leading-relaxed text-muted-foreground">
                    {insight.text}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Upload a report to generate AI insights.
          </p>
        )}
      </CardContent>
    </Card>
  );
}