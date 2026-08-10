import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { GitCompare } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";

import { ReportSearchBar } from "@/components/reports/ReportSearchBar";
import { ReportCard } from "@/components/reports/ReportCard";
import { ReportCardSkeletonGrid } from "@/components/reports/ReportCardSkeleton";
import { PaginationFooter } from "@/components/reports/PaginationFooter";

import { api } from "@/lib/api";
import type {
  ReportSearchResponse,
  SortOption,
} from "@/types/reportSearch";

export const Route = createFileRoute("/app/reports")({
  component: ReportsSearchPage,
});

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "score_desc", label: "Highest Health Score" },
  { value: "score_asc", label: "Lowest Health Score" },
  { value: "name_asc", label: "A → Z" },
  { value: "name_desc", label: "Z → A" },
];

function ReportsSearchPage() {
  const [query, setQuery] = useState("");
  const [riskLevel, setRiskLevel] = useState<string[]>([]);
  const [overallStatus, setOverallStatus] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("newest");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [data, setData] = useState<ReportSearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(() => {
    setLoading(true);
    setError(null);

    api
      .searchReports({
        q: query || undefined,
        risk_level: riskLevel.length ? riskLevel : undefined,
        overall_status: overallStatus.length
          ? overallStatus
          : undefined,
        sort,
        page,
        page_size: pageSize,
      })
      .then((res: ReportSearchResponse) => {
        setData(res);
      })
      .catch((err) => {
        setError(
          err?.message || "Unable to load reports."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    query,
    riskLevel,
    overallStatus,
    sort,
    page,
    pageSize,
  ]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  // Reset to page 1 whenever search/filter/sort/page-size changes.
  useEffect(() => {
    setPage(1);
  }, [
    query,
    riskLevel,
    overallStatus,
    sort,
    pageSize,
  ]);

  const toggleValue = (
    list: string[],
    value: string,
    setList: (value: string[]) => void
  ) => {
    setList(
      list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value]
    );
  };

  const clearAll = () => {
    setQuery("");
    setRiskLevel([]);
    setOverallStatus([]);
    setSort("newest");
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(query) ||
    riskLevel.length > 0 ||
    overallStatus.length > 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Reports
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Search and filter every report you've uploaded.
        </p>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <ReportSearchBar
            value={query}
            onChange={setQuery}
            onOpenFilters={() => {}}
            activeFilterCount={
              riskLevel.length + overallStatus.length
            }
          />
        </div>

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as SortOption);
            setPage(1);
          }}
          className="h-11 rounded-xl border border-border/60 bg-white/[0.02] px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/40"
        >
          {SORT_OPTIONS.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-background text-foreground"
            >
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filters */}
      {data?.filter_options &&
        (data.filter_options.risk_levels.length > 0 ||
          data.filter_options.overall_statuses.length > 0) && (
          <div className="flex flex-wrap items-center gap-2">
            {data.filter_options.risk_levels.map(
              (level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    toggleValue(
                      riskLevel,
                      level,
                      setRiskLevel
                    )
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    riskLevel.includes(level)
                      ? "bg-brand text-white"
                      : "bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08]"
                  }`}
                >
                  {level}
                </button>
              )
            )}

            {data.filter_options.overall_statuses.map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    toggleValue(
                      overallStatus,
                      status,
                      setOverallStatus
                    )
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    overallStatus.includes(status)
                      ? "bg-brand text-white"
                      : "bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08]"
                  }`}
                >
                  {status}
                </button>
              )
            )}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Clear All
              </button>
            )}
          </div>
        )}

      {/* Results */}
      {loading ? (
        <ReportCardSkeletonGrid
          count={pageSize > 6 ? 6 : pageSize}
        />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={runSearch}
        />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={GitCompare}
          title={
            hasActiveFilters
              ? "No matching reports found"
              : "No reports uploaded yet"
          }
          description={
            hasActiveFilters
              ? "Try adjusting your search or filters."
              : "Upload your first medical report to get started."
          }
        />
      ) : (
        <>
          {/* Report Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onView={(id) => {
                  window.location.href = `/app/report/${id}`;
                }}
                onCompare={() => {
                  window.location.href =
                    `/app/comparison`;
                }}
                onDownload={(id) =>
                  api.downloadReport(id)
                }
              />
            ))}
          </div>

          {/* Pagination */}
          <PaginationFooter
            page={data.page}
            totalPages={data.total_pages}
            pageSize={pageSize}
            total={data.total}
            onPageChange={(newPage) => {
              setPage(newPage);
            }}
            onPageSizeChange={(size) => {
              if (
                size === 10 ||
                size === 20 ||
                size === 50 ||
                size === 100
              ) {
                setPageSize(size);
                setPage(1);
              }
            }}
          />
        </>
      )}
    </div>
  );
}