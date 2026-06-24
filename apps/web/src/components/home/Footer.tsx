'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  GraduationCap,
  Mail,
  ArrowUp,
  Heart,
} from 'lucide-react';
import { getLocalePath } from '@/utils/i18n/locale-path';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Facebook = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Twitter = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Instagram = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Linkedin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Footer() {
  const locale = useLocale();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    { label: 'Facebook', url: 'https://facebook.com', icon: Facebook },
    { label: 'Twitter', url: 'https://twitter.com', icon: Twitter },
    { label: 'Instagram', url: 'https://instagram.com', icon: Instagram },
    { label: 'LinkedIn', url: 'https://linkedin.com', icon: Linkedin },
  ];

  const exploreLinks = [
    { label: 'Home', path: '/' },
    { label: 'Subjects', path: '/#subjects' },
    { label: 'How It Works', path: '/#how-it-works' },
    { label: 'Testimonials', path: '/#testimonials' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Help Center', path: '/help' },
  ];

  return (
    <footer className="relative bg-[#0B0F19] text-slate-400 overflow-hidden pt-16 pb-8 md:pt-20 border-t border-slate-900">
      {/* Decorative gradient blur background - تم تقليل حجمها على الموبايل عشان ميعملش Scroll أفقي خارجي */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-72 h-72 md:w-96 md:h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-72 h-72 md:w-96 md:h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Top Grid - تم تعديل توزيع الأعمدة على الموبايل والتابلت بشكل متناسق */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8 pb-12 md:pb-16 text-center sm:text-left">
          {/* Column 1: Brand & Bio */}
          <div className="space-y-4 md:space-y-6 flex flex-col items-center sm:items-start">
            <Link
              href={getLocalePath(locale, '/')}
              className="flex items-center gap-3 group text-white"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                <GraduationCap className="size-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text">
                Mentora
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xs mx-auto sm:mx-0">
              Mentora is a premium tutoring platform connecting students with
              certified educators. We aim to personalize education and make
              learning interactive, accessible, and delightful.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4 pt-2 justify-center sm:justify-start">
              {socialLinks.map(({ icon: Icon, url, label }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center justify-center size-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800 hover:text-white transition-all duration-300 group text-slate-400"
                >
                  <Icon className="size-5 group-hover:scale-110 transition-transform duration-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-200">
              Explore
            </h3>
            <ul className="space-y-3 md:space-y-4 text-sm">
              {exploreLinks.map(({ label, path }) => (
                <li key={label}>
                  <Link
                    href={getLocalePath(locale, path)}
                    className="hover:text-white transition-colors duration-200 block sm:inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact & Legal */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-200">
              Contact &amp; Legal
            </h3>
            <ul className="space-y-3 md:space-y-4 text-sm flex flex-col items-center sm:items-start">
              {legalLinks.map(({ label, path }) => (
                <li key={label}>
                  <Link
                    href={getLocalePath(locale, path)}
                    className="hover:text-white transition-colors duration-200 block sm:inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li className="flex items-center gap-2 pt-2 text-slate-400 justify-center sm:justify-start">
                <Mail className="size-4 text-indigo-400 shrink-0" />
                <span className="text-xs">support@mentora.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4 md:space-y-6 max-w-sm mx-auto w-full sm:mx-0 sm:max-w-none">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-200">
              Newsletter
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              Subscribe to stay updated with new courses, tutorials, and premium
              learning guides.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-3"
            >
              <Input
                type="email"
                required
                placeholder="Enter your email"
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 h-11 rounded-xl focus-visible:ring-indigo-500 focus-visible:border-indigo-500 w-full"
              />
              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors duration-300 shadow-lg shadow-indigo-600/10 cursor-pointer"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Middle Separator */}
        <div className="border-t border-slate-900" />

        {/* Bottom Bar - تم تحويله لعمود طولي متناسق على الموبايل وسطر أفقي على الشاشات الأكبر */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-6 pt-8 text-xs text-slate-500 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-1.5">
            <span>
              © {new Date().getFullYear()} Mentora. All rights reserved.
            </span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="flex items-center gap-1">
              Made with{' '}
              <Heart className="size-3 text-red-500 fill-red-500 animate-pulse" />{' '}
              at ITI Lab
            </span>
          </div>

          {/* Back to Top Button */}
          <Button
            variant="ghost"
            onClick={scrollToTop}
            className="h-auto px-3 py-1.5 text-xs text-slate-500 hover:text-white hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-lg group cursor-pointer w-full sm:w-auto justify-center"
          >
            <span>Back to top</span>
            <ArrowUp className="size-3 group-hover:-translate-y-0.5 transition-transform duration-300 ml-2" />
          </Button>
        </div>
      </div>
    </footer>
  );
}
