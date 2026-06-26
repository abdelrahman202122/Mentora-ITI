"use client";

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Loader2, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUser, useLogout } from '@/hooks/auth/use-auth';
import { getLocalePath } from '@/utils/i18n/locale-path';
import { useRouter } from 'next/navigation'; // استيراد الـ Router للتحويل البرمجي

export default function Header() {
  const locale = useLocale();
  const router = useRouter();
  
  // 1. جلب بيانات المستخدم، حالة التحميل، ودالة الـ logout
  const { data: user, isPending } = useCurrentUser();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();

  // 2. دالة معالجة تسجيل الخروج والتحويل
  const handleLogout = async () => {
    try {
      // تنفيذ دالة تسجيل الخروج لتنظيف الـ Cookies / LocalStorage والـ State
      if (logout) {
        await logout();
      }
    } catch (error) {
      console.error("Failed to logout:", error);
    } finally {
      // التحويل لصفحة الـ Login بالمسار الصحيح المترجم
      router.push(getLocalePath(locale, "/login"));
    }
  };

  // 3. دالة تسجيل الخروج للتحول إلى مدرس والذهاب لصفحة تسجيل الدخول ثم إنشاء الملف
  const handleBecomeMentor = async () => {
    try {
      if (logout) {
        await logout();
      }
    } catch (error) {
      console.error("Failed to logout before becoming mentor:", error);
    } finally {
      router.push(`${getLocalePath(locale, "/login")}?next=${encodeURIComponent(getLocalePath(locale, "/tutor/CreateProfile"))}`);
    }
  };

  return (
    <nav className="flex items-center justify-between px-4 sm:px-8 py-4 bg-white border-b border-gray-100">
      
      {/* اللوجو */}
      <Link href={getLocalePath(locale, "/")} className="text-xl font-bold text-indigo-600">
        Mentora
      </Link>
    
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* الحالة الأولى: التحميل */}
        {isPending ? (
          <Loader2 className="size-5 animate-spin text-indigo-600" />
        ) : user ? (
          
          /* الحالة الثانية والثالثة: مسجل دخول (طالب أو مدرس) */
          <>
            {/* يظهر زر Become a Mentor فقط لو كان المستخدم طالباً (learner) وليس مدرساً */}
            {user.role === 'learner' && (
              <Button 
                onClick={handleBecomeMentor}
                disabled={isLoggingOut}
                variant="outline" 
                className="px-3 sm:px-4 py-2 text-indigo-600 border-indigo-600 rounded-lg bg-transparent hover:bg-indigo-50 transition cursor-pointer flex items-center gap-2"
              >
                {isLoggingOut && <Loader2 className="size-4 animate-spin" />}
                <span>Become a Mentor</span>
              </Button>
            )}

            {/* زرار الـ Dashboard (ينتقل لـ /tutor/dashboard للمدرسين ولـ /dashboard للطلاب) */}
            <Button 
              asChild
              variant="outline" 
              className="px-3 sm:px-4 py-2 text-indigo-600 border-indigo-600 rounded-lg bg-transparent hover:bg-indigo-50 transition flex items-center gap-2"
            >
              <Link href={getLocalePath(locale, user.role === 'tutor' ? '/tutor/dashboard' : '/dashboard')}>
                <LayoutDashboard className="size-4" />
                <span className="xs:inline">Dashboard</span>
              </Link>
            
            </Button>

            <Button 
              onClick={handleLogout}
              variant="destructive"
              disabled={isLoggingOut}
              className="px-3 sm:px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition flex items-center gap-2 cursor-pointer"
            >
              {isLoggingOut ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </Button>
          </>
        ) : (
          
          /* الحالة الأولى: ضيف غير مسجل */
          <>
            {/* يضغط على Become a Mentor فيذهب لصفحة تسجيل الدخول مع توجيه لإنشاء الملف بعد النجاح */}
            <Button 
              asChild
              variant="outline" 
              className="px-3 sm:px-4 py-2 text-indigo-600 border-indigo-600 rounded-lg bg-transparent hover:bg-indigo-50 transition"
            >
              <Link href={`${getLocalePath(locale, "/login")}?next=${encodeURIComponent(getLocalePath(locale, "/tutor/CreateProfile"))}`}>
                Become a Mentor
              </Link>
            </Button>
            
            <Button 
              asChild
              className="px-3 sm:px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition cursor-pointer"
            >
              <Link href={getLocalePath(locale, "/login")}>
                Log In
              </Link>
            </Button>
          </>
        )}
        
      </div>
    </nav>
  );
}