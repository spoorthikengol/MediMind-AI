import { TrendingUp, TrendingDown, Minus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TestTrend } from "@/types/insights";

interface TrendSummaryListsProps {
  trends: Record<string, TestTrend>;
}

interface Bucket {
  title: string;
  icon: typeof TrendingUp;
  className: string;
  names: string[];
}

export function TrendSummaryLists({ trends }: TrendSummaryListsProps) {
  const improving: string[] = [];
  const worsening: string[] = [];
  const stable: string[] = [];

  // Insights tracks 4 states (improving/declining/needs_attention/stable);
  // this view only needs 3, so declining + needs_attention are merged
  // into "Worsening" here — purely a display simplification, the
  // underlying data/types are untouched.
  for (const [name, trend] of Object.entries(trends)) {
    if (trend.direction === "improving") improving.push(name);
    else if (trend.direction === "declining" || trend.direction === "needs_attention") worsening.push(name);
    else stable.push(name);
  }

  const buckets: Bucket[] = [
    { title: "Improving", icon: TrendingUp, className: "text-emerald-400", names: improving },
    { title: "Worsening", icon: TrendingDown, className: "text-red-400", names: worsening },
    { title: "Stable", icon: Minus, className: "text-muted-foreground", names: stable },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {buckets.map((bucket) => {
        const Icon = bucket.icon;
        return (
          <Card key={bucket.title}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-sm ${bucket.className}`}>
                <Icon className="h-4 w-4" />
                {bucket.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bucket.names.length > 0 ? (
                <ul className="space-y-1.5">
                  {bucket.names.map((name) => (
                    <li key={name} className="text-sm text-foreground">
                      {name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">None</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}