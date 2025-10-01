"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"

import { Button } from "@/src/components/ui/Button"
import { Input } from "@/src/components/ui/Input"
import { Label } from "@/src/components/ui/Label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/Card"
import { Alert, AlertDescription } from "@/src/components/ui/Alert"

import { loginSchema, type LoginFormData} from "@/src/lib/schemas/auth.schema"

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [globalError, setGlobalError] = useState("")
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
    watch,
    setValue,
    reset,
    trigger,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  useEffect(() => {
    setFocus("email")
  }, [setFocus])

  const emailValue = watch("email")

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setGlobalError("")

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error.includes("Invalid credentials")) {
          setGlobalError("Invalid email or password. Please try again.")
        } else if (result.error.includes("inactive")) {
          setGlobalError("Your account is inactive. Please contact support.")
        } else {
          setGlobalError(result.error)
        }
        return
      }

      const session = await getSession()
      if (!session?.user) {
        setGlobalError("Failed to establish session. Please try again.")
        return
      }

      const redirectPath = getRedirectPath(session.user.role)
      router.push(redirectPath)

    } catch (error) {
      console.error("Login error:", error)
      setGlobalError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getRedirectPath = (role: string): string => {
    switch (role) {
      case "MANAGER":
      case "ADMIN":
        return "/dashboard"
      case "AGENT":
        return "/tickets"
      case "REQUESTER":
      default:
        return "/my-tickets"
    }
  }

  const quickFillDemoAccount = (email: string, password: string) => {
    reset({ email, password })
    trigger(["email", "password"])

    const form = document.getElementById('login-form') as HTMLFormElement | null
    if (form) {
      const emailInput = form.elements.namedItem('email') as HTMLInputElement | null
      const passwordInput = form.elements.namedItem('password') as HTMLInputElement | null

      if (emailInput) {
        emailInput.value = email
        emailInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (passwordInput) {
        passwordInput.value = password
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }

    setFocus("password")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            ServiceDesk Pro
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@company.com"
                autoComplete="email"
                disabled={isLoading}
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...register("password")}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {globalError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{globalError}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || isSubmitting}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium mb-2 text-gray-700">Demo Accounts:</p>
            <div className="text-xs space-y-2">
              <button
                type="button"
                onClick={() => quickFillDemoAccount("admin@company.com", "password123")}
                className="w-full text-left p-2 rounded hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold text-gray-600">Manager:</span>
                <span className="text-gray-500 ml-1">admin@company.com / password123</span>
              </button>
              <button
                type="button"
                onClick={() => quickFillDemoAccount("agent1@company.com", "password123")}
                className="w-full text-left p-2 rounded hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold text-gray-600">Agent:</span>
                <span className="text-gray-500 ml-1">agent1@company.com / password123</span>
              </button>
              <button
                type="button"
                onClick={() => quickFillDemoAccount("user1@company.com", "password123")}
                className="w-full text-left p-2 rounded hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold text-gray-600">Requester:</span>
                <span className="text-gray-500 ml-1">user1@company.com / password123</span>
              </button>
            </div>
          </div>

          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <a 
              href="/auth/signup" 
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
