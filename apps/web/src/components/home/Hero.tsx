'use client';

import { useLocale, useTranslations } from 'next-intl';
import { getLocalePath } from '@/utils/i18n/locale-path';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import Image from 'next/image';
import heroImage from '../../../public/Hero.jpg';
import Link from 'next/link';

export default function Hero() {
  const locale = useLocale();
  const t = useTranslations('home.hero');

  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:flex-row lg:px-8">
      <div className="w-full flex-1 space-y-6 text-center lg:text-start">
        <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full">
          {t('badge')}
        </span>
        <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight tracking-normal text-slate-900 sm:text-4xl lg:mx-0 lg:text-5xl">
          {t('title')}
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600 sm:text-lg lg:mx-0 lg:max-w-lg">
          {t('description')}
        </p>
        
        <div className="flex justify-center lg:justify-start">
          <Button
            asChild
            className="h-12 rounded-lg bg-indigo-600 px-6 font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <Link href={getLocalePath(locale, '/find-tutor')}>
              <Search className="me-2 size-5" />
              {t('findTutors')}
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-center gap-3 lg:justify-start">
          <div className="flex -space-x-2 rtl:space-x-reverse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200" />
            ))}
          </div>
          <span className="text-sm font-medium text-slate-700">{t('socialProof')}</span>
        </div>
      </div>

      <div className="flex-1 w-full max-w-xl">
        <div className="relative rounded-2xl border border-slate-200 bg-slate-100 p-6">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-white">
            <Image
              src={heroImage}
              alt={t('heroImageAlt')}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 576px"
              priority
            />
          </div>
          <div className="absolute -top-4 end-3 max-w-[150px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:-top-4 sm:end-4">
            <p className="font-bold text-xs flex items-center gap-1 text-indigo-600">
              {t('verifiedBadge')}
            </p>
            <p className="text-xs text-slate-500 mt-1">{t('verifiedDescription')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
