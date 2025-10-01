import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import { auth } from "@/src/lib/auth/auth"
import { Navigation } from "@/src/components/layout/navigation"
import QueryProvider from "@/src/components/QueryProvider"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "ServiceDesk Pro",
  description: "Internal service desk platform",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  console.log('Session:', session)
  return (
    <html lang='es' suppressHydrationWarning className={poppins.variable}>
      <body className={poppins.className}>
        <QueryProvider>
          <SessionProvider session={session}>
            <Navigation />
            <main>{children}</main>
          </SessionProvider>
        </QueryProvider>

      </body>
    </html>
  )
}
