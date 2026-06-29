'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ChevronLeft, ChevronRight, Home, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUser, useLogout } from '@/hooks/auth/use-auth';
import { getLocalePath } from '@/utils/i18n/locale-path';
import {
  SidebarRole,
  resolveRole,
  navLinksByRole,
} from '../sidebar/SidebarNavLinks';

interface SidebarProps {
  role?: SidebarRole;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const [collapsed, setCollapsed] = useState(false);
  const { data: currentUser } = useCurrentUser();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();

  const effectiveRole = resolveRole(role, currentUser?.role);
  const navLinks = navLinksByRole[effectiveRole];

  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [cacheVersion, setCacheVersion] = useState('');

  useEffect(() => {
    setCacheVersion(Date.now().toString());
    setAvatarLoadFailed(false);
  }, [currentUser?.avatar]);

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

  const avatarSrc =
    currentUser?.avatar && !avatarLoadFailed
      ? `/api/files/avatars/${currentUser.avatar}${cacheVersion ? `?v=${cacheVersion}` : ''}`
      : null;

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
      className={`
      h-screen bg-white border-r flex flex-col p-4 gap-2
      transition-all duration-300 shrink-0
      ${collapsed ? 'w-16' : 'w-56'}
    `}
    >
      {/* Toggle Button */}
      <Button
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        onClick={() => setCollapsed(!collapsed)}
        className="mb-2 self-end text-gray-500"
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </Button>

      {/* Logo */}
      {!collapsed && (
        <div className="text-indigo-600 font-bold text-xl mb-2">Mentora</div>
      )}

      {/* User Info */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={currentUser?.name || 'User Avatar'}
              width={36}
              height={36}
              className="w-full h-full object-cover"
              onError={() => setAvatarLoadFailed(true)}
            />
          ) : (
            <span className="text-sm font-bold text-gray-500 uppercase">
              {currentUser?.name?.[0] || '?'}
            </span>
          )}
        </div>

        {!collapsed && (
          <span className="text-sm font-medium text-gray-700 truncate max-w-30">
            {currentUser?.name ?? ''}
          </span>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-1">
        {navLinks.map((navLink) => {
          const href = getLocalePath(locale, navLink.path);
          const activePath = href.split(/[?#]/)[0];
          const isActive =
            pathname === activePath || pathname.startsWith(`${activePath}/`);
          return (
            <Link
              key={navLink.path}
              href={href}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${
                collapsed ? 'justify-center' : 'justify-start'
              } ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              <navLink.icon size={18} className="shrink-0" />
              {!collapsed && <span>{navLink.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto space-y-1">
        <Button
          asChild
          className={`w-full gap-3 px-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 ${
            collapsed ? 'justify-center' : 'justify-start'
          }`}
          variant="ghost"
        >
          <Link href={getLocalePath(locale, '/')}>
            <Home size={18} className="shrink-0" />
            {!collapsed && <span>Home</span>}
          </Link>
        </Button>

        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`w-full cursor-pointer gap-3 px-2 text-gray-500 hover:bg-red-50 hover:text-red-500 ${
            collapsed ? 'justify-center' : 'justify-start'
          }`}
          type="button"
          variant="ghost"
        >
          {isLoggingOut ? (
            <Loader2 size={18} className="shrink-0 animate-spin" />
          ) : (
            <LogOut size={18} className="shrink-0" />
          )}
          {!collapsed && (
            <span>{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
          )}
        </Button>
      </div>
    </aside>
  );
}
