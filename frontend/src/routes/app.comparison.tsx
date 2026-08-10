import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, GitCompare, Upload, TrendingUpDown } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";

import { ComparisonSkeleton } from "@/components/comparison/ComparisonSkeleton";
import { ProgressionHeadline } from "@/components/comparison/ProgressionHeadline";
import { ProgressionTimeline } from "@/components/comparison/ProgressionTimeline";
import { TrendSummaryLists } from "@/components/comparison/TrendSummaryLists";
import { HeadlineTimelineCard } from "@/components/comparison/HeadlineTimelineCard";
import { AIComparisonSummary } from "@/components/comparison/AIComparisonSummary";
import { ComparisonHighlights } from "@/components/comparison/ComparisonHighlights";
import { ScoreComparisonCard } from "@/components/comparison/ScoreComparisonCard";
import { RiskComparisonCard } from "@/components/comparison/RiskComparisonCard";
import { ScoreTrendChart } from "@/components/comparison/ScoreTrendChart";
import { ParameterDeltaChart } from "@/components/comparison/ParameterDeltaChart";
import { ParameterComparisonTable } from "@/components/comparison/ParameterComparisonTable";
import { ComparisonRecommendations } from "@/components/comparison/ComparisonRecommendations";

import { useHealthInsights } from "@/hooks/useHealthInsights";
import { api } from "@/lib/api";
import { hasComparisonData } from "@/types/comparison";
import type { ComparisonResult } from "@/types/comparison";
import type { HistoryResponse, NotEnoughData } from "@/types/insights";

type HistoryResult = HistoryResponse | NotEnoughData;

export const Route = createFileRoute("/app/comparison")({
  component: ComparisonPage,
});

interface ReportOption {
  id: number;
  file_name: string;
  created_at: string;
}

