export type ReportType =
  | "All"
  | "Blood Test"
  | "MRI"
  | "CT Scan"
  | "X-Ray"
  | "Ultrasound"
  | "ECG"
  | "Other";

export type RiskLevel = "Low" | "Moderate" | "High" | "Critical";

export type SortOption =
  | "newest"
  | "oldest"
  | "score_desc"
  | "score_asc"
  | "risk_desc"
  | "risk_asc"
  | "title_asc"
  | "title_desc";

export interface ReportFilterState {
  search: string;
  reportType: ReportType;
  dateRangePreset: "all" | "7d" | "30d" | "3m" | "6m" | "1y" | "custom";
  dateFrom?: string;
  dateTo?: string;
  minHealthScore: number;
  maxHealthScore: number;
  riskLevels: RiskLevel[];
  diagnosis?: string;
  sortBy: SortOption;
  page: number;
  limit: number;
}

export interface MedicalReport {
  id: string;
  title: string;
  reportType: Exclude<ReportType, "All">;
  date: string;
  healthScore: number;
  riskLevel: RiskLevel;
  diagnosis: string[];
  summary?: string;
  downloadUrl?: string;
}

export interface ReportsResponse {
  data: MedicalReport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}