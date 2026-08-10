import { createFileRoute, Link } from "@tanstack/react-router";
import { Upload, SearchX, FileSearch } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";

import { SearchBar } from "@/components/search/SearchBar";
import { FilterPanel } from "@/components/search/FilterPanel";
import { QuickFilterChips } from "@/components/search/QuickFilterChips";
import { ResultCard } from "@/components/search/ResultCard";
import { SearchPagination } from "@/components/search/SearchPagination";
import { SearchResultsSkeleton } from "@/components/search/SearchResultsSkeleton";

import { useReportSearch } from "@/hooks/useReportSearch";

export const Route = createFileRoute("/app/search")({
  component: SearchPage,
});

function SearchPage() {
  const {
    inputQuery,
    setInputQuery,
    params,
    updateFilters,
    setPage,
    setSort,
    setPageSize,
    clearFilters,
    clearQuery,
    data,
    filterOptions,
    loading,
    error,
    retry,
  } = useReportSearch();

  const hasActiveFilters =
    !!inputQuery ||
    !!params.quick_range ||
    (params.risk_level?.length ?? 0) > 0 ||
    (params.overall_status?.length ?? 0) > 0 ||
    (params.report_type?.length ?? 0) > 0;

  // Distinguishes "you have zero reports at all" from "zero reports
  // match your current search/filters" — two different empty states
  // per the spec, not one generic message.
  const isTrulyEmpty = data?.total === 0 && !hasActiveFilters;
  const isNoMatches = data?.total === 0 && hasActiveFilters;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Search Reports
        </h1>
        <p className="mt-1 text-muted-foreground">
          Find any report instantly across your full history.
        </p>
      </div>

      <SearchBar value={inputQuery} onChange={setInputQuery} onClear={clearQuery} />

      <QuickFilterChips
        params={params}
        filterOptions={filterOptions}
        inputQuery={inputQuery}
        onSetQuery={setInputQuery}
        onChange={updateFilters}
        onClearAll={clearFilters}
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <FilterPanel params={params} filterOptions={filterOptions} onChange={updateFilters} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {data ? `${data.total} result${data.total === 1 ? "" : "s"}` : ""}
            </p>

            <select
              value={params.sort}
              onChange={(e) => setSort(e.target.value as typeof params.sort)}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-foreground"
              aria-label="Sort results"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="score_desc">Highest Health Score</option>
              <option value="score_asc">Lowest Health Score</option>
              <option value="name_asc">A → Z</option>
              <option value="name_za">Z → A</option>
            </select>
          </div>

          {loading ? (
            <SearchResultsSkeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={retry} />
          ) : isTrulyEmpty ? (
            <EmptyState
              icon={FileSearch}
              title="No reports uploaded yet."
              description="Upload your first medical report to start searching."
              action={
                <Button asChild size="sm">
                  <Link to="/app/upload">
                    <Upload className="mr-2 h-3.5 w-3.5" />
                    Upload Report
                  </Link>
                </Button>
              }
            />
          ) : isNoMatches ? (
            <EmptyState
              icon={SearchX}
              title="No matching reports found."
              description="Try adjusting your search terms or filters."
              action={
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {data?.items.map((report) => (
                    <ResultCard key={report.id} report={report} query={inputQuery} />
                  ))}
                </div>
              </AnimatePresence>

              {data && (
                <SearchPagination
                  page={data.page}
                  totalPages={data.total_pages}
                  pageSize={data.page_size}
                  total={data.total}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}