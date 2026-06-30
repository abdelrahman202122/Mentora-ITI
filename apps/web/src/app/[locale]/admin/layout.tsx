"use client"

import { useState } from "react"
import Sidebar from "@/components/admin/Sidebar"
import Header from "@/components/admin/Header"
import { useSilentTokenRefresh } from "@/hooks/admin/useSilentTokenRefresh"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useSilentTokenRefresh() // keep access token fresh in the background

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ fontFamily: "var(--font-geist-sans)" }}
    >
    
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}