function formatDate(value: string): string {
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function ComparisonPage() {
  const insights = useHealthInsights();

  const [historyData, setHistoryData] = useState<HistoryResult | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const fetchHistory = useCallback(() => {
    setHistoryLoading(true);
    setHistoryError(null);

    api
      .getInsightHistory()
      .then((res: HistoryResult) => setHistoryData(res))
      .catch((err) => setHistoryError(err?.message || "Unable to load health progression."))
      .finally(() => setHistoryLoading(false));
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const [reports, setReports] = useState<ReportOption[]>([]);
  const [aId, setAId] = useState<number | null>(null);
  const [bId, setBId] = useState<number | null>(null);

  const [data, setData] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastComparedAt, setLastComparedAt] = useState<string>("");

  const loadInitial = useCallback(() => {
    setLoading(true);
    setError(null);

    Promise.all([api.getHistory(), api.compareReports()])
      .then(([history, comparison]: [ReportOption[], ComparisonResult]) => {
        setReports(history);
        setData(comparison);
        setLastComparedAt(new Date().toLocaleString(undefined, { hour: "numeric", minute: "2-digit", month: "short", day: "numeric" }));
        if (comparison.previous_report_id && comparison.latest_report_id) {
          setAId(comparison.previous_report_id);
          setBId(comparison.latest_report_id);
        }
      })
      .catch((err) => {
        setError(err?.message || "Unable to load report comparison.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const runComparison = useCallback((idA: number, idB: number) => {
    setComparing(true);
    setError(null);

    api
      .compareReports(idA, idB)
      .then((res: ComparisonResult) => {
        setData(res);
        setLastComparedAt(new Date().toLocaleString(undefined, { hour: "numeric", minute: "2-digit", month: "short", day: "numeric" }));
      })
      .catch((err) => {
        setError(err?.message || "Unable to compare these reports.");
      })
      .finally(() => {
        setComparing(false);
      });
  }, []);
  // Routes a timeline click into the existing Baseline/Compare-to
// selectors — reuses handlePick/runComparison as-is. First click sets
// Baseline; a second, different click sets Compare To and runs the
// comparison via handlePick's existing auto-run logic. A third click
// starts a fresh pair rather than endlessly extending the selection.
const handleTimelineSelect = (id: number) => {
  if (aId === null || bId !== null) {
    handlePick("a", id);
    setBId(null);
  } else if (id !== aId) {
    handlePick("b", id);
  }
};
  const handlePick = (which: "a" | "b", id: number) => {
    const nextA = which === "a" ? id : aId;
    const nextB = which === "b" ? id : bId;

    if (which === "a") setAId(id);
    else setBId(id);

    if (nextA && nextB && nextA !== nextB) {
      runComparison(nextA, nextB);
    }
  };

  if (loading) {
    return <ComparisonSkeleton />;
  }

  if (error && !data) {
    return (
      <ErrorState
        title="Failed to load comparison"
        message={error}
        onRetry={loadInitial}
        fullScreen
      />
    );
  }

  if (reports.length < 2) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          icon={GitCompare}
          title="Not enough reports yet"
          description="Upload at least two medical reports to compare how your health markers have changed over time."
          action={
            <Button asChild size="sm">
              <Link to="/app/upload">
                <Upload className="mr-2 h-3.5 w-3.5" />
                Upload a report
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Report Comparison
        </h1>
        <p className="mt-1 text-muted-foreground">
          Choose any two reports to see exactly what changed, and why.
        </p>
      </div>

      {/* ===== Timeline-first health progression (uses full report
          history via the existing Insights API — independent of
          which two reports are picked below) ===== */}
      {(insights.loading || historyLoading) ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading health progression">
          <div className="h-20 animate-pulse rounded-xl bg-white/[0.04]" />
          <div className="h-32 animate-pulse rounded-xl bg-white/[0.04]" />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="h-28 animate-pulse rounded-xl bg-white/[0.04]" />
            <div className="h-28 animate-pulse rounded-xl bg-white/[0.04]" />
            <div className="h-28 animate-pulse rounded-xl bg-white/[0.04]" />
          </div>
        </div>
      ) : insights.error || historyError ? (
        <ErrorState
          message={insights.error || historyError || "Unable to load health progression."}
          onRetry={() => {
            insights.refetch();
            fetchHistory();
          }}
        />
      ) : !insights.data?.has_enough_data || !historyData?.has_enough_data ? (
        <EmptyState
          icon={TrendingUpDown}
          title="Not enough reports for a timeline"
          description="Upload another report to see your health progression."
        />
      ) : (
        <>
          <ProgressionHeadline
            scoreEvolution={insights.data.score_evolution}
            trends={insights.data.trends}
          />
          <ProgressionTimeline history={historyData.history} />
          <TrendSummaryLists trends={insights.data.trends} />
        </>
      )}

      {/* ===== Existing Smart Comparison (pick any two specific reports) — unchanged ===== */}

      <div className="grid gap-4 md:grid-cols-2">
        <ReportPicker label="Previous Report" reports={reports} value={aId} onChange={(id) => handlePick("a", id)} />
        <ReportPicker label="Current Report" reports={reports} value={bId} onChange={(id) => handlePick("b", id)} />
      </div>

      {comparing ? (
        <ComparisonSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => aId && bId && runComparison(aId, bId)} />
      ) : data && hasComparisonData(data) ? (
        <>
          {data.type_mismatch && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <p className="text-sm text-amber-200">
                These reports are different types ({data.type_mismatch.previous_type} vs{" "}
                {data.type_mismatch.latest_type}) — results may not be directly comparable.
              </p>
            </div>
          )}

          <HeadlineTimelineCard
            headline={data.ai_headline}
            confidence={data.ai_confidence}
            reportsCompared={2}
            lastComparedAt={lastComparedAt}
            previousScore={data.score_comparison.previous}
            currentScore={data.score_comparison.current}
            trend={data.score_comparison.trend}
            previousLabel={`Report #${data.previous_report_id}`}
            currentLabel={`Report #${data.latest_report_id}`}
            highlights={data.highlights}
          />

          <AIComparisonSummary
            bullets={data.summary_bullets}
            parameters={data.parameters}
            scoreComparison={data.score_comparison}
            loading={false}
            error={null}
            onRetry={() => aId && bId && runComparison(aId, bId)}
            reportsSelected
          />

          <ComparisonHighlights highlights={data.highlights} />

          <div className="grid gap-6 lg:grid-cols-2">
            <ScoreComparisonCard data={data.score_comparison} />
            {data.risk_comparison && <RiskComparisonCard data={data.risk_comparison} />}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ScoreTrendChart
              previousScore={data.score_comparison.previous}
              currentScore={data.score_comparison.current}
              previousLabel={`Report #${data.previous_report_id}`}
              currentLabel={`Report #${data.latest_report_id}`}
            />
            <ParameterDeltaChart parameters={data.parameters} />
          </div>

          <ParameterComparisonTable parameters={data.parameters} />

          <ComparisonRecommendations recommendations={data.recommendations} />
        </>
      ) : null}
    </div>
  );
}

function ReportPicker({
  label,
  reports,
  value,
  onChange,
}: {
  label: string;
  reports: ReportOption[];
  value: number | null;
  onChange: (id: number) => void;
}) {
  return (
    <Card className="card-premium border-0 shadow-card">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand">
          <GitCompare className="h-3.5 w-3.5" /> {label}
        </div>
        <div className="mt-3">
          <Select value={value ? String(value) : undefined} onValueChange={(v) => onChange(Number(v))}>
            <SelectTrigger className="transition-shadow focus:shadow-[0_0_0_3px_hsl(var(--brand)/0.15)]">
              <SelectValue placeholder="Select a report" />
            </SelectTrigger>
            <SelectContent>
              {reports.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  {r.file_name} · {formatDate(r.created_at)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}