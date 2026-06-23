import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { getLocalePath } from '@/utils/i18n/locale-path';

export default function Header() {
  const locale = useLocale();

  return (
    <nav className="flex items-center justify-between px-2 sm:px-8 py-4 bg-white border-b border-gray-100">
      
      <Link href={getLocalePath(locale, '/')} className="text-xl font-bold text-indigo-600 cursor-pointer">
        Mentora
      </Link>
      
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg bg-transparent hover:bg-indigo-50 transition cursor-pointer">
          <Link href={getLocalePath(locale, '/login')}>
            Become a Mentor
          </Link>
        </Button>
        <Button asChild className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition cursor-pointer">
          <Link href={getLocalePath(locale, '/login')}>
            Log In
          </Link>
        </Button>
      </div>
    </nav>
  );
}