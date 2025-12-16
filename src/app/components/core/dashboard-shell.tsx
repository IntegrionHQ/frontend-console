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
    // Avoid duplicating the root 'Dashboard' crumb
    if (parts[0] === 'dashboard') {
      parts = parts.slice(1)
    }
    const acc: { href: string; label: string }[] = []
    parts.forEach((seg, i) => {
      const href = '/dashboard' + (i >= 0 ? '/' + parts.slice(0, i + 1).join('/') : '')
      const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ')
      acc.push({ href, label })
    })
    return acc
  }, [pathname])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-10 flex justify-between h-16 items-center border-b border-slate-200 bg-white/90 backdrop-blur-sm px-6 shadow-sm">
            <nav className="text-sm text-slate-600 flex items-center gap-2 manrope">
              <Link href="/dashboard" className="hover:text-slate-900 font-medium transition-colors">Dashboard</Link>
              {crumbs.map((c, i) => (
                <React.Fragment key={c.href}>
                  <span className="text-slate-300">/</span>
                  {i === crumbs.length - 1 ? (
                    <span className="text-slate-900 font-semibold">{c.label}</span>
                  ) : (
                    <Link href={c.href} className="hover:text-slate-900 font-medium transition-colors">{c.label}</Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
            <div className='flex justify-center items-center'>
              <SystemOperational/>
            </div>
          </header>
          <div className="p-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
