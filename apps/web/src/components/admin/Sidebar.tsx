


'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  DollarSign,
  Star,
  Settings,
  LogOut,
} from 'lucide-react'

const mainNavItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { name: 'Users', icon: Users, href: '/admin/users' },
  { name: 'Tutors', icon: GraduationCap, href: '/admin/tutors' },
  { name: 'Bookings', icon: Calendar, href: '/admin/bookings' },
  { name: 'Finance', icon: DollarSign, href: '/admin/finance' },
  { name: 'Reviews', icon: Star, href: '/admin/reviews' },
]

const bottomNavItems = [
  { name: 'Settings', icon: Settings, href: '/admin/settings' },
  { name: 'Logout', icon: LogOut, href: '/admin/logout' },
]

export default function Sidebar() {
  const pathname = usePathname()

  // Remove locale from path (e.g., /en/admin/users -> /admin/users)
  const getPathWithoutLocale = (path: string) => {
    const match = path.match(/^\/([a-z]{2})\/(admin.*)$/)
    if (match) {
      return '/' + match[2]
    }
    return path
  }

  const cleanPath = getPathWithoutLocale(pathname)

  // Check if current path matches the nav item
  const isActive = (href: string) => {
    if (href === '/admin') {
      return cleanPath === '/admin'
    }
    return cleanPath === href || cleanPath?.startsWith(href + '/')
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 h-full">
      {/* Header */}
      <div className="px-6 pb-5 pt-6">
        <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
        <p className="text-xs text-gray-500">System Overview</p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {mainNavItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
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
          {bottomNavItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
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
        </div>
      </div>
    </aside>
  )
}