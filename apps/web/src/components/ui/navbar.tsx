"use client"

import Link from "next/link"

type NavbarProps = {
  locale: string
  role?: "learner" | "tutor"
}

export function Navbar({ locale, role }: NavbarProps) {
  return (
    <header className="bg-white border-b border-gray-100 px-6 md:px-10 py-4 flex items-center justify-between">
              <span className="text-indigo-700 font-bold text-xl tracking-tight">Mentora</span>

      <Link href={`/${locale}/dashboard`}
              className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
>
        My Dashboard
      </Link>
    </header>
  )
}