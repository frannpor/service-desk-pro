import type { DefaultSession } from "next-auth"
import { UserRole } from "."

declare module "next-auth" {
  interface User {
    role: string
    accessToken: string
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      image?: string | null
    }
    accessToken: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    accessToken: string
  }
}