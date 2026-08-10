import { Droplets, Dumbbell, Moon, Stethoscope } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecommendationCardProps {
  /** Real text from the backend's health_trend field. */
  todaysRecommendation: string;
  /**
   * None of these four are returned by /dashboard/ today. Pass them
   * in once a real endpoint exists — until then this card shows
   * general guidance copy rather than fabricated numbers.
   */
  nextSuggestedTest?: string;
  waterIntake?: string;
  exercise?: string;
  sleep?: string;
}

export function RecommendationCard({
  todaysRecommendation,
  nextSuggestedTest,
  waterIntake,
  exercise,
  sleep,
}: RecommendationCardProps) {
  const rows = [
    {
      icon: Stethoscope,
      label: "Next Suggested Test",
      value: nextSuggestedTest ?? "Follow up per your last report's recommendations",
    },
    {
      icon: Droplets,
      label: "Water Intake",
      value: waterIntake ?? "Stay consistently hydrated through the day",
    },
    {
      icon: Dumbbell,
      label: "Exercise",
      value: exercise ?? "Keep up regular light-to-moderate activity",
    },
    {
      icon: Moon,
      label: "Sleep",
      value: sleep ?? "Aim for consistent, restful sleep",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Recommendation</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {todaysRecommendation && (
          <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 text-sm text-foreground">
            {todaysRecommendation}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <div
                key={row.label}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {row.label}
                  </p>
                  <p className="mt-0.5 text-sm text-foreground">{row.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}