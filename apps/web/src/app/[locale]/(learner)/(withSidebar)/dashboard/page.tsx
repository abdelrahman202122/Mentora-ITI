'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  Calendar,
  Video,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Booking } from '@/types/bookingProcess/booking';
import { getMyBookings } from '@/services/booking-services/getMyBookingService';
import { getSubjectTitle } from '@/services/booking-services/getSubjectTitleService';
import { getTutorName } from '@/services/booking-services/getTutorNameService';

function formatDisplayTime(iso: string, duration: number) {
  const dateObj = new Date(iso);
  const timeString = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const hours = duration / 60;
  const durationText = hours % 1 === 0 ? `${hours}h` : `${hours}h`;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isTomorrow = dateObj.toDateString() === tomorrow.toDateString();
  const datePrefix = isTomorrow
    ? 'Tomorrow'
    : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return `${datePrefix}, ${timeString} (${durationText} session)`;
}

function isSessionLive(booking: Booking): boolean {
  if (booking.bookingStatus !== 'confirmed') return false;
  const now = Date.now();
  const start = new Date(booking.startAt).getTime();
  const end = new Date(booking.endAt).getTime();
  return now >= start && now <= end;
}

export default function LearnerDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) ?? 'en';

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [subjectTitles, setSubjectTitles] = useState<Record<string, string>>(
    {},
  );
  const [tutorNames, setTutorNames] = useState<Record<string, string>>({});

  useEffect(() => {
    getMyBookings()
      .then(setBookings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (bookings.length === 0) return;

    const uniquePairs = Array.from(
      new Map(bookings.map((b) => [b.subjectId, b.tutorId])).entries(),
    );

    uniquePairs.forEach(([subjectId, tutorId]) => {
      getSubjectTitle(tutorId, subjectId)
        .then((title) => {
          setSubjectTitles((prev) => ({ ...prev, [subjectId]: title }));
        })
        .catch((err) => {
          console.error(`Failed to load subject title for ${subjectId}:`, err);
        });
    });
  }, [bookings]);

  useEffect(() => {
    if (bookings.length === 0) return;

    const uniqueTutorIds = Array.from(new Set(bookings.map((b) => b.tutorId)));

    uniqueTutorIds.forEach((tutorId) => {
      getTutorName(tutorId)
        .then((name) => {
          setTutorNames((prev) => ({ ...prev, [tutorId]: name }));
        })
        .catch((err) => {
          console.error(`Failed to load tutor name for ${tutorId}:`, err);
        });
    });
  }, [bookings]);

  function getDisplaySubject(subjectId: string): string {
    return subjectTitles[subjectId] ?? subjectId;
  }

  function getDisplayTutor(tutorId: string): string {
    return tutorNames[tutorId] ?? tutorId;
  }

  const upcomingBookings = bookings.filter(
    (b) => b.bookingStatus === 'pending' || b.bookingStatus === 'confirmed',
  );

  // real values only — 0 completed sessions or 0 hours learned are legitimate
  // states for a new learner, not bugs to be masked with placeholder numbers
  const totalCompleted = bookings.filter(
    (b) => b.bookingStatus === 'completed',
  ).length;
  const totalHours = bookings
    .filter((b) => b.bookingStatus === 'completed')
    .reduce((acc, curr) => acc + curr.durationMinutes / 60, 0);
  const upcomingCount = upcomingBookings.length;

  // only a session that's actually happening right now qualifies for the
  // "Join Now" banner — not merely the next confirmed booking on the calendar
  const currentActiveSession = upcomingBookings.find(isSessionLive);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E2240] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#11142D]">
            Welcome back, {currentUser?.name ?? ""}
          </h1>
          <p className="text-sm text-[#68718B] mt-1">
            You&apos;re making great progress. Ready for your next challenge?
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-[#68718B] uppercase tracking-wider mb-2">
                Sessions Completed
              </p>
              <p className="text-3xl font-black text-[#5051F9]">
                {totalCompleted}
              </p>
            </div>
            <div className="bg-[#EEF2FF] p-2.5 rounded-full text-[#5051F9]">
              <CheckCircle2 size={18} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-[#68718B] uppercase tracking-wider mb-2">
                Hours Learned
              </p>
              <p className="text-3xl font-black text-[#5051F9]">
                {totalHours}h
              </p>
            </div>
            <div className="bg-[#EEF2FF] p-2.5 rounded-full text-[#5051F9]">
              <Clock size={18} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-[#68718B] uppercase tracking-wider mb-2">
                Upcoming Sessions
              </p>
              <p className="text-3xl font-black text-[#5051F9]">
                {upcomingCount}
              </p>
            </div>
            <div className="bg-[#EEF2FF] p-2.5 rounded-full text-[#5051F9]">
              <Calendar size={14} className="stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Live Session Banner */}
        {currentActiveSession && (
          <div className="bg-[#5051F9] text-white rounded-2xl p-6 shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                  <Video size={18} />
                  <span>Start Your Session</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {getDisplaySubject(currentActiveSession.subjectId)}
                  </h3>
                  <p className="text-sm text-white/80">
                    with {getDisplayTutor(currentActiveSession.tutorId)}
                  </p>
                </div>
                {currentActiveSession.confirmationCode && (
                  <div className="inline-block bg-black/20 rounded-lg px-3 py-1.5 text-xs font-mono tracking-wide">
                    SESSION CODE:{' '}
                    <span className="font-bold text-lg ml-1">
                      {currentActiveSession.confirmationCode}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <Button
                  onClick={() =>
                    router.push(
                      `/${locale}/booking/${currentActiveSession._id}`,
                    )
                  }
                  className="bg-white text-[#5051F9] hover:bg-white/90 font-bold px-8 py-6 rounded-xl shadow-md text-sm transition-all w-full md:w-auto"
                >
                  Join Now
                </Button>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          </div>
        )}

        {/* Pay error */}
        {payError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} />
            <span>{payError}</span>
          </div>
        )}

        {/* Bookings List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#11142D]">
            Upcoming Bookings
          </h2>

          {loading && (
            <div className="flex items-center gap-2 text-gray-400 text-sm py-8 justify-center">
              <Loader2 size={20} className="animate-spin text-[#5051F9]" />
              <span>Loading bookings...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && allBookings.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
              No bookings found.
            </div>
          )}

          {!loading && !error && allBookings.length > 0 && (
            <div className="flex flex-col gap-3">
              {upcomingBookings.map((booking) => {
                const showPayNow =
                  booking.paymentStatus === 'unpaid' &&
                  booking.bookingStatus === 'confirmed';

                return (
                  <div
                    key={booking._id}
                    onClick={() =>
                      router.push(`/${locale}/booking/${booking._id}`)
                    }
                    className="bg-white hover:bg-gray-50/50 rounded-2xl p-4 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#E0E7FF] text-[#5051F9] flex items-center justify-center font-bold text-sm uppercase shrink-0">
                        {getDisplaySubject(booking.subjectId).substring(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-bold text-[#11142D] text-[15px]">
                          {getDisplaySubject(booking.subjectId)}
                        </h4>
                        <p className="text-xs text-[#68718B]">
                          with {getDisplayTutor(booking.tutorId)}
                        </p>

                        {booking.bookingStatus === 'pending' && (
                          <span className="inline-flex items-center text-[11px] text-amber-600 font-semibold gap-1 mt-1 bg-amber-50 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Pending Approval
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-auto sm:ml-0">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#68718B] bg-gray-50 px-3 py-2 rounded-xl border border-gray-100/80">
                        <Calendar size={14} className="text-[#5051F9]" />
                        <span>
                          {formatDisplayTime(
                            booking.startAt,
                            booking.durationMinutes,
                          )}
                        </span>
                      </div>

                      {showPayNow && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/${locale}/checkout/${booking._id}`);
                          }}
                          className="bg-[#5051F9] hover:bg-[#4041DB] text-white text-xs font-bold px-4 py-2 h-9 rounded-xl transition-all shadow-sm shrink-0"
                        >
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
