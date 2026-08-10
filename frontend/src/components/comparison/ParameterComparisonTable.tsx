import { useMemo, useState } from "react";
import { ArrowUpDown, Search, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ComparisonStatusBadge, statusAccentColor } from "./ComparisonStatusBadge";
import { ReferenceRangeIndicator } from "./ReferenceRangeIndicator";
import type { ParameterComparison } from "@/types/comparison";

interface ParameterComparisonTableProps {
  parameters: ParameterComparison[];
}

type SortKey = "name" | "previous_value" | "current_value" | "difference" | "percent_change";
type SortDirection = "asc" | "desc";

const columns: { key: SortKey; label: string }[] = [
  { key: "name", label: "Parameter" },
  { key: "previous_value", label: "Previous" },
  { key: "current_value", label: "Current" },
  { key: "difference", label: "Difference" },
  { key: "percent_change", label: "% Change" },
];

export function ParameterComparisonTable({ parameters }: ParameterComparisonTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = term ? parameters.filter((p) => p.name.toLowerCase().includes(term)) : parameters;

    const sorted = [...rows].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      if (typeof aVal === "string" || typeof bVal === "string") {
        return String(aVal).localeCompare(String(bVal));
      }
      return (aVal as number) - (bVal as number);
    });

    return sortDirection === "asc" ? sorted : sorted.reverse();
  }, [parameters, search, sortKey, sortDirection]);

  if (parameters.length === 0) {
    return null;
  }

  return (
    <Card className="card-premium border-0 shadow-card">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">Parameter Comparison</CardTitle>

        <div className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search parameter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-9 text-sm transition-shadow focus:shadow-[0_0_0_3px_hsl(var(--brand)/0.15)]"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="hidden grid-cols-12 gap-4 border-b border-white/10 px-6 py-3 text-xs font-medium text-muted-foreground sm:grid">
          {columns.map((col) => (
            <button
              key={col.key}
              type="button"
              onClick={() => handleSort(col.key)}
              className={`flex items-center gap-1 transition-colors hover:text-foreground ${
                col.key === "name" ? "col-span-3 justify-start" : "col-span-2 justify-end"
              }`}
            >
              {col.label}
              <ArrowUpDown className="h-3 w-3" />
            </button>
          ))}
          <div className="col-span-2 text-right">Reference Range</div>
          <div className="col-span-1 text-right">Status</div>
        </div>

        {filtered.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-muted-foreground">
            No parameters match "{search}".
          </p>
        ) : (
          <div className="divide-y divide-border/60">
            {filtered.map((param, i) => {
              const isOpen = expanded === param.name;

              return (
                <div key={param.name}>
                  <motion.button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : param.name)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.02 }}
                    className={`grid w-full grid-cols-2 gap-x-4 gap-y-2 border-l-2 px-6 py-4 text-left transition-colors hover:bg-white/[0.03] sm:grid-cols-12 sm:items-center ${statusAccentColor[param.status]}`}
                  >
                    <div className="col-span-2 flex items-center gap-1.5 text-sm font-medium text-foreground sm:col-span-3">
                      <ChevronDown
                        className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                      {param.name}
                    </div>

                    <div className="text-right text-sm text-muted-foreground sm:col-span-2">
                      <span className="text-xs text-muted-foreground/60 sm:hidden">Previous: </span>
                      {param.previous_value}
                    </div>

                    <div className="text-right text-sm font-medium text-foreground sm:col-span-2">
                      <span className="text-xs text-muted-foreground/60 sm:hidden">Current: </span>
                      {param.current_value}
                    </div>

                    <div
                      className={`text-right text-sm sm:col-span-2 ${
                        param.difference > 0 ? "text-emerald-400" : param.difference < 0 ? "text-red-400" : "text-muted-foreground"
                      }`}
                    >
                      <span className="text-xs text-muted-foreground/60 sm:hidden">Diff: </span>
                      {param.difference > 0 ? "+" : ""}
                      {param.difference}
                    </div>

                    <div className="text-right text-sm text-muted-foreground sm:col-span-2">
                      {param.percent_change !== null ? `${param.percent_change > 0 ? "+" : ""}${param.percent_change}%` : "—"}
                    </div>

                    <div className="flex justify-end sm:col-span-2">
                      <ReferenceRangeIndicator
                        referenceRange={param.reference_range}
                        previousValue={param.previous_value}
                        currentValue={param.current_value}
                      />
                    </div>

                    <div className="col-span-2 flex justify-end sm:col-span-1">
                      <ComparisonStatusBadge status={param.status} />
                    </div>
                  </motion.button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden bg-white/[0.015]"
                      >
                        <div className="grid gap-4 px-6 py-4 pl-10 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Clinical Meaning</p>
                            <p className="mt-1 text-sm text-foreground">
                              {param.clinical_meaning ?? "No description available for this parameter yet."}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">AI Explanation</p>
                            <p className="mt-1 text-sm text-foreground">{param.ai_explanation}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}