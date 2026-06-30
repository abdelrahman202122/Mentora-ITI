'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="h-16 bg-white border-b-2 border-gray-200 px-4 sm:px-12 flex items-center justify-between shrink-0">
      {/* Left side: hamburger (mobile) + logo */}
      <div className="flex items-center gap-3">
        
        <button
          onClick={onMenuClick}
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center text-2xl sm:text-3xl text-indigo-600 font-bold">
          Mentora
        </div>
      </div>

      {/* Right side: dashboard button */}
      <button
        onClick={() => router.push('/admin')}
        className="px-4 sm:px-5 py-1 bg-blue-600 text-white rounded-sm transition-transform active:scale-95 text-sm sm:text-base"
      >
        my Dashboard
      </button>
    </header>
  )
}