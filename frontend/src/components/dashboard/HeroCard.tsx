import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Upload, Bot, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/progress-ring";

interface HeroCardProps {
  userName: string;
  healthScore: number;
  overallStatus: string;
  lastUploaded: string;
  /**
   * Short recommendation line, e.g. "Kidney health is improving.
   * Continue staying hydrated." Sourced from the backend's
   * health_trend field — nothing here is invented copy.
   */
  recommendation: string;
}

function formatLastUploaded(value: string): string {
  if (!value) return "No reports yet";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function HeroCard({
  userName,
  healthScore,
  overallStatus,
  lastUploaded,
  recommendation,
}: HeroCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="card-premium relative overflow-hidden border-white/10 p-6 sm:p-8">
        {/* Subtle brand gradient wash confined to the hero, per brief */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, #2563eb 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="relative flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-sm font-medium text-brand">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Welcome back
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {userName}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Status:{" "}
              <span className="font-medium text-foreground">
                {overallStatus}
              </span>{" "}
              · Last report {formatLastUploaded(lastUploaded)}
            </p>

            {recommendation && (
              <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
                {recommendation}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/app/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Report
                </Link>
              </Button>

              <Button variant="outline" asChild>
                <Link to="/app/assistant">
                  <Bot className="mr-2 h-4 w-4" />
                  Ask AI
                </Link>
              </Button>
            </div>
          </div>

          <div className="shrink-0">
            <ProgressRing
              value={healthScore}
              size={152}
              stroke={12}
              sublabel="Health Score"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}