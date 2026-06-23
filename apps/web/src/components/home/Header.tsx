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
          
          /* الحالة الثانية: مسجل دخول (يظهر الـ Dashboard وزرار الـ Logout الشغال) */
          <>
            <Link href={getLocalePath(locale, "/dashboard")}>
              <Button 
                variant="outline" 
                className="px-3 sm:px-4 py-2 text-indigo-600 border-indigo-600 rounded-lg bg-transparent hover:bg-indigo-50 transition flex items-center gap-2"
              >
                <LayoutDashboard className="size-4" />
                <span className="hidden xs:inline">Dashboard</span>
              </Button>
            </Link>

            <Button 
              onClick={handleLogout} // تشغيل الدالة عند الضغط
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
          
          /* الحالة الثالثة: ضيف غير مسجل */
          <>
            <Button 
              variant="outline" 
              className="px-3 sm:px-4 py-2 text-indigo-600 border-indigo-600 rounded-lg bg-transparent hover:bg-indigo-50 transition"
            >
              Become a Mentor
            </Button>
            
            <Link href={getLocalePath(locale, "/login")}>
              <Button className="px-3 sm:px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition cursor-pointer">
                Log In
              </Button>
            </Link>
          </>
        )}
        
      </div>
    </nav>
  );
}