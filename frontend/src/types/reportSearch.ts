export type SortOption = "newest" | "oldest" | "score_desc" | "score_asc" | "name_asc" | "name_desc";
export type QuickRange = "today" | "week" | "month";

export interface ReportSearchItem {
  id: number;
  file_name: string;
  patient_name: string;
  report_type: string | null;
  health_score: number;
  overall_status: string;
  risk_level: string;
  summary_snippet: string | null;
  created_at: string;
}

export interface ReportFilterOptions {
  risk_levels: string[];
  overall_statuses: string[];
  report_types: string[];
}

export interface ReportSearchResponse {
  items: ReportSearchItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  filter_options: ReportFilterOptions;
}

export interface ReportSearchParams {
  q?: string;
  risk_level?: string[];
  overall_status?: string[];
  report_type?: string[];
  min_score?: number;
  max_score?: number;
  date_from?: string;
  date_to?: string;
  quick_range?: QuickRange;
  sort?: SortOption;
  page?: number;
  page_size?: 10 | 20 | 50 | 100;
}

export const DEFAULT_SEARCH_PARAMS: ReportSearchParams = {
  sort: "newest",
  page: 1,
  page_size: 20,
};