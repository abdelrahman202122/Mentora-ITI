'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  Hourglass,
  Tag,
  CreditCard,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCreateChat } from '@/hooks/chat/use-chat';
import { getLocalePath } from '@/utils/i18n/locale-path';

interface BookingSuccessProps {
  tutorName: string;
  tutorId: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  hourlyRate: number;
  currency: string;
}

export default function BookingSuccess({
  tutorName,
  tutorId,
  subject,
  date,
  time,
  duration,
  hourlyRate,
  currency,
}: BookingSuccessProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) ?? 'en';
  const t = useTranslations('Booking.success');
  const createChat = useCreateChat();
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const sessionPrice = (hourlyRate * Number(duration)) / 60;
  const displayPrice = Math.round(sessionPrice * 100) / 100;

  async function handleMessageTutor() {
    if (!tutorId) {
      router.push(getLocalePath(locale, '/messages'));
      return;
    }

    setIsCreatingChat(true);

    try {
      const chat = await createChat.mutateAsync({ tutorId });
      router.push(getLocalePath(locale, `/messages/${chat.id}`));
    } catch (error) {
      console.error('Failed to start tutor chat from booking success', {
        error,
        tutorId,
      });
      router.push(getLocalePath(locale, '/messages'));
    } finally {
      setIsCreatingChat(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F5FF] text-[#1E2240]">
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          {/* Left Column: Booking Request Sent & Actions */}
          <div className="md:col-span-7 flex flex-col items-start space-y-6">
            <div className="w-16 h-16 bg-[#6366F1] text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight text-[#11142D]">
                {t('title')}
              </h1>
              <p className="text-[#68718B] text-[16px] leading-relaxed max-w-md">
                {t.rich('description', {
                  tutorName: () => (
                    <span className="font-semibold text-[#11142D]">
                      {tutorName}
                    </span>
                  ),
                })}
                <br />
                {t('waiting')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <Button
                onClick={handleMessageTutor}
                disabled={isCreatingChat}
                className="bg-[#5051F9] hover:bg-[#4041DB] text-white font-medium px-6 py-6 rounded-xl flex items-center gap-2 text-sm shadow-sm transition-all disabled:opacity-70"
              >
                <MessageCircle size={16} />
                {isCreatingChat ? t('messageTutor') : t('messageTutor')}
              </Button>

              <Link
                href={`/${locale}/dashboard`}
                className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition-colors"
              >
                {t('backToDashboard')}
              </Link>
            </div>
          </div>

          {/* Right Column: Session Summary Card */}
          <div className="md:col-span-5">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#11142D] mb-1">
                  {subject}
                </h2>
                <p className="text-sm text-[#68718B]">{tutorName}</p>
              </div>

              <hr className="border-gray-100" />

              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[#68718B]">
                    <Calendar size={14} />
                    <span>{t('date')}</span>
                  </div>
                  <span className="font-semibold text-[#11142D]">{date}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[#68718B]">
                    <Clock size={14} />
                    <span>{t('time')}</span>
                  </div>
                  <span className="font-semibold text-[#11142D]">{time}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[#68718B]">
                    <Hourglass size={14} />
                    <span>{t('duration')}</span>
                  </div>
                  <span className="font-semibold text-[#11142D]">
                    {duration} {t('minutes')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[#68718B]">
                    <Tag size={14} />
                    <span>{t('hourlyRate')}</span>
                  </div>
                  <span className="font-semibold text-[#11142D]">
                    {hourlyRate} {currency}
                    {t('perHour')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[#68718B]">
                    <CreditCard size={14} />
                    <span>{t('totalPrice')}</span>
                  </div>
                  <span className="font-semibold text-[#11142D]">
                    {displayPrice} {currency}
                  </span>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div className="flex justify-between items-center pt-1">
                <span className="text-sm text-[#68718B]">{t('status')}</span>
                <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-100 rounded-full px-4 py-1.5 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
                  <p className="text-xs text-yellow-700 font-semibold tracking-wide">
                    {t('pending')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
