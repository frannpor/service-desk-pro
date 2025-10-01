import type React from "react"
import NextAuth from "next-auth"
import type { Session } from "next-auth"
import { authConfig } from "./auth.config"
import { cache } from "react"

export const {
  handlers,
  auth: uncachedAuth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
})

export const auth = cache(uncachedAuth)

export async function SignedIn(props: {
  children: React.ReactNode | ((props: { user: Session["user"] }) => React.ReactNode)
}) {
  const session = await auth()
  return session?.user ? (
    <>{typeof props.children === "function" ? props.children({ user: session.user }) : props.children}</>
  ) : null
}

export async function SignedOut(props: { children: React.ReactNode }) {
  const session = await auth()
  return session?.user ? null : <>{props.children}</>
}
