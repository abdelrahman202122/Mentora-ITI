"use client"
//used state hooks (useState, useSearchParams, useRouter).

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Calendar, Clock, Hourglass, Send, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { SummaryCard } from "@/components/learner/SummaryCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { createBooking } from "@/services/booking/booking-service"

// FIX #3: Centralise the subject ID as a named constant instead of a magic string literal
const DEFAULT_SUBJECT_ID = "6a33efe7a0c348f1fca9873c"

function BookSessionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const tutorId = searchParams.get("tutorId") ?? ""
  const tutorName = searchParams.get("tutorName") ?? "Tutor"
  const subjectParam = searchParams.get("subject") ?? "Session"
  const hourlyRate = Number(searchParams.get("hourlyRate") ?? 45)
  const currency = searchParams.get("currency") ?? "$"

  const subjectId = searchParams.get("subjectId") ?? DEFAULT_SUBJECT_ID

  const [date, setDate] = useState("")
  // FIX #5: Duration options reordered to ascending (30 → 60 → 90); default stays 60
  const [duration, setDuration] = useState("60")
  const [time, setTime] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isFormInvalid = !date || !duration || !time
 

  //This function return startat and end in this format{12-2-2026 3p.m}and calc enddate
  function buildDates(): { startAt: string; endAt: string } | null {
    if (!date || !time) return null

   
    const startDate = new Date(`${date}T${time}:00`)
    //use data here because i want to make operations on the date not only want the string
    if (isNaN(startDate.getTime())) return null

    const endDate = new Date(startDate.getTime() + Number(duration) * 60 * 1000)
//get time retun timestamp (date and also time)
    return {
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
    }
  }

  async function handleBooking() {
    setError(null)

    //  Guard against invalid date construction before proceeding
    const dates = buildDates()
    if (!dates) {
      setError("Invalid date or time selected. Please try again.")
      return
    }

    // Reject booking where the chosen time has already passed
    if (new Date(dates.startAt) < new Date()) {
      setError("The selected time has already passed. Please choose a future time.")
      return
    }

    setLoading(true)

    try {
      await createBooking({
        tutorProfileId: tutorId,
        subjectId,         
        startAt: dates.startAt,
        endAt: dates.endAt,
        durationMinutes: Number(duration),
      })

      const params = new URLSearchParams({
        tutorId,
        tutorName,
        subject: subjectParam,
        date,
        time,
        hourlyRate: String(hourlyRate),
        duration,
        currency,
      })

      setLoading(false)
      router.push(`/en/payment?${params}`)

    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-foreground p-6 md:p-12 font-sans">

      {/* Back Link */}
      <div className="max-w-6xl mx-auto mb-6">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-2 text-sidebar-primary hover:underline px-0"
        >
          <Link href={tutorId ? `/en/tutor-match/${tutorId}` : "/en/learner/tutor-match"}>
            <ArrowLeft size={16} /> Back to Teacher Profile
          </Link>
        </Button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left — Booking Form */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Book New Session
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* 1. Date Input */}
            {/* FIX #6: Added htmlFor / id pairing so screen readers associate label with input */}
            <div>
              <label
                htmlFor="session-date"
                className="block text-sm font-medium text-muted-foreground mb-2"
              >
                Select Date
              </label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-4 text-muted-foreground z-10 cursor-pointer" size={20} aria-hidden />
                <Input
                  id="session-date"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-12 h-12 bg-sidebar/50 rounded-xl"
                />
              </div>
            </div>

            {/* 2. Lesson Duration */}
         
            <div>
              <label
                htmlFor="session-duration"
                className="block text-sm font-medium text-muted-foreground mb-2"
              >
                Lesson Duration
              </label>
              <div className="relative flex items-center">
                <Hourglass className="absolute left-4 text-muted-foreground" size={20} aria-hidden cursor-pointer />
                <select
                  id="session-duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full h-12 bg-sidebar/50 border border-input rounded-xl pl-12 pr-4 text-foreground focus:outline-none focus:border-sidebar-primary text-sm md:text-base appearance-none cursor-pointer"
                >
                  <option value="30">30 minutes session</option>
                  <option value="60">60 minutes session</option>
                  <option value="90">90 minutes session</option>
                </select>
                <div className="absolute right-4 pointer-events-none text-muted-foreground">▼</div>
              </div>
            </div>

         
            <div>
              <label
                htmlFor="session-time"
                className="block text-sm font-medium text-muted-foreground mb-2"
              >
                Select Time
              </label>
              <div className="relative flex items-center">
                <Clock className="absolute left-4 text-muted-foreground z-10 cursor-pointer" size={20} aria-hidden />
                <Input
                  id="session-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-12 h-12 bg-sidebar/50 rounded-xl"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3"
              >
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right — Summary Card */}
        <Card className="shadow-sm flex flex-col justify-between h-fit">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground">
              Booking Summary
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col justify-between flex-1">
            <SummaryCard
              tutorName={tutorName}
              subject={subjectParam}
              hourlyRate={hourlyRate}
              duration={duration}
              currency={currency}
            />

            <Button
              onClick={handleBooking}
              disabled={isFormInvalid || loading}
              size="lg"
              className="w-full mt-8 h-12 rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden />
                  <span>Booking...</span>
                </>
              ) : (
                <>
                  <span>Send Booking Request</span>
                  <Send size={16} className="rotate-45" aria-hidden />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

export default function BookSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          Loading...
        </div>
      }
    >
      <BookSessionContent />
    </Suspense>
  )
}