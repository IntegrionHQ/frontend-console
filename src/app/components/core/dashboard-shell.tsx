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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-10 flex justify-between h-14 items-center border-b bg-white/80 backdrop-blur px-4">
            <nav className="text-sm text-gray-600 flex items-center gap-2">
              <Link href="/dashboard" className="hover:text-gray-900">Dashboard</Link>
              {crumbs.map((c, i) => (
                <React.Fragment key={c.href}>
                  <span className="text-gray-300">/</span>
                  {i === crumbs.length - 1 ? (
                    <span className="text-gray-900 font-medium">{c.label}</span>
                  ) : (
                    <Link href={c.href} className="hover:text-gray-900">{c.label}</Link>
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
