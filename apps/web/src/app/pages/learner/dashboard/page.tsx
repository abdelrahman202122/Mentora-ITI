"use client"

import BookingCard from "@/components/learner/BookingCard"
import { CheckCircle, Clock, CalendarDays } from "lucide-react"
import { mockBooking, mockUser } from "@/lib/mockData"

const stats = [
  {
    label: "Sessions Completed",
    value: "24",
    icon: CheckCircle,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    label: "Hours Learned",
    value: "36h",
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Upcoming Sessions",
    value: "3",
    icon: CalendarDays,
    color: "text-green-600",
    bg: "bg-green-50",
  },
]

const bookings = [
  {
    id: mockBooking._id,
    subject: mockBooking.subject.nameEn,
    tutorName:
      mockBooking.tutor.user.firstName +
      " " +
      mockBooking.tutor.user.lastName,
    time: new Date(mockBooking.startTime).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    paymentPending: mockBooking.status === "PENDING",
  },
]

const sessionCode = "M-" + mockBooking._id.slice(-4).toUpperCase()

export default function LearnerDashboardPage() {
  return (
    <>
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Welcome back, {mockUser.firstName}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          You&apos;re making great progress. Ready for your next challenge?
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-6">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 ${
              index === 2 ? "col-span-2 md:col-span-1" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-1 mb-2">
              <p className="text-xs text-gray-400 uppercase leading-tight">
                {stat.label}
              </p>
              <div className={`${stat.bg} p-1.5 rounded-lg flex-shrink-0`}>
                <stat.icon size={14} className={stat.color} />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Session Banner */}
      <div className="bg-indigo-600 rounded-xl p-4 md:p-5 mb-6 text-white">
        <p className="text-sm font-semibold">Start Your Session</p>
        <p className="text-xs opacity-80 mb-4">
          {mockBooking.subject.nameEn} with {mockBooking.tutor.user.firstName}{" "}
          {mockBooking.tutor.user.lastName}
        </p>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs opacity-70">SESSION CODE</p>
            <p className="text-xl md:text-2xl font-bold">{sessionCode}</p>
            <p className="text-xs opacity-70">
              Share this code with your tutor to start the session.
            </p>
          </div>
          <button
            onClick={() => window.open(mockBooking.tutor.meetingLink, "_blank")}
            className="bg-white text-indigo-600 font-semibold text-sm px-4 py-2 rounded-lg whitespace-nowrap flex-shrink-0"
          >
            Join Now
          </button>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">
          Upcoming Bookings
        </h2>
        <div className="flex flex-col gap-3">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              subject={booking.subject}
              tutorName={booking.tutorName}
              time={booking.time}
              paymentPending={booking.paymentPending}
            />
          ))}
        </div>
      </div>
    </>
  )
}
