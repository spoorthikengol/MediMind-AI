import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "brand",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "brand" | "success" | "warning" | "destructive";
}) {
  const toneMap = {
    brand: "bg-brand/10 text-brand",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  } as const;

  return (
    <Card className="card-premium border-0 shadow-card overflow-hidden relative group hover:-translate-y-0.5 transition">
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-brand/10 blur-3xl group-hover:bg-ai-purple/20 transition" />
      <CardContent className="p-5 relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="mt-2 text-3xl font-semibold font-display tracking-tight text-gradient">{value}</p>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
          </div>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-white/10 shadow-soft", toneMap[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}