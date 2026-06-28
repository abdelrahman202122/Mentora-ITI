"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { Calendar, Clock, Hourglass, Send, ArrowLeft, Loader2, AlertCircle } from "lucide-react"

import Link from "next/link"


import { SummaryCard } from "@/components/learner/SummaryCard"
import BookingSuccess from "@/components/learner/BookingSuccess"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"


import { createBooking } from "@/services/booking-services/bookingService"
import { getTutorAvailability } from "@/services/booking-services/slots-service"


import type { TimeSlot, AvailabilitySlots } from "@/types/bookingProcess/slots"

//used to ruturn throyght it time slots available
const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

// ── timezone-safe date helpers ──────────────────────────────────────────────
// "YYYY-MM-DD" built from LOCAL parts (not UTC), so it always matches what the
// user sees on their calendar regardless of timezone offset
function getLocalDateString(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// parses a "YYYY-MM-DD" string into a LOCAL Date (midnight local time), instead
// of `new Date(dateString)` which JS treats as UTC midnight and can shift the
// weekday by one day for users in negative UTC offsets
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function BookSessionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = (params.locale as string) ?? "en"

  // ── required booking inputs — no silent fallback ────────────────────────
  // these MUST come from the query string; a missing value means the learner
  // arrived here without going through tutor selection, and we should not let
  // them submit a booking for an unintended tutor/subject
  const tutorProfileId = searchParams.get("tutorProfileId")
  const tutorId = searchParams.get("tutorId") ?? ""
  const tutorName = searchParams.get("tutorName") ?? "Tutor"
  const subjectParam = searchParams.get("subject") ?? "Session"
  const hourlyRate = Number(searchParams.get("hourlyRate") ?? 45)
  const currency = searchParams.get("currency") ?? "$"
  const subjectId = searchParams.get("subjectId")

  const missingRequiredParams = !tutorProfileId || !subjectId

  const [date, setDate] = useState("")
  const [duration, setDuration] = useState("60")
  const [time, setTime] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
//this hock is used to store available days with its time
  const [slots, setSlots] = useState<AvailabilitySlots | null>(null)
  ////this hock is used to store available  time for the date that user enter 
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)

//--------------------------availability slots--------------------------------

//slots contain all days with time period available for this tutor
 useEffect(() => {
  if (!tutorId) return
  async function fetchAvailability() {
    setSlotsLoading(true)
    try {  
      const slots = await getTutorAvailability(tutorId)
      setSlots(slots)
    } catch (err) {
      console.error("Failed to fetch availability:", err)
    } finally {
      setSlotsLoading(false)
    }
  }

  fetchAvailability()
}, [tutorId])

//when i click the date that i want it will return the time that available in that day 
  useEffect(() => {
    if (!date || !slots) {
      setAvailableSlots([])
      return
    }
    // build the date from LOCAL parts so the weekday lookup matches the
    // learner's local calendar day, not a UTC-shifted one
    const dayIndex = parseLocalDate(date).getDay() //return index of the day begin with zero
    const dayName = DAYS[dayIndex] as keyof AvailabilitySlots //like sunday 
    setAvailableSlots(slots[dayName] ?? [])//slots[sunday] return the time that availablee on sunday  startTime and endTime
  }, [date, slots])
  //-----------------------------------------------------------------------
//--------------------function to convert the time to 12 hours system-----------
//the time slots from backend return like that 18,20 I think in user Experice not well so i convert it to 12 hours system

function convertTo12Hour(time: string): string {
  const [hourStr, minute] = time.split(":")
  let hour = parseInt(hourStr)
  const ampm = hour >= 12 ? "PM" : "AM"
  hour = hour % 12 || 12 //14%12==>2 
  return `${hour}:${minute} ${ampm}`
}

//---------------------End of availabilty slots ---------------------
//----------------------------Booking Request --------------------------
  const isFormInvalid = !date || !duration || !time || missingRequiredParams
