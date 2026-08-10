import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { FullInsightsResponse, NotEnoughData } from "@/types/insights";

type InsightsResult = FullInsightsResponse | NotEnoughData;

export function useHealthInsights() {
  const [data, setData] = useState<InsightsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(() => {
    setLoading(true);
    setError(null);

    api
      .getInsights()
      .then((res: InsightsResult) => {
        setData(res);
      })
      .catch((err) => {
        setError(err?.message || "Unable to load health insights.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    data,
    loading,
    error,
    refetch: fetchInsights,
  };
}