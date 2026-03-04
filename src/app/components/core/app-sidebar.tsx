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
    <aside className="h-screen sticky top-0 w-64 shrink-0 border-r border-slate-200 bg-white text-slate-900">
      <div className="px-6 py-5 border-b border-slate-200">
        <div className="hemming text-xl font-semibold text-slate-900">Integrion</div>
        <div className="mt-1 text-xs text-slate-500 manrope">Beta Release</div>
      </div>

      <nav className="px-3 py-4 space-y-6 overflow-y-auto">
        <div>
          <div className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 manrope">General</div>
          <ul className="space-y-1">
            {nav.main.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className={
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all manrope " +
                      (active
                        ? "bg-slate-900 text-white font-semibold shadow-sm"
                        : "text-slate-700 hover:bg-slate-100 font-medium")
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
          <div className="px-3 mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 manrope">
            <BookOpen className="h-3.5 w-3.5" /> Documentation
          </div>
          <ul className="space-y-1">
            {nav.docs.map((item) => (
              <li key={item.title}>
                <Link href={item.href} className="block rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 font-medium manrope transition-all">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="mt-auto px-4 py-4 border-t border-slate-200 text-sm">
        <div className="font-semibold text-slate-900 hemming">{displayName}</div>
        {displayEmail ? (
          <div className="text-slate-500 text-xs manrope mt-0.5">{displayEmail}</div>
        ) : null}
        <div className="mt-3 flex gap-2">
          <Link href="/auth/signin" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50 font-medium manrope transition-all">
            <Settings className="h-3.5 w-3.5" /> Account
          </Link>
          <button onClick={handleSignOut} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50 font-medium manrope transition-all">
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
