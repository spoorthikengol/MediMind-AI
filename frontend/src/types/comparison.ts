export type ChangeStatus = "improved" | "needs_attention" | "stable";
export type Confidence = "High" | "Medium" | "Low";
export type Priority = "High" | "Medium" | "Low";

export interface DrivingFactor {
  name: string;
  direction: "up" | "down";
}

export interface ParameterComparison {
  name: string;
  previous_value: number;
  current_value: number;
  difference: number;
  percent_change: number | null;
  reference_range: string | null;
  status: ChangeStatus;
  clinical_meaning: string | null;
  ai_explanation: string;
}

export interface ScoreComparison {
  previous: number;
  current: number;
  difference: number;
  percent_change: number | null;
  trend: ChangeStatus;
  driven_by: DrivingFactor[];
  reason: string;
}

export interface RiskComparison {
  previous: string;
  current: string;
  changed: boolean;
  trend: ChangeStatus;
  reason: string;
}

export interface TypeMismatch {
  previous_type: string;
  latest_type: string;
}

export interface ComparisonHighlight {
  type: string;
  icon: string;
  title: string;
  description: string;
  is_placeholder: boolean;
}

export interface ComparisonRecommendation {
  category: string;
  reason: string;
  recommendation: string;
  expected_benefit: string;
  priority: Priority;
}

export interface SummaryBullet {
  text: string;
  confidence: Confidence;
  supporting_marker: string | null;
}

export interface ComparisonResponse {
  previous_report_id: number;
  latest_report_id: number;
  comparison: string[];
  ai_headline: string;
  ai_confidence: Confidence;
  parameters: ParameterComparison[];
  score_comparison: ScoreComparison;
  risk_comparison: RiskComparison | null;
  type_mismatch: TypeMismatch | null;
  summary_bullets: SummaryBullet[];
  highlights: ComparisonHighlight[];
  recommendations: ComparisonRecommendation[];
}

export interface NotEnoughReportsResponse {
  previous_report_id: 0;
  latest_report_id: 0;
  comparison: string[];
}

export type ComparisonResult = ComparisonResponse | NotEnoughReportsResponse;

export function hasComparisonData(result: ComparisonResult): result is ComparisonResponse {
  return "parameters" in result;
}