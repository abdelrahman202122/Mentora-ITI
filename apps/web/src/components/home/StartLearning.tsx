"use client";

import Link from "next/link";
import { useLocale } from "next-intl";

import { Button } from "@/components/ui/button";
import { getLocalePath } from "@/utils/i18n/locale-path";

export default function StartLearning() {
  const locale = useLocale();

  return (
    <div className="w-full px-4 py-8 sm:px-6 md:py-16 lg:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-indigo-100 bg-indigo-50 text-center">
        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center justify-center space-y-6 px-4 py-12 sm:px-12 md:py-20">
          <h2 className="text-2xl font-semibold leading-tight tracking-tight text-slate-950 xs:text-3xl sm:text-4xl sm:leading-none md:text-5xl">
            Ready to find your <br className="xs:hidden" /> tutor?
          </h2>

          <p className="max-w-md text-sm leading-relaxed text-slate-700 sm:max-w-none sm:text-base md:text-lg">
            Search verified tutors, compare your options, and book the lesson that fits your goals.
          </p>

          <div className="w-full pt-4 sm:w-auto">
            <Button
              asChild
              size="lg"
              className="w-full cursor-pointer rounded-lg bg-indigo-600 px-8 py-6 text-base font-medium text-white transition-colors duration-200 hover:bg-indigo-700 sm:w-auto"
            >
              <Link href={getLocalePath(locale, "/FindTutor")}>Find tutors</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
