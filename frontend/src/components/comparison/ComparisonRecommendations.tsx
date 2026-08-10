import type { LucideIcon } from "lucide-react";
import { Salad, Droplets, FlaskConical, Stethoscope, Activity } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ComparisonRecommendation, Priority } from "@/types/comparison";

interface ComparisonRecommendationsProps {
  recommendations: ComparisonRecommendation[];
}

const categoryIcons: Record<string, LucideIcon> = {
  Nutrition: Salad,
  Hydration: Droplets,
  "Follow-up": FlaskConical,
  "Doctor Visit": Stethoscope,
  Lifestyle: Activity,
};

const priorityStyles: Record<Priority, string> = {
  High: "bg-red-500/10 text-red-400 border-0",
  Medium: "bg-amber-500/10 text-amber-400 border-0",
  Low: "bg-emerald-500/10 text-emerald-400 border-0",
};

export function ComparisonRecommendations({ recommendations }: ComparisonRecommendationsProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">AI Recommendations</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec, i) => {
            const Icon = categoryIcons[rec.category] ?? Activity;
            return (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">{rec.category}</p>
                      <p className="text-sm font-medium text-foreground">{rec.recommendation}</p>
                    </div>
                  </div>

                  <Badge className={priorityStyles[rec.priority]}>{rec.priority} priority</Badge>
                </div>

                <div className="mt-3 space-y-1.5 border-t border-white/5 pt-3 pl-10">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">Why: </span>
                    {rec.reason}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">Expected benefit: </span>
                    {rec.expected_benefit}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}