import Link from "next/link";

import { GraduationCap, HelpCircle, Mail } from "lucide-react";

export const metadata = {
  title: "Help Center — Mentora",
  description:
    "Find answers to common questions about using the Mentora tutoring platform.",
};

const faqs: { question: string; answer: string }[] = [
  {
    question: "How do I create an account?",
    answer:
      'Click "Sign Up" on the login page, enter your name, email, and a password. You will be logged in automatically after registration.',
  },
  {
    question: "How do I find a tutor?",
    answer:
      "Use the Find a Tutor feature to filter by subject, curriculum, and grade level. Browse tutor profiles, check availability, and book a session directly.",
  },
  {
    question: "How do payments work?",
    answer:
      "Payments are processed securely through our payment provider at the time of booking. You will receive a receipt by email after the transaction is complete.",
  },
  {
    question: "Can I cancel a session?",
    answer:
      "Yes. Cancellations made more than 24 hours before the session start time receive a full refund. Late cancellations may forfeit the session fee.",
  },
  {
    question: "How do I become a tutor?",
    answer:
      "Register as a tutor, complete your profile with your qualifications and availability, and you will appear in learner search results once approved.",
  },
  {
    question: "I forgot my password. What do I do?",
    answer:
      "Contact support@mentora.com with the email address on your account and we will help you regain access.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Email us at support@mentora.com. We aim to respond within 24 hours on business days.",
  },
];

export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-12 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-10">
          <Link
            href={`/${locale}`}
            className="group mb-8 inline-flex items-center gap-2 text-indigo-600"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors group-hover:bg-indigo-500">
              <GraduationCap className="size-5" />
            </div>
            <span className="text-lg font-semibold">Mentora</span>
          </Link>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <HelpCircle className="size-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Help Center
            </h1>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Answers to the most common questions about Mentora.
          </p>
        </div>

        {/* FAQ list */}
        <div className="space-y-4">
          {faqs.map(({ question, answer }) => (
            <details
              key={question}
              className="group rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <summary className="flex cursor-pointer select-none items-center justify-between px-6 py-5 text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                {question}
                <span className="ml-4 text-indigo-500 transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="border-t border-slate-100 px-6 pb-5 pt-4 text-sm leading-relaxed text-slate-600">
                {answer}
              </div>
            </details>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <Mail className="size-5" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            Still need help?
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Our support team is here for you.
          </p>
          <a
            href="mailto:support@mentora.com"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            <Mail className="size-4" />
            Email Support
          </a>
        </div>
      </div>
    </main>
  );
}
