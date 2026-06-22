
"use client"

import { Suspense } from "react"
import { useSearchParams, useParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, MessageSquare, Mail } from "lucide-react"

function PaymentSuccessContent({ locale }: { locale: string }) {
  const searchParams = useSearchParams()

  const tutorId = searchParams.get("tutorId") ?? ""
  const tutorName = searchParams.get("tutorName") ?? "your tutor"
  const subject = searchParams.get("subject") ?? "Session"
  const date = searchParams.get("date") ?? ""
  const time = searchParams.get("time") ?? ""

  return (
<div className="min-h-screen flex flex-col justify-center bg-white bg-gradient-to-b from-[#F4F7FF] via-[#EAEEFE] to-[#D5E3FB]">

  <main className="max-w-5xl mx-auto w-full px-4 md:px-8 py-16">
    <div className="flex flex-col lg:flex-row gap-12 items-start">

      <div className="flex-1">
        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center mb-6">
          <CheckCircle size={32} className="text-white" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Payment Received
        </h1>

        <p className="text-gray-500 text-base mb-8 leading-relaxed">
          Contact details are now available. You can now message{" "}
          <span className="font-semibold text-gray-700">{tutorName}</span>{" "}
          directly to coordinate your lesson.
        </p>

        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/${locale}/messages/${tutorId}?tutorName=${encodeURIComponent(tutorName)}`}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
          >
            <MessageSquare size={18} />
            Go to Chat
          </Link>
          <Link
            box-target
            href={`/${locale}/dashboard`}
            className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Mail size={16} className="text-indigo-400" />
          A confirmation email has been sent to your inbox.
        </div>
      </div>

      <div className="w-full lg:w-80 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-900 mb-1">{subject}</h2>
        <p className="text-sm text-gray-500 mb-5">{tutorName}</p>

        <hr className="border-gray-100 mb-5" />

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Session Date</span>
            <span className="font-semibold text-gray-800">{date}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Session Time</span>
            <span className="font-semibold text-gray-800">{time}</span>
          </div>
          <hr className="border-gray-100" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Confirmed
            </span>
          </div>
        </div>
      </div>

    </div>
  </main>

</div>
  )
}

export default function PaymentSuccessPage() {
  const params = useParams()
  const locale = params.locale as string ?? "en"

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <PaymentSuccessContent locale={locale} />
    </Suspense>
  )
}