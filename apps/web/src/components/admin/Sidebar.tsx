'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  DollarSign,
  Star,
  Settings,
  LogOut,
  X,
  Loader2,
} from 'lucide-react'
import { logout } from '@/lib/api/auth'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const mainNavItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { name: 'Users', icon: Users, href: '/admin/users' },
  { name: 'Tutors', icon: GraduationCap, href: '/admin/tutors' },
  { name: 'Bookings', icon: Calendar, href: '/admin/bookings' },
  { name: 'Finance', icon: DollarSign, href: '/admin/finance' },
  { name: 'Reviews', icon: Star, href: '/admin/reviews' },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Remove locale from path (e.g., /en/admin/users -> /admin/users)
  const getPathWithoutLocale = (path: string) => {
    const match = path.match(/^\/([a-z]{2})\/(admin.*)$/)
    if (match) {
      return '/' + match[2]
    }
    return path
  }

  const cleanPath = getPathWithoutLocale(pathname)

  const isActive = (href: string) => {
    if (href === '/admin') {
      return cleanPath === '/admin'
    }
    return cleanPath === href || cleanPath?.startsWith(href + '/')
  }

  // ✅ Logout handler — calls API then redirects
  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      // Full page reload to login — clears all client state
      window.location.href = '/login'
    }
  }

  return (
    <>
      {/* ─── Mobile backdrop (click to close) ─── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={[
          // Base styles
          'fixed md:static inset-y-0 left-0 z-50',
          'w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 h-full',
          // Slide animation for mobile
          'transform transition-transform duration-300 ease-in-out',
          // Position: hidden on mobile when closed, visible on desktop always
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        {/* Header */}
        <div className="px-6 pb-5 pt-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
            <p className="text-xs text-gray-500">System Overview</p>
          </div>
          {/* ✅ Close button (mobile only) */}
          <button
            type="button"
            onClick={onClose}
            className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {mainNavItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={[
                  'flex items-center gap-3 rounded-lg px-3 py-2.5',
                  'text-sm font-medium transition-colors',
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
                ].join(' ')}
              >
                <Icon
                  className={[
                    'h-5 w-5',
                    active ? 'text-white' : 'text-gray-400',
                  ].join(' ')}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="px-3 pb-4 pt-2 border-t border-gray-200">
          <div className="space-y-1">
            {/* Settings link */}
            <Link
              href="/admin/settings"
              onClick={onClose}
              className={[
                'flex items-center gap-3 rounded-lg px-3 py-2.5',
                'text-sm font-medium transition-colors',
                isActive('/admin/settings')
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
              ].join(' ')}
            >
              <Settings
                className={[
                  'h-5 w-5',
                  isActive('/admin/settings') ? 'text-white' : 'text-gray-400',
                ].join(' ')}
              />
              Settings
            </Link>

            {/* ✅ Logout button — red hover background */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoggingOut ? (
                <Loader2 className="h-5 w-5 animate-spin text-red-500" />
              ) : (
                <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
              )}
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}