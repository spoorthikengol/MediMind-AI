import { useCallback, useEffect, useRef, useState } from "react";

import { api } from "@/lib/api";
import type {
  ReportSearchParams,
  ReportSearchResponse,
  ReportFilterOptions,
} from "@/types/reportSearch";
import { DEFAULT_SEARCH_PARAMS } from "@/types/reportSearch";

const DEBOUNCE_MS = 350;

export function useReportSearch() {
  // The raw text the user is typing — updates the input instantly,
  // independent of when the actual search fires.
  const [inputQuery, setInputQuery] = useState("");

  const [params, setParams] = useState<ReportSearchParams>(DEFAULT_SEARCH_PARAMS);

  const [data, setData] = useState<ReportSearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback((searchParams: ReportSearchParams) => {
    setLoading(true);
    setError(null);

    api
      .searchReports(searchParams)
      .then((res: ReportSearchResponse) => {
        setData(res);
      })
      .catch((err) => {
        setError(err?.message || "Unable to search reports.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Debounced text search — only the `q` field waits; every other
  // filter change (below) fires immediately since it's a discrete
  // click, not continuous typing.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setParams((prev) => ({ ...prev, q: inputQuery || undefined, page: 1 }));
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputQuery]);

  useEffect(() => {
    runSearch(params);
  }, [params, runSearch]);

  const updateFilters = useCallback((patch: Partial<ReportSearchParams>) => {
    setParams((prev) => ({ ...prev, ...patch, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const setSort = useCallback((sort: ReportSearchParams["sort"]) => {
    setParams((prev) => ({ ...prev, sort, page: 1 }));
  }, []);

  const setPageSize = useCallback((page_size: ReportSearchParams["page_size"]) => {
    setParams((prev) => ({ ...prev, page_size, page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setInputQuery("");
    setParams(DEFAULT_SEARCH_PARAMS);
  }, []);

  const clearQuery = useCallback(() => {
    setInputQuery("");
  }, []);

  const filterOptions: ReportFilterOptions = data?.filter_options ?? {
    risk_levels: [],
    overall_statuses: [],
    report_types: [],
  };

  return {
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
    retry: () => runSearch(params),
  };
}