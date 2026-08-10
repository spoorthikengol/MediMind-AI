import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ReportSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
}

export const ReportSearchBar: React.FC<ReportSearchBarProps> = ({
  value,
  onChange,
  onOpenFilters,
  activeFilterCount,
}) => {
  const [searchTerm, setSearchTerm] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, onChange]);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Search reports, diagnoses, tests or medical terms..."
          className="pl-10 pr-10 py-2.5 bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20 w-full rounded-lg"
          aria-label="Search medical reports"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              onChange("");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Button
        variant="outline"
        onClick={onOpenFilters}
        className="flex items-center gap-2 bg-slate-900/60 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white border min-w-[130px] justify-center w-full sm:w-auto py-2.5"
      >
        <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="ml-1 bg-cyan-500/20 text-cyan-300 text-xs px-2 py-0.5 rounded-full font-semibold border border-cyan-500/30">
            {activeFilterCount}
          </span>
        )}
      </Button>
    </div>
  );
};