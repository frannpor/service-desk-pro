import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "@auth/core/providers/credentials";
import { z } from "zod";
import { API_ENDPOINTS } from "../constants/api";
import { Adapter } from "@auth/core/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma";
import { User } from "next-auth";
import { UserRole } from "@/src/types";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn() {
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl + "/dashboard";
    },
    async session({ session, token }) {
      // Transferir datos del JWT token a la sesión
      if (token && session.user) {
        session.user.id = token.sub as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.picture as string
        session.user.role = token.role as string
        session.accessToken = token.accessToken as string
      }
      if (process.env.NODE_ENV === "development") {
        console.log("📦 Session state:", {
          userId: session.user?.id,
          email: session.user?.email,
          role: session.user?.role,
          hasAccessToken: !!session.accessToken,
        })
      }

      return session
    },
    async jwt({ token, user }) {
      if (user) {
        console.log("JWT callback - signIn:", { email: user.email, role: user.role })
        token.sub = user.id
        token.name = user.name
        token.email = user.email
        token.picture = user.image
        token.role = user.role
        token.accessToken = user.accessToken
      }
      return token
    },
  },
  // adapter: PostgresAdapter(pool),
  debug: process.env.NODE_ENV === "development",
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        const validated = loginSchema.safeParse(credentials)

        if (!validated.success) {
          console.error("Invalid credentials payload", validated.error)
          return null
        }

        const { email, password } = validated.data

        try {
          console.log("Attempting login with:", credentials.email)
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error("Login failed:", errorData)
            return null
          }

          const responseData = await response.json()
          console.log("Login response:", responseData)

          if (response.ok && responseData.user) {
            const user: User = {
              id: responseData.user.id,
              email: responseData.user.email,
              name: responseData.user.name,
              image: responseData.user.image || null,
              role: responseData.user.role,
              accessToken: responseData.token, // The JWT token from backend
            } as User

            console.log("User authenticated successfully:", {
              id: user.id,
              email: user.email,
              role: user.role,
            })

            return user
          }

          console.error("Login failed - invalid response structure:", responseData)
          return null
        } catch (err) {
          console.error("Auth error:", err)
          return null
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
