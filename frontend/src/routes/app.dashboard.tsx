import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import {
  FileText,
  ShieldAlert,
  TrendingUp,
  Activity,
  Sparkles,
} from "lucide-react";

import { api } from "@/lib/api";

import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";

import { HeroCard } from "@/components/dashboard/HeroCard";
import { KPICard } from "@/components/dashboard/KPICard";
import { HealthTimeline } from "@/components/dashboard/HealthTimeline";
import { RecentReports } from "@/components/dashboard/RecentReports";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { QuickActionGrid } from "@/components/dashboard/QuickActionGrid";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";

import { InsightsSummaryCard } from "@/components/insights/InsightsSummaryCard";
import { ScoreEvolutionCard } from "@/components/insights/ScoreEvolutionCard";
import { RiskAnalysisCard } from "@/components/insights/RiskAnalysisCard";
import { TrendGrid } from "@/components/insights/TrendGrid";
import { SmartRecommendations } from "@/components/insights/SmartRecommendations";

import { useHealthInsights } from "@/hooks/useHealthInsights";

import type { DashboardData, TrendDirection } from "@/types/dashboard";

export const Route = createFileRoute("/app/dashboard")({
  component: Dashboard,
});

/* =========================================================
   SCORE TREND
========================================================= */

function computeScoreTrend(data: DashboardData): {
  direction: TrendDirection;
  label: string;
} {
  const history = data.health_history;

  if (!history || history.length < 2) {
    return {
      direction: "flat",
      label: "No trend yet",
    };
  }

  const latest = history[history.length - 1].score;
  const previous = history[history.length - 2].score;

  const diff = latest - previous;

  if (diff > 0) {
    return {
      direction: "up",
      label: `+${diff} pts`,
    };
  }

  if (diff < 0) {
    return {
      direction: "down",
      label: `${diff} pts`,
    };
  }

  return {
    direction: "flat",
    label: "No change",
  };
}

/* =========================================================
   AI HEALTH INSIGHTS
========================================================= */

function HealthInsightsSection() {
  const { data, loading, error, refetch } = useHealthInsights();

  return (
    <section className="space-y-4">
      {/* Section heading */}

      <div className="flex items-center gap-2 px-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10">
          <Sparkles className="h-4 w-4 text-brand" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            AI Health Insights
          </h2>

          <p className="text-xs text-muted-foreground">
            Insights generated from your report history
          </p>
        </div>
      </div>

      {/* Loading */}

      {loading ? (
        <div className="rounded-2xl border border-border/60 bg-card/60 p-6">
          <LoadingState label="Analyzing your report history..." />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-border/60 bg-card/60 p-6">
          <ErrorState
            message={error}
            onRetry={refetch}
          />
        </div>
      ) : !data?.has_enough_data ? (
        <div className="rounded-2xl border border-border/60 bg-card/60 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {data?.message ??
              "Upload at least two reports to unlock AI health insights."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <InsightsSummaryCard
            summary={data.summary}
            cards={data.cards}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <ScoreEvolutionCard
              data={data.score_evolution}
            />

            {data.risk_analysis && (
              <RiskAnalysisCard
                data={data.risk_analysis}
              />
            )}
          </div>

          <TrendGrid trends={data.trends} />
        </div>
      )}
    </section>
  );
}

/* =========================================================
   HISTORY RECOMMENDATIONS
========================================================= */

function HistoryRecommendationsSection() {
  const [recs, setRecs] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getInsightRecommendations()
      .then(setRecs)
      .catch(() => setRecs(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !recs?.has_enough_data) {
    return null;
  }

  return (
    <section className="space-y-4">
      <SmartRecommendations data={recs} />
    </section>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(() => {
    setLoading(true);
    setError(null);

    api
      .getDashboard()
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setError(
          err?.message || "Unable to load dashboard data."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !data) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        message={
          error || "Something unexpected happened."
        }
        onRetry={fetchDashboard}
        fullScreen
      />
    );
  }

  const scoreTrend = computeScoreTrend(data);

  return (
    <div className="w-full space-y-7 pb-8">

      {/* ===================================================
          SECTION 1 — HERO
      =================================================== */}

      <section>
        <HeroCard
          userName={data.user_name}
          healthScore={data.latest_health_score || 0}
          overallStatus={data.overall_status}
          lastUploaded={data.last_uploaded}
          recommendation={data.health_trend}
        />
      </section>

      {/* ===================================================
          SECTION 2 — KPI CARDS
      =================================================== */}

      <section className="space-y-3">
        <div className="px-1">
          <h2 className="text-sm font-semibold text-foreground">
            Health Overview
          </h2>

          <p className="mt-0.5 text-xs text-muted-foreground">
            A quick summary of your latest health indicators
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            icon={Activity}
            title="Health Score"
            value={data.latest_health_score}
            description={`Average: ${data.average_health_score}`}
            trend={scoreTrend.direction}
            trendLabel={scoreTrend.label}
            delay={0}
          />

          <KPICard
            icon={ShieldAlert}
            title="Current Risk"
            value={data.risk_level}
            description={`${data.abnormal_reports} flagged reports`}
            delay={0.05}
          />

          <KPICard
            icon={TrendingUp}
            title="Health Trend"
            value={data.overall_status}
            description={data.health_trend}
            delay={0.1}
          />

          <KPICard
            icon={FileText}
            title="Reports Uploaded"
            value={data.total_reports}
            description={`${data.healthy_reports} healthy · ${data.abnormal_reports} abnormal`}
            delay={0.15}
          />
        </div>
      </section>

      {/* ===================================================
          SECTION 3 — HEALTH TIMELINE
      =================================================== */}

      <section>
        <HealthTimeline
          history={data.health_history}
        />
      </section>

      {/* ===================================================
          SECTION 4 — HEALTH RECOMMENDATION
      =================================================== */}

      <section>
        <RecommendationCard
          todaysRecommendation={data.health_trend}
        />
      </section>

      {/* ===================================================
          SECTION 5 + 6 — REPORTS & ACTIVITY
      =================================================== */}

      <section>
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentReports
            reports={data.recent_reports}
          />

          <ActivityTimeline
            reports={data.recent_reports}
          />
        </div>
      </section>

      {/* ===================================================
          SECTION 7 — AI HEALTH INSIGHTS
      =================================================== */}

      <HealthInsightsSection />

      {/* ===================================================
          SECTION 8 — SMART RECOMMENDATIONS
      =================================================== */}

      <HistoryRecommendationsSection />

      {/* ===================================================
          SECTION 9 — QUICK ACTIONS
      =================================================== */}

      <section className="space-y-3">
        <div className="px-1">
          <h2 className="text-sm font-semibold text-foreground">
            Quick Actions
          </h2>

          <p className="mt-0.5 text-xs text-muted-foreground">
            Quickly access the tools you use most
          </p>
        </div>

        <QuickActionGrid />
      </section>

    </div>
  );
}