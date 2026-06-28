import {
  LayoutDashboard,
  Users,
  MessageSquare,
  CreditCard,
  Settings,
  Bot,
  CalendarClock,
  Wallet,
  ShieldCheck,
  GraduationCap,
  type LucideIcon,
} from "lucide-react"

export type SidebarRole = "learner" | "tutor" | "admin"

export interface NavLink {
  path: string
  icon: LucideIcon
  label: string
}

const learnerNavLinks: NavLink[] = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/ai-assistant", icon: Bot, label: "AI Assistant" },
  { path: "/tutor-match", icon: Users, label: "Tutor Match" },
  { path: "/messages", icon: MessageSquare, label: "Messages" },
  { path: "/paymentHistory", icon: CreditCard, label: "Payments" },
  { path: "/settings", icon: Settings, label: "Settings" },
]

// adjust these paths/labels to match your real tutor routes once they exist
const tutorNavLinks: NavLink[] = [
  { path: "/tutor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/tutor/messages", icon: MessageSquare, label: "Messages" },
  { path: "/tutor/payment", icon: Wallet, label: "Earnings" },
  { path: "/tutor/profile/edit", icon: Settings, label: "Profile" },
  { path: "/tutor/reviews", icon: CalendarClock, label: "Reviews" },
]

// adjust these paths/labels to match your real admin routes once they exist
const adminNavLinks: NavLink[] = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/users", icon: Users, label: "Users" },
  { path: "/tutors", icon: GraduationCap, label: "Tutors" },
  { path: "/moderation", icon: ShieldCheck, label: "Moderation" },
  { path: "/payments", icon: CreditCard, label: "Payments" },
  { path: "/settings", icon: Settings, label: "Settings" },
]

export const navLinksByRole: Record<SidebarRole, NavLink[]> = {
  learner: learnerNavLinks,
  tutor: tutorNavLinks,
  admin: adminNavLinks,
}

export function resolveRole(
  propRole: SidebarRole | undefined,
  userRole: string | undefined
): SidebarRole {
  if (propRole) return propRole
  if (userRole === "tutor" || userRole === "admin") return userRole
  return "learner"
}
