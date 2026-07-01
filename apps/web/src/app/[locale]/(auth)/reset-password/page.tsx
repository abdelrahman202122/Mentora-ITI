'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getLocalePath } from '@/utils/i18n/locale-path';

/**
 * This page now redirects to /forgot-password since the full
 * OTP-based reset flow (email → code → new password) lives there.
 */
export default function ResetPasswordPage() {
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    router.replace(getLocalePath(locale, '/forgot-password'));
  }, [locale, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
      <Loader2 className="size-8 animate-spin text-indigo-600" />
    </main>
  );
}
