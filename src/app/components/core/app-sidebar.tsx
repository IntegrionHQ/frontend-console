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
  LogOut,
  BookOpen,
} from "lucide-react"
import { useUser } from "@/app/store/global/context/userContext"

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
      clearUser()
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
    <aside className="h-screen sticky top-0 w-60 shrink-0 border-r border-gray-200 bg-white flex flex-col">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-gray-200">
        <div className="nav text-xs uppercase tracking-widest text-black font-bold">[ INTEGRION ]</div>
        <div className="mt-1 nav text-[10px] uppercase tracking-widest text-gray-400">Beta</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div>
          <div className="px-2 mb-2 nav text-[10px] uppercase tracking-widest text-gray-400">General</div>
          <ul className="space-y-0.5">
            {nav.main.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className={
                      "flex items-center gap-3 px-3 py-2 text-sm transition-all " +
                      (active
                        ? "bg-black text-white font-medium shadow-[2px_2px_0px_0px] shadow-gray-300"
                        : "text-gray-700 hover:bg-gray-50 hover:text-black")
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="nav text-xs uppercase tracking-wide">{item.title}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <div className="px-2 mb-2 flex items-center gap-2 nav text-[10px] uppercase tracking-widest text-gray-400">
            <BookOpen className="h-3 w-3" /> Docs
          </div>
          <ul className="space-y-0.5">
            {nav.docs.map((item) => (
              <li key={item.title}>
                <Link href={item.href} className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-all">
                  <span className="font-aeonik-light text-xs">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* User Footer */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="text-sm font-semibold text-black truncate">{displayName}</div>
        {displayEmail && (
          <div className="text-xs text-gray-400 font-aeonik-light mt-0.5 truncate">{displayEmail}</div>
        )}
        <div className="mt-3 flex gap-2">
          <Link href="/auth/signin" className="inline-flex items-center gap-1.5 border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 hover:border-black hover:text-black transition-all nav uppercase tracking-wide">
            <Settings className="h-3 w-3" /> Settings
          </Link>
          <button onClick={handleSignOut} className="inline-flex items-center gap-1.5 border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 hover:border-black hover:text-black transition-all nav uppercase tracking-wide">
            <LogOut className="h-3 w-3" /> Out
          </button>
        </div>
      </div>
    </aside>
  )
}
