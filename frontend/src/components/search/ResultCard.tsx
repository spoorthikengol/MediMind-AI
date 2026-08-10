import { Link } from "@tanstack/react-router";
import { FileText, GitCompare, Download, Eye } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { HighlightedText } from "./HighlightedText";
import { api } from "@/lib/api";
import type { ReportSearchItem } from "@/types/reportSearch";

interface ResultCardProps {
  report: ReportSearchItem;
  query: string | undefined;
}

const riskBadgeStyles: Record<string, string> = {
  Low: "bg-emerald-500/10 text-emerald-400 border-0",
  Medium: "bg-amber-500/10 text-amber-400 border-0",
  High: "bg-red-500/10 text-red-400 border-0",
};

function formatDate(value: string): string {
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function ResultCard({ report, query }: ResultCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="card-premium border-0 shadow-card">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <FileText className="h-4 w-4" />
              </span>

              <div>
                <p className="text-sm font-medium text-foreground">
                  <HighlightedText text={report.file_name} query={query} />
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {report.patient_name} · {formatDate(report.created_at)}
                </p>
                {report.report_type && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Detected: <span className="text-foreground">{report.report_type}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="outline">Score {report.health_score}</Badge>
              <Badge className={riskBadgeStyles[report.risk_level] ?? "bg-muted text-muted-foreground border-0"}>
                {report.risk_level}
              </Badge>
            </div>
          </div>

          {report.summary_snippet && (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              <HighlightedText text={report.summary_snippet} query={query} />
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/report/$id" params={{ id: String(report.id) }}>
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                View Report
              </Link>
            </Button>

            <Button variant="outline" size="sm" asChild>
              <Link to="/app/comparison">
                <GitCompare className="mr-1.5 h-3.5 w-3.5" />
                Compare
              </Link>
            </Button>

            <Button variant="outline" size="sm" onClick={() => api.downloadReport(report.id)}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}