import { useQuery, useQueries } from "@tanstack/react-query"
import { DashboardService, ApiError } from "../services/api.service"
import { QUERY_STALE_TIME, QUERY_GC_TIME } from "../constants/api"

export const dashboardKeys = {
  all: ["dashboard"] as const,
  metrics: (period: "7d" | "30d") => [...dashboardKeys.all, "metrics", period] as const,
  trends: (days: number) => [...dashboardKeys.all, "trends", days] as const,
  categories: () => [...dashboardKeys.all, "categories"] as const,
  agents: () => [...dashboardKeys.all, "agents"] as const,
  overview: (period: "7d" | "30d") => [...dashboardKeys.all, "overview", period] as const,
}

export function useDashboardMetrics(period: "7d" | "30d" = "7d") {
  return useQuery({
    queryKey: dashboardKeys.metrics(period),
    queryFn: () => DashboardService.getMetrics(period),
    staleTime: QUERY_STALE_TIME.SHORT,
    gcTime: QUERY_GC_TIME.MEDIUM,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && [401, 403].includes(error.status!)) {
        return false
      }
      return failureCount < 2
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    placeholderData: (previousData) => previousData,
  })
}

export function useTicketTrends(days = 30) {
  return useQuery({
    queryKey: dashboardKeys.trends(days),
    queryFn: () => DashboardService.getTicketTrends(days),
    staleTime: QUERY_STALE_TIME.MEDIUM,
    gcTime: QUERY_GC_TIME.MEDIUM,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && [401, 403].includes(error.status!)) {
        return false
      }
      return failureCount < 2
    },
    placeholderData: (previousData) => previousData,
  })
}

export function useCategoryMetrics() {
  return useQuery({
    queryKey: dashboardKeys.categories(),
    queryFn: () => DashboardService.getCategoryMetrics(),
    staleTime: QUERY_STALE_TIME.MEDIUM,
    gcTime: QUERY_GC_TIME.MEDIUM,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && [401, 403].includes(error.status!)) {
        return false
      }
      return failureCount < 2
    },
    placeholderData: (previousData) => previousData,
  })
}

export function useAgentPerformance() {
  return useQuery({
    queryKey: dashboardKeys.agents(),
    queryFn: () => DashboardService.getAgentPerformance(),
    staleTime: QUERY_STALE_TIME.MEDIUM,
    gcTime: QUERY_GC_TIME.MEDIUM,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && [401, 403].includes(error.status!)) {
        return false
      }
      return failureCount < 2
    },
    placeholderData: (previousData) => previousData,
  })
}

export function useDashboardOverview(period: "7d" | "30d" = "7d") {
  const results = useQueries({
    queries: [
      {
        queryKey: dashboardKeys.metrics(period),
        queryFn: () => DashboardService.getMetrics(period),
        staleTime: QUERY_STALE_TIME.SHORT,
      },
      {
        queryKey: dashboardKeys.trends(30),
        queryFn: () => DashboardService.getTicketTrends(30),
        staleTime: QUERY_STALE_TIME.MEDIUM,
      },
      {
        queryKey: dashboardKeys.categories(),
        queryFn: () => DashboardService.getCategoryMetrics(),
        staleTime: QUERY_STALE_TIME.MEDIUM,
      },
      {
        queryKey: dashboardKeys.agents(),
        queryFn: () => DashboardService.getAgentPerformance(),
        staleTime: QUERY_STALE_TIME.MEDIUM,
      },
    ],
  })

  return {
    metrics: results[0],
    trends: results[1],
    categories: results[2],
    agents: results[3],
    isLoading: results.some((r) => r.isLoading),
    isError: results.some((r) => r.isError),
    errors: results.filter((r) => r.error).map((r) => r.error),
  }
}
