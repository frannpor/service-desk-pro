import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AuthService, ApiError } from "../services/api.service"
import { useSession, signOut } from "next-auth/react"
import { QUERY_STALE_TIME, QUERY_GC_TIME } from "../constants/api"
import type { RegisterDto, LoginDto } from "../types/user"

export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
}

export function useProfile() {
  const { data: session, status } = useSession()

  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async () => {
      const response = await AuthService.getProfile()
      return response.user
    },
    enabled: !!session?.user && status === "authenticated",
    staleTime: QUERY_STALE_TIME.MEDIUM,
    gcTime: QUERY_GC_TIME.MEDIUM,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && [401, 403].includes(error.status!)) {
        signOut({ redirect: true, callbackUrl: "/auth/signin" })
        return false
      }
      return failureCount < 2
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: RegisterDto) => AuthService.register(userData),
    onSuccess: (data) => {
      console.log("Registration successful:", data)
      queryClient.invalidateQueries({ queryKey: authKeys.profile() })
    },
    onError: (error) => {
      console.error("Registration error:", error)
    },
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginDto) => AuthService.login(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.profile() })
    },
    onError: (error) => {
      console.error("Login error:", error)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      try {
        await AuthService.logout()
      } catch (error) {
        console.error("Backend logout error:", error)
      }
    },
    onSettled: () => {
      queryClient.clear()
      signOut({
        redirect: true,
        callbackUrl: "/auth/signin",
      })
    },
  })
}
