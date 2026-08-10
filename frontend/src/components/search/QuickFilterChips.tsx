import { motion } from "framer-motion";

import type { ReportSearchParams, ReportFilterOptions } from "@/types/reportSearch";

interface QuickFilterChipsProps {
  params: ReportSearchParams;
  filterOptions: ReportFilterOptions;
  inputQuery: string;
  onSetQuery: (q: string) => void;
  onChange: (patch: Partial<ReportSearchParams>) => void;
  onClearAll: () => void;
}

// Keyword chips work by setting the free-text search — they rely on
// the same file_name/medical_summary match everything else uses, not
// a fabricated "disease taxonomy" the backend doesn't have.
const KEYWORD_CHIPS = ["Kidney", "Liver", "Diabetes", "Heart", "Blood", "MRI", "CT"];

export function QuickFilterChips({
  params,
  filterOptions,
  inputQuery,
  onSetQuery,
  onChange,
  onClearAll,
}: QuickFilterChipsProps) {

  const hasActiveFilters =
    !!inputQuery ||
    !!params.quick_range ||
    (params.risk_level?.length ?? 0) > 0 ||
    (params.overall_status?.length ?? 0) > 0 ||
    (params.report_type?.length ?? 0) > 0;

  const isHealthySelected = (params.overall_status ?? []).includes("Healthy");
  const isRecentSelected = params.quick_range === "week";

  const chipClass = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
      active
        ? "border-brand bg-brand/15 text-brand"
        : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filterOptions.overall_statuses.includes("Healthy") && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() =>
            onChange({
              overall_status: isHealthySelected
                ? (params.overall_status ?? []).filter((s) => s !== "Healthy")
                : [...(params.overall_status ?? []), "Healthy"],
            })
          }
          className={chipClass(isHealthySelected)}
        >
          Healthy
        </motion.button>
      )}

      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange({ quick_range: isRecentSelected ? undefined : "week" })}
        className={chipClass(isRecentSelected)}
      >
        Recent
      </motion.button>

      {KEYWORD_CHIPS.map((keyword) => (
        <motion.button
          key={keyword}
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => onSetQuery(inputQuery === keyword ? "" : keyword)}
          className={chipClass(inputQuery === keyword)}
        >
          {keyword}
        </motion.button>
      ))}

      {hasActiveFilters && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={onClearAll}
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-red-400/40 hover:text-red-400"
        >
          Clear All
        </motion.button>
      )}
    </div>
  );
}