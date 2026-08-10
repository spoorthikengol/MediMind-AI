import React from "react";
import { X } from "lucide-react";
import { ReportFilterState } from "@/types/report";

interface FilterChipsProps {
  filters: ReportFilterState;
  onUpdateFilters: (newFilters: Partial<ReportFilterState>) => void;
  onReset: () => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onUpdateFilters,
  onReset,
}) => {
  const chips: { label: string; onRemove: () => void }[] = [];

  if (filters.search) {
    chips.push({
      label: `"${filters.search}"`,
      onRemove: () => onUpdateFilters({ search: "" }),
    });
  }

  if (filters.reportType !== "All") {
    chips.push({
      label: `Type: ${filters.reportType}`,
      onRemove: () => onUpdateFilters({ reportType: "All" }),
    });
  }

  if (filters.dateRangePreset !== "all") {
    chips.push({
      label: `Date: ${filters.dateRangePreset.toUpperCase()}`,
      onRemove: () =>
        onUpdateFilters({
          dateRangePreset: "all",
          dateFrom: undefined,
          dateTo: undefined,
        }),
    });
  }

  if (filters.minHealthScore > 0 || filters.maxHealthScore < 100) {
    chips.push({
      label: `Score: ${filters.minHealthScore}–${filters.maxHealthScore}`,
      onRemove: () => onUpdateFilters({ minHealthScore: 0, maxHealthScore: 100 }),
    });
  }

  filters.riskLevels.forEach((risk) => {
    chips.push({
      label: `Risk: ${risk}`,
      onRemove: () =>
        onUpdateFilters({
          riskLevels: filters.riskLevels.filter((r) => r !== risk),
        }),
    });
  });

  if (filters.diagnosis) {
    chips.push({
      label: `Diagnosis: ${filters.diagnosis}`,
      onRemove: () => onUpdateFilters({ diagnosis: undefined }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      {chips.map((chip, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-cyan-300 border border-slate-700"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="hover:text-white rounded-full p-0.5 focus:outline-none"
            aria-label={`Remove filter ${chip.label}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      <button
        onClick={onReset}
        className="text-xs text-slate-400 hover:text-cyan-400 underline underline-offset-2 ml-1"
      >
        Clear all
      </button>
    </div>
  );
};