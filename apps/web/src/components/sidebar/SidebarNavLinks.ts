import {
  Bot,
  CalendarClock,
  Clock,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export type SidebarRole = 'learner' | 'tutor' | 'admin';

export interface NavLink {
  path: string;
  icon: LucideIcon;
  label: string;
}

export function getNavLinksByRole(
  t: (key: string) => string,
): Record<SidebarRole, NavLink[]> {
  return {
    learner: [
      { path: '/dashboard', icon: LayoutDashboard, label: t('learner.dashboard') },
      { path: '/ai-assistant', icon: Bot, label: t('learner.aiAssistant') },
      { path: '/find-tutor?mode=browse', icon: Users, label: t('learner.findTutor') },
      { path: '/messages', icon: MessageSquare, label: t('learner.messages') },
      { path: '/paymentHistory', icon: CreditCard, label: t('learner.payments') },
      { path: '/settings', icon: Settings, label: t('learner.settings') },
    ],
    tutor: [
      { path: '/tutor/dashboard', icon: LayoutDashboard, label: t('tutor.dashboard') },
      { path: '/tutor/messages', icon: MessageSquare, label: t('tutor.messages') },
      { path: '/tutor/payment', icon: Wallet, label: t('tutor.earnings') },
      { path: '/tutor/availability', icon: Clock, label: t('tutor.availability') },
      { path: '/tutor/profile/edit', icon: Settings, label: t('tutor.profile') },
      { path: '/tutor/reviews', icon: CalendarClock, label: t('tutor.reviews') },
    ],
    admin: [
      { path: '/dashboard', icon: LayoutDashboard, label: t('admin.dashboard') },
      { path: '/users', icon: Users, label: t('admin.users') },
      { path: '/tutors', icon: GraduationCap, label: t('admin.tutors') },
      { path: '/moderation', icon: ShieldCheck, label: t('admin.moderation') },
      { path: '/payments', icon: CreditCard, label: t('admin.payments') },
      { path: '/settings', icon: Settings, label: t('admin.settings') },
    ],
  };
}

export function resolveRole(
  propRole: SidebarRole | undefined,
  userRole: string | undefined,
  userRoles: string[] = [],
): SidebarRole {
  if (propRole) return propRole;
  if (userRoles.includes('admin')) return 'admin';
  if (userRoles.includes('tutor')) return 'tutor';
  if (userRole === 'tutor' || userRole === 'admin') return userRole;
  return 'learner';
}
