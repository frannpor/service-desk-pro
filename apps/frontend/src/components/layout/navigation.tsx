"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/src/components/ui/Button"
import { Avatar, AvatarFallback } from "@/src/components/ui/Avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/DropdownMenu"
import { BarChart3, Ticket, Settings, LogOut } from "lucide-react"

export function Navigation() {
  const { data: session } = useSession()

  if (!session) return null

  const isManager = session.user.role === "MANAGER"
  const isAgent = session.user.role === "AGENT"

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-xl font-bold">
              ServiceDesk Pro
            </Link>

            <div className="flex space-x-4">
              <Link
                href={session.user.role === "REQUESTER" ? "/my-tickets" : "/tickets"}
                className="flex items-center space-x-2 text-sm font-medium hover:text-primary"
              >
                <Ticket className="h-4 w-4" />
                <span>Tickets</span>
              </Link>

              {isManager && (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 text-sm font-medium hover:text-primary"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/manager/categories"
                    className="flex items-center space-x-2 text-sm font-medium hover:text-primary"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Categories</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{session.user.name}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">{session.user.email}</p>
                  <p className="text-xs text-muted-foreground">{session.user.role}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