//this function is responsible to transfer the time into ISO string to understand by servers
//if the user in egypt and enter the time like 3 p.m and the tutor in us there is a delay in time betwwen two states 
  function buildDates(): { startAt: string; endAt: string } | null {
    if (!date || !time) return null
    const startDate = new Date(`${date}T${time}:00`)
    if (isNaN(startDate.getTime())) return null
    const endDate = new Date(startDate.getTime() + Number(duration) * 60 * 1000)
    return {
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
    }
  }

  async function handleBooking() {
    setError(null)

    // hard guard — never assemble or send a booking payload without a real
    // tutor profile and subject; this mirrors isFormInvalid above so the
    // submit path stays consistent even if this function is ever called from
    // somewhere else (e.g. a future keyboard shortcut or retry button)
    if (!tutorProfileId || !subjectId) {
      setError("Missing tutor or subject information. Please go back and select a tutor and subject again.")
      return
    }

    const dates = buildDates()
    if (!dates) {
      setError("Invalid date or time selected. Please try again.")
      return
    }
    if (new Date(dates.startAt) < new Date()) {
      setError("The selected time has already passed. Please choose a future time.")
      return
    }
    setLoading(true)
    try {
      await createBooking({
        tutorProfileId,
        subjectId,
        startTime: dates.startAt,
        endTime: dates.endAt,
      })
      setSuccess(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <BookingSuccess
        tutorName={tutorName}
        subject={subjectParam}
        date={date}
        time={time}
        duration={duration}
        hourlyRate={hourlyRate}
        currency={currency}
      />
    )
  }

  const inputClass = "w-full h-12 pl-12 pr-4 bg-blue-50 border border-blue-200 text-foreground text-sm focus:outline-none focus:border-blue-400 rounded-lg"

  return (
    <div className="min-h-screen bg-white text-foreground p-6 md:p-12 font-sans">

      <div className="max-w-6xl mx-auto mb-6">
        <Button variant="ghost" size="sm" asChild className="gap-2 text-sidebar-primary hover:underline px-0">
          <Link href={tutorProfileId ? `/${locale}/tutor-match/${tutorProfileId}` : `/${locale}/learner/tutor-match`}>
            <ArrowLeft size={16} /> Back to Teacher Profile
          </Link>
        </Button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Book New Session
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* Missing required params — block the form entirely */}
            {missingRequiredParams && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>
                  We couldn't find the tutor or subject for this booking. Please go back and pick a tutor and
                  subject before booking a session.
                </span>
              </div>
            )}

            {/* 1. Date */}
            <div>
              <label htmlFor="session-date" className="block text-sm font-medium text-muted-foreground mb-2">
                Select Date
              </label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-4 text-blue-400 z-10" size={20} aria-hidden />
                <input
                  id="session-date"
                  type="date"
                  min={getLocalDateString(new Date())}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={missingRequiredParams}
                  className={inputClass}
                />
              </div>
            </div>

            {/* 2. Duration */}
            <div>
              <label htmlFor="session-duration" className="block text-sm font-medium text-muted-foreground mb-2">
                Lesson Duration
              </label>
              <div className="relative flex items-center">
                <Hourglass className="absolute left-4 text-blue-400" size={20} aria-hidden />
                <select
                  id="session-duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  disabled={missingRequiredParams}
                  className="w-full h-12 bg-blue-50 border border-blue-200 rounded-lg pl-12 pr-4 text-foreground focus:outline-none focus:border-blue-400 text-sm appearance-none cursor-pointer"
                >
                  <option value="30">30 minutes session</option>
                  <option value="60">60 minutes session</option>
                  <option value="90">90 minutes session</option>
                </select>
                <div className="absolute right-4 pointer-events-none text-blue-400">▼</div>
              </div>
            </div>

            {/* 3. Select Time */}
            <div>
              <label htmlFor="session-time" className="block text-sm font-medium text-muted-foreground mb-2">
                Select Time
              </label>
              <div className="relative flex items-center">
                <Clock className="absolute left-4 text-blue-400 z-10" size={20} aria-hidden />
                <input
                  id="session-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={missingRequiredParams}
                  className={inputClass}
                />
              </div>
            </div>

            {/*------------------- 4. Available Slots ---------------------------*/}
            {date && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Tutor Available Slots
                </label>

                {slotsLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                    <Loader2 size={14} className="animate-spin" />
                    Loading available slots...
                  </div>
                )}

                {!slotsLoading && availableSlots.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {availableSlots.map((slot) => (
                      <div
                        key={slot.startTime}
                        className="px-4 py-2 text-sm border border-blue-200 bg-blue-50 text-blue-700 font-medium rounded-lg"
                      >
                        {convertTo12Hour(slot.startTime)} – {convertTo12Hour(slot.endTime)}
                      </div>
                    ))}
                  </div>
                )}


                {!slotsLoading && availableSlots.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-lg px-4 py-3">
                    No available slots for this day. Please select another date.
                  </div>
                )}
              </div>
              
            )}

            {/*------------------- End Available Slots ---------------------------*/}

            {error && (
              <div role="alert" className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <BookSessionContent />
    </Suspense>
  )
}