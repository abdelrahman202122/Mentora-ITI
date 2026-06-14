"use client"
//& use client here because there are reactive things like usestate and useeffect
//&this component will render on the client side
//^ ----------------------Imports---------------------------------
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  CreditCard,
  Settings,
  LogOut,
  Bot,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
//& lucide-react is a library for icons
import { mockUser } from "@/lib/mockData"
//^-----------------------importing p end--------------------------

const learnerNavLinks = [
  { href: "/pages/learner/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/pages/learner/ai-assistant", icon: Bot, label: "AI Assistant" },
  { href: "/pages/learner/tutor-match", icon: Users, label: "Tutor Match" },
  { href: "/pages/learner/messages", icon: MessageSquare, label: "Messages" },
  { href: "/pages/learner/payments", icon: CreditCard, label: "Payments" },
  { href: "/pages/learner/settings", icon: Settings, label: "Settings" },
]
//^------------------------------LOGIC--------------------------------
export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  //& THE sidebar in big screens the default is not collapsed
  //& and in small screens like mobile default is collapsed


  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setCollapsed(true) 
        //& screen less than 768 sidebar will be collapsed
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])
  //& This code executed only one time when the screen is openned
  //& when i open another page that is not exist in sidebar the handleResize is still work on the background it makes memory leak so removed it 

//^----------------------------------UI-------------------------------
  return (
    <aside className={`
      h-screen bg-white border-r flex flex-col p-4 gap-2
      transition-all duration-300 flex-shrink-0
      ${collapsed ? "w-16" : "w-56"}
    `}>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="self-end p-1 rounded-lg hover:bg-gray-100 text-gray-500 mb-2"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Logo */}
      {!collapsed && (
        <div className="text-indigo-600 font-bold text-xl mb-2">
          Mentora
        </div>
      )}

      {/* User Info */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-full bg-gray-300 flex-shrink-0" />
        {!collapsed && (
          <span className="text-sm font-medium text-gray-700">
            {mockUser.firstName} {mockUser.lastName}
          </span>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-1">
        {learnerNavLinks.map((link) => {
          const isActive = pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${
                collapsed ? "justify-center" : "justify-start"
              } ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
              }`}
            >
              <link.icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto">
        <button
          className={`flex items-center gap-3 px-2 py-2 rounded-lg text-gray-500 hover:text-red-500 text-sm w-full ${
            collapsed ? "justify-center" : "justify-start"
          }`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>

    </aside>
  )
}