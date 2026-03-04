'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AppSidebar } from './app-sidebar'
import SystemOperational from '../SystemOperational'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const crumbs = React.useMemo(() => {
    let parts = pathname.split('/').filter(Boolean)
    if (parts[0] === 'dashboard') parts = parts.slice(1)
    const acc: { href: string; label: string }[] = []
    parts.forEach((seg, i) => {
      const href = '/dashboard/' + parts.slice(0, i + 1).join('/')
      const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ')
      acc.push({ href, label })
    })
    return acc
  }, [pathname])

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-10 flex justify-between h-12 items-center border-b border-gray-200 bg-white/90 backdrop-blur-sm px-6">
            <nav className="flex items-center gap-2 nav text-xs uppercase tracking-wide text-gray-400">
              <Link href="/dashboard" className="hover:text-black transition-colors">Dashboard</Link>
              {crumbs.map((c, i) => (
                <React.Fragment key={c.href}>
                  <span className="text-gray-300">/</span>
                  {i === crumbs.length - 1 ? (
                    <span className="text-black font-medium">{c.label}</span>
                  ) : (
                    <Link href={c.href} className="hover:text-black transition-colors">{c.label}</Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
            <SystemOperational />
          </header>
          <div className="p-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
