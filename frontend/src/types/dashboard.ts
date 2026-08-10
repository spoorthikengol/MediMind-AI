/**
 * Types for the /dashboard/ API response.
 * Field names match exactly what the backend already returns
 * (see api.getDashboard() in lib/api.ts) — nothing here is invented.
 */

export interface HealthHistoryPoint {
  report: string;
  score: number;
}

export interface RecentReportSummary {
  id: number;
  file_name: string;
  created_at: string;
  health_score: number;
  /** Not currently returned by /dashboard/ — render only if present. */
  risk_level?: string;
  /** Not currently returned by /dashboard/ — render only if present. */
  overall_status?: string;
}

export interface DashboardData {
  user_name: string;
  total_reports: number;
  latest_health_score: number;
  average_health_score: number;
  highest_health_score: number;
  lowest_health_score: number;
  healthy_reports: number;
  abnormal_reports: number;
  health_history: HealthHistoryPoint[];
  health_trend: string;
  last_uploaded: string;
  overall_status: string;
  risk_level: string;
  recent_reports: RecentReportSummary[];
}

export type TrendDirection = "up" | "down" | "flat";