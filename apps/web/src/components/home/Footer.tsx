"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { 
  GraduationCap, 
  Mail, 
  ArrowUp,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getLocalePath } from "@/utils/i18n/locale-path";

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

const socialLinks = [
  { label: "Facebook", url: "https://facebook.com", icon: Facebook },
  { label: "Twitter", url: "https://twitter.com", icon: Twitter },
  { label: "Instagram", url: "https://instagram.com", icon: Instagram },
  { label: "LinkedIn", url: "https://linkedin.com", icon: Linkedin },
];

const exploreLinks = [
  { label: "Home", path: "/" },
  { label: "Subjects", path: "/#subjects" },
  { label: "How It Works", path: "/#how-it-works" },
  { label: "Testimonials", path: "/#testimonials" },
];

const legalLinks = [
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Terms of Service", path: "/terms" },
  { label: "Help Center", path: "/help" },
];

export default function Footer() {
  const locale = useLocale();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // const socialLinks = [
  //   { label: "Facebook", url: "https://facebook.com", icon: Facebook },
  //   { label: "Twitter", url: "https://twitter.com", icon: Twitter },
  //   { label: "Instagram", url: "https://instagram.com", icon: Instagram },
  //   { label: "LinkedIn", url: "https://linkedin.com", icon: Linkedin },
  // ];

  const exploreLinks = [
    { label: "Home", path: "/" },
    { label: "Subjects", path: "/#subjects" },
    { label: "How It Works", path: "/#how-it-works" },
    { label: "Testimonials", path: "/#testimonials" }
  ];

  const legalLinks = [
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms of Service", path: "/terms" },
    { label: "Help Center", path: "/help" }
  ];

  return (
    <footer className="overflow-hidden border-t border-slate-900 bg-slate-950 pb-8 pt-16 text-slate-400 md:pt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 pb-12 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-4 md:pb-16">
          <div className="flex flex-col items-center space-y-4 sm:items-start md:space-y-6">
            <Link
              href={getLocalePath(locale, "/")}
              className="group flex items-center gap-3 text-white"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-600 transition-colors duration-200 group-hover:bg-indigo-500">
                <GraduationCap className="size-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Mentora
              </span>
            </Link>
            <p className="mx-auto max-w-xs text-sm leading-relaxed text-slate-400 sm:mx-0">
              Mentora connects learners with verified tutors for personalized
              lessons, secure booking, and clear communication before every
              session.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4 pt-2 justify-center sm:justify-start">
              {/* {socialLinks.map(({ icon: Icon, url, label }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition-colors duration-200 hover:border-indigo-500 hover:bg-slate-900 hover:text-white"
                >
                  <Icon className="size-5" />
                </a>
              ))} */}
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Explore
            </h3>
            <ul className="space-y-3 text-sm md:space-y-4">
              {exploreLinks.map(({ label, path }) => (
                <li key={label}>
                  <Link
                    href={getLocalePath(locale, path)}
                    className="block transition-colors duration-200 hover:text-white sm:inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 md:space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Contact &amp; Legal
            </h3>
            <ul className="flex flex-col items-center space-y-3 text-sm sm:items-start md:space-y-4">
              {legalLinks.map(({ label, path }) => (
                <li key={label}>
                  <Link
                    href={getLocalePath(locale, path)}
                    className="block transition-colors duration-200 hover:text-white sm:inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li className="flex items-center justify-center gap-2 pt-2 text-slate-400 sm:justify-start">
                <Mail className="size-4 shrink-0 text-indigo-400" />
                <span className="text-xs">support@mentora.com</span>
              </li>
            </ul>
          </div>

          <div className="mx-auto w-full max-w-sm space-y-4 sm:mx-0 sm:max-w-none md:space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Newsletter
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              Get tutor-search tips, platform updates, and learning resources in
              your inbox.
            </p>
            <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-3">
              <Input
                type="email"
                required
                placeholder="Enter your email"
                className="h-11 w-full rounded-lg border-slate-800 bg-slate-900 text-white placeholder:text-slate-500 focus-visible:border-indigo-500 focus-visible:ring-indigo-500"
              />
              <Button
                type="submit"
                className="h-11 w-full cursor-pointer rounded-lg bg-indigo-600 font-semibold text-white transition-colors duration-200 hover:bg-indigo-500"
              >
                Subscribe to updates
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-900" />

        <div className="flex flex-col-reverse items-center justify-between gap-6 pt-8 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-1.5">
            <span>© {new Date().getFullYear()} Mentora. All rights reserved.</span>
            <span className="hidden text-slate-700 sm:inline">|</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="size-3 fill-red-500 text-red-500" /> at
              ITI Lab
            </span>
          </div>

          <Button
            variant="ghost"
            onClick={scrollToTop}
            className="h-auto w-full cursor-pointer justify-center rounded-lg border border-slate-800 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-900 hover:text-white sm:w-auto"
          >
            <span>Back to top</span>
            <ArrowUp className="ml-2 size-3 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </Button>
        </div>
      </div>
    </footer>
  );
}
