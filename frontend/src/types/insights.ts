export type TrendDirection = "improving" | "declining" | "stable" | "needs_attention";

export interface ScoreEvolution {
  current: number;
  previous: number;
  best: number;
  average: number;
  improvement_pct: number | null;
}

export interface RiskAnalysis {
  current: string;
  previous: string;
  highest: string;
  lowest: string;
  trend: "improving" | "worsening" | "stable";
}

export interface TestTrend {
  direction: TrendDirection;
  latest_value: number;
  previous_value: number | null;
  data_points: number;
}

export interface InsightCard {
  type: string;
  icon: string;
  title: string;
  description: string;
}

export interface RecommendationsPayload {
  exercise: string[];
  nutrition: string[];
  hydration: string[];
  sleep: string[];
  follow_up_tests: string[];
  doctor_visit: string[];
}

export interface HistoryPoint {
  report_id: number;
  date: string;
  health_score: number;
  risk_level: string;
}

/** Discriminated union — every /insights* endpoint returns one of these two shapes. */
export type NotEnoughData = {
  has_enough_data: false;
  message: string;
};

export type FullInsightsResponse = {
  has_enough_data: true;
  reports_analyzed: number;
  score_evolution: ScoreEvolution;
  risk_analysis: RiskAnalysis | null;
  trends: Record<string, TestTrend>;
  summary: string;
  cards: InsightCard[];
};

export type TrendsResponse = {
  has_enough_data: true;
  trends: Record<string, TestTrend>;
};

export type RecommendationsResponse = {
  has_enough_data: true;
  recommendations: RecommendationsPayload;
};

export type HistoryResponse = {
  has_enough_data: true;
  history: HistoryPoint[];
};