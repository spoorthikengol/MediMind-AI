import type { LucideIcon } from "lucide-react";
import { Salad, Activity, Droplets, Moon, FlaskConical, Stethoscope } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecommendationsPayload } from "@/types/insights";

interface SmartRecommendationsProps {
  data: RecommendationsPayload;
}

interface Category {
  key: keyof RecommendationsPayload;
  icon: LucideIcon;
  title: string;
}

const categories: Category[] = [
  { key: "exercise", icon: Activity, title: "Exercise" },
  { key: "nutrition", icon: Salad, title: "Nutrition" },
  { key: "hydration", icon: Droplets, title: "Hydration" },
  { key: "sleep", icon: Moon, title: "Sleep" },
  { key: "follow_up_tests", icon: FlaskConical, title: "Follow-up Tests" },
  { key: "doctor_visit", icon: Stethoscope, title: "Doctor Visit" },
];

export function SmartRecommendations({ data }: SmartRecommendationsProps) {
  // Only show categories that actually have content — follow_up_tests
  // and doctor_visit are often empty when nothing's flagged, and an
  // empty card is just noise.
  const activeCategories = categories.filter((c) => (data[c.key] ?? []).length > 0);

  if (activeCategories.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Smart Recommendations</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {activeCategories.map((category) => {
            const Icon = category.icon;
            const items = data[category.key];

            return (
              <div
                key={category.key}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-sm font-medium text-foreground">{category.title}</p>
                </div>

                <ul className="space-y-1 pl-1">
                  {items.map((item, i) => (
                    <li key={i} className="text-xs leading-relaxed text-muted-foreground">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}