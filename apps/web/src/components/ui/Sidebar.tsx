'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Home,
  Loader2,
  LogOut,
} from 'lucide-react';

import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Button } from '@/components/ui/button';
import { useCurrentUser, useLogout } from '@/hooks/auth/use-auth';
import { hasRole } from '@/utils/auth/role-utils';
import { getLocalePath } from '@/utils/i18n/locale-path';
import {
  getNavLinksByRole,
  resolveRole,
  type SidebarRole,
} from '../sidebar/SidebarNavLinks';

interface SidebarProps {
  role?: SidebarRole;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('sidebar');
  const tNav = useTranslations('nav');
  const [collapsed, setCollapsed] = useState(false);
  const { data: currentUser } = useCurrentUser();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();

  const effectiveRole = resolveRole(role, currentUser?.role, currentUser?.roles);
  const navLinks = getNavLinksByRole(tNav)[effectiveRole];
  const canSwitchModes =
    hasRole(currentUser, 'learner') && hasRole(currentUser, 'tutor');
  const switchModePath =
    effectiveRole === 'tutor' ? '/dashboard' : '/tutor/dashboard';
  const switchModeLabel =
    effectiveRole === 'tutor' ? t('switchToLearner') : t('switchToTutor');

  const [failedAvatar, setFailedAvatar] = useState<string | null>(null);
  const avatarRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    return () => {
      if (avatarRetryTimerRef.current) {
        clearTimeout(avatarRetryTimerRef.current);
      }
    };
  }, []);

  const avatarFileName = currentUser?.avatar ?? null;
  const avatarSrc =
    avatarFileName && failedAvatar !== avatarFileName
      ? `/api/files/avatars/${avatarFileName}`
      : null;

  function handleAvatarError() {
    if (!avatarFileName) {
      return;
    }

    setFailedAvatar(avatarFileName);

    if (avatarRetryTimerRef.current) {
      clearTimeout(avatarRetryTimerRef.current);
    }

    avatarRetryTimerRef.current = setTimeout(() => {
      setFailedAvatar((currentFailedAvatar) =>
        currentFailedAvatar === avatarFileName ? null : currentFailedAvatar,
      );
      avatarRetryTimerRef.current = null;
    }, 30000);
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    } finally {
      window.location.href = getLocalePath(locale, '/login');
    }
  }

  return (
    <aside
      className={`flex h-screen shrink-0 flex-col gap-2 border-e bg-white p-4 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <Button
        aria-label={collapsed ? t('expand') : t('collapse')}
        className="mb-2 self-end text-gray-500 rtl:self-start"
        onClick={() => setCollapsed(!collapsed)}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </Button>

      {!collapsed && (
        <div className="mb-2 text-xl font-bold text-indigo-600">Mentora</div>
      )}

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
          {avatarSrc ? (
            <Image
              alt={currentUser?.name || t('userAvatar')}
              className="h-full w-full object-cover"
              height={36}
              onError={handleAvatarError}
              src={avatarSrc}
              width={36}
            />
          ) : (
            <span className="text-sm font-bold uppercase text-gray-500">
              {currentUser?.name?.[0] || '?'}
            </span>
          )}
        </div>

        {!collapsed && (
          <span className="max-w-30 truncate text-sm font-medium text-gray-700">
            {currentUser?.name ?? ''}
          </span>
        )}
      </div>

      <nav className="flex flex-col gap-1">
        {navLinks.map((navLink) => {
          const href = getLocalePath(locale, navLink.path);
          const activePath = href.split(/[?#]/)[0];
          const isActive =
            pathname === activePath || pathname.startsWith(`${activePath}/`);

          return (
            <Link
              className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors ${
                collapsed ? 'justify-center' : 'justify-start'
              } ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
              href={href}
              key={navLink.path}
            >
              <navLink.icon className="shrink-0" size={18} />
              {!collapsed && <span>{navLink.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1">
        {canSwitchModes ? (
          <Button
            asChild
            className={`w-full gap-3 px-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 ${
              collapsed ? 'justify-center' : 'justify-start'
            }`}
            variant="ghost"
          >
            <Link href={getLocalePath(locale, switchModePath)}>
              <ArrowLeftRight className="shrink-0" size={18} />
              {!collapsed && <span>{switchModeLabel}</span>}
            </Link>
          </Button>
        ) : null}

        <NotificationBell collapsed={collapsed} role={effectiveRole} />

        <Button
          asChild
          className={`w-full gap-3 px-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 ${
            collapsed ? 'justify-center' : 'justify-start'
          }`}
          variant="ghost"
        >
          <Link href={getLocalePath(locale, '/')}>
            <Home className="shrink-0" size={18} />
            {!collapsed && <span>{t('home')}</span>}
          </Link>
        </Button>

        <Button
          className={`w-full cursor-pointer gap-3 px-2 text-gray-500 hover:bg-red-50 hover:text-red-500 ${
            collapsed ? 'justify-center' : 'justify-start'
          }`}
          disabled={isLoggingOut}
          onClick={handleLogout}
          type="button"
          variant="ghost"
        >
          {isLoggingOut ? (
            <Loader2 className="shrink-0 animate-spin" size={18} />
          ) : (
            <LogOut className="shrink-0" size={18} />
          )}
          {!collapsed && (
            <span>{isLoggingOut ? t('loggingOut') : t('logOut')}</span>
          )}
        </Button>
      </div>
    </aside>
  );
}
