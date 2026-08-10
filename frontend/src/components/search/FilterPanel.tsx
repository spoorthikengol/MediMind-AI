import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import type { ReportFilterOptions, ReportSearchParams, QuickRange } from "@/types/reportSearch";

interface FilterPanelProps {
  params: ReportSearchParams;
  filterOptions: ReportFilterOptions;
  onChange: (patch: Partial<ReportSearchParams>) => void;
}

const quickRanges: { value: QuickRange; label: string }[] = [
  { value: "today", label: "Uploaded Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

function toggleInList(list: string[] | undefined, value: string): string[] {
  const current = list ?? [];
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

function CheckboxGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[] | undefined;
  onToggle: (value: string) => void;
}) {
  if (options.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">{title}</p>
      <div className="space-y-1.5">
        {options.map((option) => {
          const checked = (selected ?? []).includes(option);
          return (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
            >
              <Checkbox checked={checked} onCheckedChange={() => onToggle(option)} />
              {option}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function FilterPanel({ params, filterOptions, onChange }: FilterPanelProps) {
  const [open, setOpen] = useState(true);

  const scoreRange: [number, number] = [params.min_score ?? 0, params.max_score ?? 100];

  return (
    <Card className="card-premium border-0 shadow-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between p-4"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-brand" />
          Filters
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <CardContent className="space-y-5 pt-0">
              {/* Date Range */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Date Range</p>
                <div className="flex flex-wrap gap-2">
                  {quickRanges.map((qr) => (
                    <button
                      key={qr.value}
                      type="button"
                      onClick={() =>
                        onChange({ quick_range: params.quick_range === qr.value ? undefined : qr.value })
                      }
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        params.quick_range === qr.value
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
                      }`}
                    >
                      {qr.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Health Score */}
              <div>
                <p className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
                  Health Score
                  <span className="text-foreground">
                    {scoreRange[0]} – {scoreRange[1]}
                  </span>
                </p>
                <Slider
                  value={scoreRange}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([min, max]) => onChange({ min_score: min, max_score: max })}
                />
              </div>

              <CheckboxGroup
                title="Risk Level"
                options={filterOptions.risk_levels}
                selected={params.risk_level}
                onToggle={(v) => onChange({ risk_level: toggleInList(params.risk_level, v) })}
              />

              <CheckboxGroup
                title="Report Type"
                options={filterOptions.report_types}
                selected={params.report_type}
                onToggle={(v) => onChange({ report_type: toggleInList(params.report_type, v) })}
              />

              <CheckboxGroup
                title="Overall Status"
                options={filterOptions.overall_statuses}
                selected={params.overall_status}
                onToggle={(v) => onChange({ overall_status: toggleInList(params.overall_status, v) })}
              />
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}