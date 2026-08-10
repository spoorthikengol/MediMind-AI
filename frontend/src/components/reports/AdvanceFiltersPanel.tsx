import React from "react";
import { X, RotateCcw } from "lucide-react";
import { ReportFilterState, ReportType, RiskLevel } from "@/types/report";
import { Button } from "@/components/ui/button";

interface AdvancedFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ReportFilterState;
  onUpdateFilters: (newFilters: Partial<ReportFilterState>) => void;
  onReset: () => void;
  availableDiagnoses: string[];
}

const REPORT_TYPES: ReportType[] = [
  "All",
  "Blood Test",
  "MRI",
  "CT Scan",
  "X-Ray",
  "Ultrasound",
  "ECG",
  "Other",
];

const RISK_LEVELS: RiskLevel[] = ["Low", "Moderate", "High", "Critical"];

export const AdvancedFiltersPanel: React.FC<AdvancedFiltersPanelProps> = ({
  isOpen,
  onClose,
  filters,
  onUpdateFilters,
  onReset,
  availableDiagnoses,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 h-full flex flex-col shadow-2xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Advanced Filters</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset All
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 py-6 space-y-6">
          {/* Report Type */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
              Report Type
            </label>
            <div className="flex flex-wrap gap-2">
              {REPORT_TYPES.map((type) => {
                const isActive = filters.reportType === type;
                return (
                  <button
                    key={type}
                    onClick={() => onUpdateFilters({ reportType: type, page: 1 })}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors border ${
                      isActive
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 font-medium"
                        : "bg-slate-800/50 border-slate-700/60 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
              Date Range
            </label>
            <select
              value={filters.dateRangePreset}
              onChange={(e) =>
                onUpdateFilters({
                  dateRangePreset: e.target.value as ReportFilterState["dateRangePreset"],
                  page: 1,
                })
              }
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5 focus:border-cyan-500"
            >
              <option value="all">All time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="3m">Last 3 months</option>
              <option value="6m">Last 6 months</option>
              <option value="1y">Last year</option>
              <option value="custom">Custom date range</option>
            </select>

            {filters.dateRangePreset === "custom" && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <span className="text-[11px] text-slate-400">From</span>
                  <input
                    type="date"
                    value={filters.dateFrom || ""}
                    onChange={(e) => onUpdateFilters({ dateFrom: e.target.value, page: 1 })}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 mt-1"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">To</span>
                  <input
                    type="date"
                    value={filters.dateTo || ""}
                    onChange={(e) => onUpdateFilters({ dateTo: e.target.value, page: 1 })}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Health Score Range */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Health Score Range
              </label>
              <span className="text-xs font-mono text-cyan-400 font-semibold">
                {filters.minHealthScore} - {filters.maxHealthScore}
              </span>
            </div>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="100"
                value={filters.minHealthScore}
                onChange={(e) =>
                  onUpdateFilters({
                    minHealthScore: Math.min(Number(e.target.value), filters.maxHealthScore),
                    page: 1,
                  })
                }
                className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={filters.maxHealthScore}
                onChange={(e) =>
                  onUpdateFilters({
                    maxHealthScore: Math.max(Number(e.target.value), filters.minHealthScore),
                    page: 1,
                  })
                }
                className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Risk Level */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
              Risk Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {RISK_LEVELS.map((risk) => {
                const isChecked = filters.riskLevels.includes(risk);
                return (
                  <label
                    key={risk}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? "bg-slate-800 border-cyan-500/60 text-white"
                        : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...filters.riskLevels, risk]
                          : filters.riskLevels.filter((r) => r !== risk);
                        onUpdateFilters({ riskLevels: updated, page: 1 });
                      }}
                      className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>{risk}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Diagnosis / Condition */}
          {availableDiagnoses.length > 0 && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
                Diagnosis / Condition
              </label>
              <select
                value={filters.diagnosis || ""}
                onChange={(e) =>
                  onUpdateFilters({
                    diagnosis: e.target.value || undefined,
                    page: 1,
                  })
                }
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5 focus:border-cyan-500"
              >
                <option value="">All Diagnoses</option>
                {availableDiagnoses.map((diag) => (
                  <option key={diag} value={diag}>
                    {diag}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800 flex gap-3">
          <Button
            onClick={onClose}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 rounded-lg"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};