import React from "react";
import {
  FileText,
  Activity,
  Calendar,
  Eye,
  GitCompare,
  Download,
} from "lucide-react";

import type { ReportSearchItem } from "@/types/reportSearch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ReportCardProps {
  report: ReportSearchItem;
  onView: (id: number) => void;
  onCompare: (id: number) => void;
  onDownload?: (id: number) => void;
}

const riskBadgeColor: Record<string, string> = {
  Low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Moderate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  High: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Critical: "bg-red-500/10 text-red-400 border-red-500/20",
};

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onView,
  onCompare,
  onDownload,
}) => {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 transition hover:border-slate-700">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-cyan-400" />

            <h3 className="truncate text-sm font-semibold text-white">
              {report.file_name}
            </h3>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>{report.patient_name}</span>

            {report.report_type && (
              <>
                <span>•</span>
                <span>{report.report_type}</span>
              </>
            )}

            <span>•</span>

            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(report.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        <Badge
          variant="outline"
          className={`shrink-0 text-xs font-medium border ${
            riskBadgeColor[report.risk_level] ??
            "bg-slate-500/10 text-slate-300 border-slate-500/20"
          }`}
        >
          {report.risk_level} Risk
        </Badge>
      </div>

      {/* Health Score */}
      <div className="my-4 flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/50 p-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400" />

          <span className="text-xs font-medium text-slate-300">
            Health Score
          </span>
        </div>

        <span className="font-mono text-lg font-bold text-white">
          {report.health_score}
        </span>
      </div>

      {/* Overall Status */}
      <div className="mb-3">
        <span className="text-xs text-slate-400">
          Status:{" "}
        </span>

        <span className="text-xs font-medium text-slate-200">
          {report.overall_status}
        </span>
      </div>

      {/* AI Summary */}
      {report.summary_snippet && (
        <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-slate-400">
          {report.summary_snippet}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(report.id)}
          className="px-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <Eye className="mr-1 h-3.5 w-3.5" />
          View
        </Button>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCompare(report.id)}
            className="border-cyan-500/30 bg-cyan-500/10 px-2.5 text-xs text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-200"
          >
            <GitCompare className="mr-1 h-3.5 w-3.5" />
            Compare
          </Button>

          {onDownload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownload(report.id)}
              className="px-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Download Report"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};