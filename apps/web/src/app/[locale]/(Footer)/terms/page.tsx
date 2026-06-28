import Link from "next/link";

import { GraduationCap, ScrollText } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Mentora",
  description:
    "Read the terms and conditions that govern your use of the Mentora platform.",
};

export default async function TermsPage({
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
              <ScrollText className="size-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Terms of Service
            </h1>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Last updated: June 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <Section title="1. Acceptance of Terms">
            <p>
              By creating an account or using Mentora you agree to these Terms
              of Service. If you do not agree, please do not use the platform.
            </p>
          </Section>

          <Section title="2. Accounts">
            <ul className="list-disc space-y-2 pl-5">
              <li>You must provide accurate information when registering.</li>
              <li>
                You are responsible for keeping your login credentials secure.
              </li>
              <li>
                One person may not maintain more than one account without prior
                approval.
              </li>
            </ul>
          </Section>

          <Section title="3. Tutoring Sessions">
            <p>
              Mentora facilitates connections between learners and tutors. We do
              not employ tutors directly. Tutors are independent educators who
              set their own rates, schedules, and teaching methods.
            </p>
          </Section>

          <Section title="4. Payments &amp; Fees">
            <p>
              All payments are processed through our third-party payment
              provider. Mentora charges a service commission on each completed
              session. Fees are displayed before you confirm a booking.
            </p>
          </Section>

          <Section title="5. Cancellations &amp; Refunds">
            <p>
              Cancellations made more than 24 hours before a scheduled session
              are eligible for a full refund. Late cancellations and no-shows
              may forfeit the session fee. Disputes can be raised via{" "}
              <a
                href="mailto:support@mentora.com"
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                support@mentora.com
              </a>
              .
            </p>
          </Section>

          <Section title="6. Prohibited Conduct">
            <ul className="list-disc space-y-2 pl-5">
              <li>Misrepresenting your qualifications or identity.</li>
              <li>Harassing or threatening other users.</li>
              <li>
                Attempting to circumvent the platform to avoid service fees.
              </li>
              <li>Uploading malicious content or spam.</li>
            </ul>
          </Section>

          <Section title="7. Limitation of Liability">
            <p>
              Mentora is provided &ldquo;as is&rdquo;. We are not liable for
              the quality of tutoring sessions, scheduling conflicts, or any
              indirect damages arising from platform use.
            </p>
          </Section>

          <Section title="8. Changes to These Terms">
            <p>
              We may update these terms from time to time. Continued use of the
              platform after changes are published constitutes acceptance of the
              revised terms.
            </p>
          </Section>

          <Section title="9. Contact">
            <p>
              Questions about these terms? Email{" "}
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
