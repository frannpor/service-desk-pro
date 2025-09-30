import type { DefaultSession } from "next-auth"
import { UserRole } from "."

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession["user"]
    accessToken: string
  }

  interface User {
    role: UserRole
    accessToken: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    accessToken: string
  }
}
