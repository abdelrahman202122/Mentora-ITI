// import {
//   LayoutDashboard,
//   Users,
//   MessageSquare,
//   CreditCard,
//   Settings,
//   Bot,
//   CalendarClock,
//   Wallet,
//   ShieldCheck,
//   GraduationCap,
//   Clock,
//   type LucideIcon,
// } from "lucide-react"

// export type SidebarRole = "learner" | "tutor" | "admin"

// export interface NavLink {
//   path: string
//   icon: LucideIcon
//   label: string
// }

// const learnerNavLinks: NavLink[] = [
//   { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
//   { path: "/ai-assistant", icon: Bot, label: "AI Assistant" },
//   { path: "/find-tutor?mode=browse", icon: Users, label: "Find Tutor" },
//   { path: "/messages", icon: MessageSquare, label: "Messages" },
//   { path: "/paymentHistory", icon: CreditCard, label: "Payments" },
//   { path: "/settings", icon: Settings, label: "Settings" },
// ]

// // adjust these paths/labels to match your real tutor routes once they exist
// const tutorNavLinks: NavLink[] = [
//   { path: "/tutor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
//   { path: "/tutor/messages", icon: MessageSquare, label: "Messages" },
//   { path: "/tutor/payment", icon: Wallet, label: "Earnings" },
//   { path: "/tutor/availability", icon: Clock, label: "availability" },
//   { path: "/tutor/profile/edit", icon: Settings, label: "Profile" },
//   { path: "/tutor/reviews", icon: CalendarClock, label: "Reviews" },
// ]

// // adjust these paths/labels to match your real admin routes once they exist
// const adminNavLinks: NavLink[] = [
//   { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
//   { path: "/users", icon: Users, label: "Users" },
//   { path: "/tutors", icon: GraduationCap, label: "Tutors" },
//   { path: "/moderation", icon: ShieldCheck, label: "Moderation" },
//   { path: "/payments", icon: CreditCard, label: "Payments" },
//   { path: "/settings", icon: Settings, label: "Settings" },
// ]

// export const navLinksByRole: Record<SidebarRole, NavLink[]> = {
//   learner: learnerNavLinks,
//   tutor: tutorNavLinks,
//   admin: adminNavLinks,
// }

// export function resolveRole(
//   propRole: SidebarRole | undefined,
//   userRole: string | undefined
// ): SidebarRole {
//   if (propRole) return propRole
//   if (userRole === "tutor" || userRole === "admin") return userRole
//   return "learner"
// }
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
  Clock,
  type LucideIcon,
} from "lucide-react"

export type SidebarRole = "learner" | "tutor" | "admin"

export interface NavLink {
  path: string
  icon: LucideIcon
  label: string
}

export function getNavLinksByRole(
  t: (key: string) => string
): Record<SidebarRole, NavLink[]> {
  const learnerNavLinks: NavLink[] = [
    { path: "/dashboard", icon: LayoutDashboard, label: t("learner.dashboard") },
    { path: "/ai-assistant", icon: Bot, label: t("learner.aiAssistant") },
    { path: "/find-tutor?mode=browse", icon: Users, label: t("learner.findTutor") },
    { path: "/messages", icon: MessageSquare, label: t("learner.messages") },
    { path: "/paymentHistory", icon: CreditCard, label: t("learner.payments") },
    { path: "/settings", icon: Settings, label: t("learner.settings") },
  ]

  const tutorNavLinks: NavLink[] = [
    { path: "/tutor/dashboard", icon: LayoutDashboard, label: t("tutor.dashboard") },
    { path: "/tutor/messages", icon: MessageSquare, label: t("tutor.messages") },
    { path: "/tutor/payment", icon: Wallet, label: t("tutor.earnings") },
    { path: "/tutor/availability", icon: Clock, label: t("tutor.availability") },
    { path: "/tutor/profile/edit", icon: Settings, label: t("tutor.profile") },
    { path: "/tutor/reviews", icon: CalendarClock, label: t("tutor.reviews") },
  ]

  const adminNavLinks: NavLink[] = [
    { path: "/dashboard", icon: LayoutDashboard, label: t("admin.dashboard") },
    { path: "/users", icon: Users, label: t("admin.users") },
    { path: "/tutors", icon: GraduationCap, label: t("admin.tutors") },
    { path: "/moderation", icon: ShieldCheck, label: t("admin.moderation") },
    { path: "/payments", icon: CreditCard, label: t("admin.payments") },
    { path: "/settings", icon: Settings, label: t("admin.settings") },
  ]

  return {
    learner: learnerNavLinks,
    tutor: tutorNavLinks,
    admin: adminNavLinks,
  }
}

export function resolveRole(
  propRole: SidebarRole | undefined,
  userRole: string | undefined
): SidebarRole {
  if (propRole) return propRole
  if (userRole === "tutor" || userRole === "admin") return userRole
  return "learner"
}