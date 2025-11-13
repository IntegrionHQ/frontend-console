"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { 
  LayoutGrid, 
  LineChart, 
  Server, 
  GitPullRequest, 
  FileBarChart2, 
  Settings, 
  BookOpen 
} from "lucide-react"
import { useUser } from "@/app/store/global/context/userContext"

// Sample data preserved and simplified for the custom sidebar
const nav = {
  main: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { title: "Test Runs", href: "/dashboard/test-runs", icon: LineChart },
    { title: "Infrastructure", href: "/dashboard/infrastructure", icon: Server },
    { title: "Pull Requests", href: "/dashboard/pull-requests", icon: GitPullRequest },
    { title: "Analytics", href: "/dashboard/analytics", icon: FileBarChart2 },
    { title: "Reports", href: "/dashboard/reports", icon: FileBarChart2 },
  ],
  docs: [
    { title: "Introduction", href: "#" },
    { title: "Get Started", href: "#" },
    { title: "Tutorials", href: "#" },
    { title: "Changelog", href: "#" },
  ],
}

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clearUser } = useUser()
  const displayName = user?.username || user?.githubUsername || user?.email || "Guest"
  const displayEmail = user?.email || user?.primaryEmail || ""

  const handleSignOut = () => {
    try {
      // Clear user context + localStorage
      clearUser()
      // Clear any session repo caches
      try {
        const keys: string[] = []
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i)
          if (k) keys.push(k)
        }
        keys.forEach((k) => {
          if (k.startsWith('gh:repos:')) sessionStorage.removeItem(k)
        })
      } catch {}
    } finally {
      router.push('/auth/signin')
    }
  }

  return (
    <aside className="h-screen sticky top-0 w-64 shrink-0 border-r bg-white text-gray-900">
      <div className="px-4 py-4 border-b">
        <div className="text-sm uppercase tracking-widest text-gray-500">Integrion</div>
        <div className="text-lg font-semibold">Control Center</div>
      </div>

      <nav className="px-2 py-4 space-y-6 overflow-y-auto">
        <div>
          <div className="px-2 mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">General</div>
          <ul className="space-y-1">
            {nav.main.map((item) => {
              const Icon = item.icon
              const active = pathname?.startsWith(item.href)
              return (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className={
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors " +
                      (active
                        ? "bg-green-50 text-green-700"
                        : "text-gray-700 hover:bg-gray-100")
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <div className="px-2 mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <BookOpen className="h-3.5 w-3.5" /> Documentation
          </div>
          <ul className="space-y-1">
            {nav.docs.map((item) => (
              <li key={item.title}>
                <Link href={item.href} className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="mt-auto px-4 py-4 border-t text-sm">
        <div className="font-medium">{displayName}</div>
        {displayEmail ? (
          <div className="text-gray-500 text-xs">{displayEmail}</div>
        ) : null}
        <div className="mt-3 flex gap-2">
          <Link href="/auth/signin" className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs hover:bg-gray-50">
            <Settings className="h-3.5 w-3.5" /> Account
          </Link>
          <button onClick={handleSignOut} className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs hover:bg-gray-50">
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
