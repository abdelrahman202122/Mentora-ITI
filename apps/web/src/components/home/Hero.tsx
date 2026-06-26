'use client';

import { useLocale } from 'next-intl';
import { getLocalePath } from '@/utils/i18n/locale-path';
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import Image from "next/image"
import heroImage from "../../../public/Hero.jpg"
import Link from 'next/link'

export default function Hero() {
  const locale = useLocale();
  return (
    <section className="flex flex-col lg:flex-row items-center justify-between gap-12 px-6 py-16 lg:px-20">
      {/* Left Content */}
      <div className="flex-1 space-y-6">
        <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full">
          Tutoring that fits
        </span>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
          Find the right tutor for your learning goals
        </h1>
        <p className="text-lg text-slate-600 max-w-lg">
          Browse verified tutors or ask Mentora AI to suggest matches based on your subject, level, language, and budget.
        </p>
        
        <div className="relative max-w-md">
          <Button
            asChild
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-md"
          >
            <Link href={getLocalePath(locale, "/FindTutor")}>
              <Search className="w-5 h-5 mr-2" />
              Find tutors
            </Link>
          </Button>
        </div>

        {/* Social Proof */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200" />
            ))}
          </div>
          <span className="text-sm font-medium text-slate-700">1,200+ tutors ready to help</span>
        </div>
      </div>

      {/* Right Image Container */}
      <div className="flex-1 w-full max-w-xl">
        <div className="relative rounded-2xl border border-slate-200 bg-slate-100 p-6">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-white">
            <Image
              src={heroImage}
              alt="Learner studying with tutor support"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 576px"
              priority
            />
          </div>
          {/* Floating Badge */}
          <div className="absolute -right-4 -top-4 max-w-[150px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="font-bold text-xs flex items-center gap-1 text-indigo-600">
              Verified tutors
            </p>
            <p className="text-xs text-slate-500 mt-1">Compare subjects, levels, prices, and availability.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
