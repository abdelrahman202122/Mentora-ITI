

"use client"

import { useRouter, useParams } from "next/navigation"
import { Calendar, Clock, Hourglass, Tag, CreditCard, MessageCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link";
interface BookingSuccessProps {
  tutorName: string
  subject: string
  date: string
  time: string
  duration: string
  hourlyRate: number
  currency: string
}

export default function BookingSuccess({
  tutorName,
  subject,
  date,
  time,
  duration,
  hourlyRate,
  currency,
}: BookingSuccessProps) {
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) ?? "en"

  // The session might be 30/60/90 minutes, so the amount the learner actually
  // owes is the hourly rate scaled by the booked duration — not the raw
  // hourly rate itself, which would misrepresent the total for anything
  // other than a full hour.
  const sessionPrice = (hourlyRate * Number(duration)) / 60
  // round to 2 decimals without leaving trailing zeros like "45.00"
  const displayPrice = Math.round(sessionPrice * 100) / 100

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F5FF] text-[#1E2240]">
    
  
      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Booking Request Sent & Actions */}
          <div className="md:col-span-7 flex flex-col items-start space-y-6">
            
            {/* Success Icon */}
            <div className="w-16 h-16 bg-[#6366F1] text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-100">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>

            {/* Title & Description from your original code */}
            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight text-[#11142D]">
                Booking Request Sent!
              </h1>
              <p className="text-[#68718B] text-[16px] leading-relaxed max-w-md">
                Your session with <span className="font-semibold text-[#11142D]">{tutorName}</span> has been requested.
                <br />
                Waiting for the tutor to confirm.
              </p>
            </div>

            {/* Actions from your original code formatted like the image_d669dc.jpg UI */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <Button
                onClick={() => router.push(`/${locale}/learner/messages`)}
                className="bg-[#5051F9] hover:bg-[#4041DB] text-white font-medium px-6 py-6 rounded-xl flex items-center gap-2 text-sm shadow-sm transition-all"
              >
                <MessageCircle size={16} />
                Message Tutor
              </Button>

              <Link
                href={`/${locale}/dashboard`}
                className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>

            {/* Notification Notice */}
         
          </div>

          {/* Right Column: Session Summary Card (Your exact Data structure) */}
          <div className="md:col-span-5">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#11142D] mb-1">
                  {subject}
                </h2>
                <p className="text-sm text-[#68718B]">
                  {tutorName}
                </p>
              </div>

              <hr className="border-gray-100" />

              {/* Specs Stack using your variables */}
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[#68718B]">
                    <Calendar size={14} />
                    <span>Date</span>
                  </div>
                  <span className="font-semibold text-[#11142D]">{date}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[#68718B]">
                    <Clock size={14} />
                    <span>Time</span>
                  </div>
                  <span className="font-semibold text-[#11142D]">{time}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[#68718B]">
                    <Hourglass size={14} />
                    <span>Duration</span>
                  </div>
                  <span className="font-semibold text-[#11142D]">{duration} minutes</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[#68718B]">
                    <Tag size={14} />
                    <span>Hourly Rate</span>
                  </div>
                  <span className="font-semibold text-[#11142D]">{hourlyRate} {currency}/hr</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[#68718B]">
                    <CreditCard size={14} />
                    <span>Total Price</span>
                  </div>
                  <span className="font-semibold text-[#11142D]">{displayPrice} {currency}</span>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Status Badge - Preserved your exact Pending design/logic inside the design layout */}
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm text-[#68718B]">Status</span>
                <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-100 rounded-full px-4 py-1.5 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
                  <p className="text-xs text-yellow-700 font-semibold tracking-wide">
                    Pending confirmation
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>


    </div>
  )
}