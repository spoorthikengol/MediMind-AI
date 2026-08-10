import { Link } from "@tanstack/react-router";
import { FileText, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RecentReportSummary } from "@/types/dashboard";

interface RecentReportsProps {
  reports: RecentReportSummary[];
}

/**
 * The /dashboard/ endpoint doesn't currently return risk_level or
 * overall_status per report — only health_score. This is a purely
 * presentational fallback (not fabricated backend data) so the card
 * still shows a status badge until those fields are added upstream.
 */
function statusFromScore(score: number): { label: string; tone: string } {
  if (score >= 80) return { label: "Healthy", tone: "bg-emerald-500/10 text-emerald-400" };
  if (score >= 50) return { label: "Monitor", tone: "bg-amber-500/10 text-amber-400" };
  return { label: "At Risk", tone: "bg-red-500/10 text-red-400" };
}

function formatDate(value: string): string {
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function RecentReports({ reports }: RecentReportsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Reports</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/app/history">
            View all
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map((report, i) => {
              const status =
                report.overall_status && report.risk_level
                  ? { label: report.overall_status, tone: "bg-brand/10 text-brand" }
                  : statusFromScore(report.health_score);

              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/20"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      <FileText className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {report.file_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(report.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline">Score {report.health_score}</Badge>
                    <Badge className={status.tone}>{status.label}</Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/app/report/$id" params={{ id: report.id.toString() }}>
                        View
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No reports uploaded yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}