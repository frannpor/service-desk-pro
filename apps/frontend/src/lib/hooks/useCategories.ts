"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CategoryService, ApiError } from "../services/api.service"
import { QUERY_STALE_TIME, QUERY_GC_TIME } from "../constants/api"
import type { CreateCategoryDto, UpdateCategoryDto } from "../types/category"
import { useCallback } from "react"

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (includeInactive: boolean) => [...categoryKeys.lists(), { includeInactive }] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  active: () => [...categoryKeys.lists(), { includeInactive: false }] as const,
}

export function useCategories(includeInactive = false) {
  return useQuery({
    queryKey: categoryKeys.list(includeInactive),
    queryFn: () => CategoryService.getCategories(includeInactive),
    staleTime: QUERY_STALE_TIME.LONG,
    gcTime: QUERY_GC_TIME.LONG,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && [401, 403, 404].includes(error.status!)) {
        return false
      }
      return failureCount < 2
    },
    placeholderData: (previousData) => previousData,
  })
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => CategoryService.getCategoryById(id),
    enabled: !!id,
    staleTime: QUERY_STALE_TIME.LONG,
    gcTime: QUERY_GC_TIME.LONG,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && [404].includes(error.status!)) {
        return false
      }
      return failureCount < 2
    },
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCategoryDto) => CategoryService.createCategory(data),
    onMutate: async (newCategory) => {
      await queryClient.cancelQueries({ queryKey: categoryKeys.lists() })
      const previousCategories = queryClient.getQueryData(categoryKeys.lists())
      return { previousCategories }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(categoryKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
    onError: (error, variables, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(categoryKeys.lists(), context.previousCategories)
      }
      console.error("Create category error:", error)
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) => CategoryService.updateCategory(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: categoryKeys.detail(id) })

      const previousCategory = queryClient.getQueryData(categoryKeys.detail(id))

      queryClient.setQueryData(categoryKeys.detail(id), (old: any) => ({
        ...old,
        ...data,
      }))

      return { previousCategory, id }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(categoryKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
    onError: (error, variables, context) => {
      if (context?.previousCategory && context?.id) {
        queryClient.setQueryData(categoryKeys.detail(context.id), context.previousCategory)
      }
      console.error("Update category error:", error)
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => CategoryService.deleteCategory(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: categoryKeys.lists() })

      const previousCategories = queryClient.getQueryData(categoryKeys.lists())

      return { previousCategories, id }
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: categoryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
    onError: (error, variables, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(categoryKeys.lists(), context.previousCategories)
      }
      console.error("Delete category error:", error)
    },
  })
}

export function usePrefetchCategory() {
  const queryClient = useQueryClient()

  return useCallback(
    (id: string) => {
      queryClient.prefetchQuery({
        queryKey: categoryKeys.detail(id),
        queryFn: () => CategoryService.getCategoryById(id),
        staleTime: QUERY_STALE_TIME.LONG,
      })
    },
    [queryClient],
  )
}
