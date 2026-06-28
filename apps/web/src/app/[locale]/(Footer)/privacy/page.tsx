import Link from "next/link";

import { GraduationCap, Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Mentora",
  description:
    "Learn how Mentora collects, uses, and protects your personal information.",
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-12 text-slate-950 sm:px-6">
      <article className="mx-auto max-w-3xl">
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
              <Shield className="size-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Privacy Policy
            </h1>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Last updated: June 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <Section title="1. Information We Collect">
            <p>
              When you create a Mentora account we collect your name, email
              address, and role (learner or tutor). If you book or offer
              tutoring sessions, we also process payment-related data through
              our third-party payment provider.
            </p>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="list-disc space-y-2 pl-5">
              <li>Authenticate your identity and manage your account.</li>
              <li>
                Match learners with tutors based on subject, curriculum, and
                availability.
              </li>
              <li>Process payments and issue receipts.</li>
              <li>
                Send transactional notifications (session confirmations,
                reminders).
              </li>
              <li>Improve and personalise the platform experience.</li>
            </ul>
          </Section>

          <Section title="3. Data Sharing">
            <p>
              We do not sell your personal data. We share information only with:
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong>Payment providers</strong> — to process transactions
                securely.
              </li>
              <li>
                <strong>Your matched tutor or learner</strong> — limited contact
                details required for the session.
              </li>
              <li>
                <strong>Law enforcement</strong> — when legally required.
              </li>
            </ul>
          </Section>

          <Section title="4. Data Retention">
            <p>
              Account data is retained while your account is active. You may
              request deletion at any time by contacting{" "}
              <a
                href="mailto:support@mentora.com"
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                support@mentora.com
              </a>
              .
            </p>
          </Section>

          <Section title="5. Your Rights">
            <p>
              You have the right to access, correct, or delete your personal
              data. To exercise these rights contact us at{" "}
              <a
                href="mailto:support@mentora.com"
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                support@mentora.com
              </a>
              .
            </p>
          </Section>

          <Section title="6. Cookies">
            <p>
              Mentora uses essential cookies to keep you signed in and
              functional cookies to remember your locale preference. We do not
              use third-party advertising cookies.
            </p>
          </Section>

          <Section title="7. Contact">
            <p>
              If you have questions about this policy, reach out to{" "}
              <a
                href="mailto:support@mentora.com"
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                support@mentora.com
              </a>
              .
            </p>
          </Section>
        </div>
      </article>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-slate-900">{title}</h2>
      <div className="text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}
