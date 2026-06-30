
// // "use client"

// // import { Suspense } from "react"
// // import { useSearchParams, useParams } from "next/navigation"
// // import Link from "next/link"
// // import { CheckCircle, MessageSquare, Mail } from "lucide-react"

// // function PaymentSuccessContent({ locale }: { locale: string }) {
// //   const searchParams = useSearchParams()

// //   const tutorId = searchParams.get("tutorId") ?? ""
// //   const tutorName = searchParams.get("tutorName") ?? "your tutor"
// //   const subject = searchParams.get("subject") ?? "Session"
// //   const date = searchParams.get("date") ?? ""
// //   const time = searchParams.get("time") ?? ""

// //   return (
// // <div className="min-h-screen flex flex-col justify-center bg-white bg-gradient-to-b from-[#F4F7FF] via-[#EAEEFE] to-[#D5E3FB]">

// //   <main className="max-w-5xl mx-auto w-full px-4 md:px-8 py-16">
// //     <div className="flex flex-col lg:flex-row gap-12 items-start">

// //       <div className="flex-1">
// //         <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center mb-6">
// //           <CheckCircle size={32} className="text-white" />
// //         </div>

// //         <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
// //           Payment Received
// //         </h1>

// //         <p className="text-gray-500 text-base mb-8 leading-relaxed">
// //           Contact details are now available. You can now message{" "}
// //           <span className="font-semibold text-gray-700">{tutorName}</span>{" "}
// //           directly to coordinate your lesson.
// //         </p>

// //         <div className="flex items-center gap-4 mb-8">
// //           <Link
// //             href={`/${locale}/messages/${tutorId}?tutorName=${encodeURIComponent(tutorName)}`}
// //             className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
// //           >
// //             <MessageSquare size={18} />
// //             Go to Chat
// //           </Link>
// //           <Link
// //             box-target
// //             href={`/${locale}/dashboard`}
// //             className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition-colors"
// //           >
// //             Back to Dashboard
// //           </Link>
// //         </div>

       
// //       </div>

// //       <div className="w-full lg:w-80 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-shrink-0">
// //         <h2 className="text-xl font-bold text-gray-900 mb-1">{subject}</h2>
// //         <p className="text-sm text-gray-500 mb-5">{tutorName}</p>

// //         <hr className="border-gray-100 mb-5" />

// //         <div className="flex flex-col gap-4">
// //           <div className="flex items-center justify-between text-sm">
// //             <span className="text-gray-500">Session Date</span>
// //             <span className="font-semibold text-gray-800">{date}</span>
// //           </div>
          
// //           <div className="flex items-center justify-between text-sm">
// //             <span className="text-gray-500">Session Time</span>
// //             <span className="font-semibold text-gray-800">{time}</span>
// //           </div>
// //           <hr className="border-gray-100" />
// //           <div className="flex items-center justify-between text-sm">
// //             <span className="text-gray-500">Status</span>
// //             <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
// //               Confirmed
// //             </span>
// //           </div>
// //         </div>
// //       </div>

// //     </div>
// //   </main>

// // </div>
// //   )
// // }

// // export default function PaymentSuccessPage() {
// //   const params = useParams()
// //   const locale = params.locale as string ?? "en"

// //   return (
// //     <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
// //       <PaymentSuccessContent locale={locale} />
// //     </Suspense>
// //   )
// // }


// 'use client';

// import { Suspense, useEffect, useState } from 'react';
// import { useSearchParams, useParams, useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { CheckCircle, MessageSquare, Mail, Loader2, AlertCircle } from 'lucide-react';
// import { getBookingById } from '@/services/booking-services/getBookingById';

// type VerifyState = 'checking' | 'paid' | 'timeout' | 'error';

// const POLL_INTERVAL_MS = 2000; // check every 2s
// const MAX_ATTEMPTS = 10; // ~20s total before giving up

// function PaymentSuccessContent({ locale }: { locale: string }) {
//   const router = useRouter();
//   const searchParams = useSearchParams();
// const bookingId = searchParams.get('merchant_order_id') ?? '';
//   const tutorId = searchParams.get('tutorId') ?? '';
//   const tutorName = searchParams.get('tutorName') ?? 'your tutor';
//   const subject = searchParams.get('subject') ?? 'Session';
//   const date = searchParams.get('date') ?? '';
//   const time = searchParams.get('time') ?? '';

//   const [verifyState, setVerifyState] = useState<VerifyState>('checking');

//   useEffect(() => {
//     // ✅ without a bookingId we have nothing to verify against — fall back to
//     // trusting the redirect, but this should be avoided by always including
//     // bookingId in Paymob's return_url
//     if (!bookingId) {
//       setVerifyState('paid');
//       return;
//     }

//     let attempts = 0;
//     let cancelled = false;

//     async function poll() {
//       try {
//         const booking = await getBookingById(bookingId);

//         if (cancelled) return;

//         if (booking.paymentStatus === 'paid') {
//           setVerifyState('paid');
//           return;
//         }

//         attempts += 1;
//         if (attempts >= MAX_ATTEMPTS) {
//           setVerifyState('timeout');
//           return;
//         }

//         setTimeout(poll, POLL_INTERVAL_MS);
//       } catch (err) {
//         console.error('Failed to verify payment status:', err);
//         if (!cancelled) setVerifyState('error');
//       }
//     }

//     poll();

//     return () => {
//       cancelled = true;
//     };
//   }, [bookingId]);

//   if (verifyState === 'checking') {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
//         <Loader2 size={40} className="animate-spin text-indigo-600" />
//         <p className="text-gray-500 text-sm">Confirming your payment...</p>
//       </div>
//     );
//   }

//   if (verifyState === 'timeout' || verifyState === 'error') {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white px-4 text-center">
//         <AlertCircle size={40} className="text-amber-500" />
//         <h1 className="text-xl font-bold text-gray-900">
//           {verifyState === 'timeout' ? 'Still confirming your payment' : 'Could not verify payment'}
//         </h1>
//         <p className="text-gray-500 text-sm max-w-sm">
//           {verifyState === 'timeout'
//             ? "This is taking longer than expected. Your payment may still be processing — check your dashboard in a moment."
//             : 'Something went wrong while checking your payment status. Please check your dashboard or contact support if the issue persists.'}
//         </p>
//         <Link
//           href={`/${locale}/dashboard`}
//           className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm"
//         >
//           Go to Dashboard
//         </Link>
//       </div>
//     );
//   }

//   // verifyState === 'paid'
//   return (
//     <div className="min-h-screen flex flex-col justify-center bg-white bg-gradient-to-b from-[#F4F7FF] via-[#EAEEFE] to-[#D5E3FB]">
//       <main className="max-w-5xl mx-auto w-full px-4 md:px-8 py-16">
//         <div className="flex flex-col lg:flex-row gap-12 items-start">
//           <div className="flex-1">
//             <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center mb-6">
//               <CheckCircle size={32} className="text-white" />
//             </div>

//             <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//               Payment Received
//             </h1>

//             <p className="text-gray-500 text-base mb-8 leading-relaxed">
//               Contact details are now available. You can now message{' '}
//               <span className="font-semibold text-gray-700">{tutorName}</span>{' '}
//               directly to coordinate your lesson.
//             </p>

//             <div className="flex items-center gap-4 mb-8">
//               <Link
//                 href={`/${locale}/messages/${tutorId}?tutorName=${encodeURIComponent(tutorName)}`}
//                 className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
//               >
//                 <MessageSquare size={18} />
//                 Go to Chat
//               </Link>
//               <Link
//                 href={`/${locale}/dashboard`}
//                 className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition-colors"
//               >
//                 Back to Dashboard
//               </Link>
//             </div>

//             <div className="flex items-center gap-2 text-sm text-gray-500">
//               <Mail size={16} className="text-indigo-400" />
//               A confirmation email has been sent to your inbox.
//             </div>
//           </div>

//           <div className="w-full lg:w-80 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-shrink-0">
//             <h2 className="text-xl font-bold text-gray-900 mb-1">{subject}</h2>
//             <p className="text-sm text-gray-500 mb-5">{tutorName}</p>

//             <hr className="border-gray-100 mb-5" />

//             <div className="flex flex-col gap-4">
//               <div className="flex items-center justify-between text-sm">
//                 <span className="text-gray-500">Session Date</span>
//                 <span className="font-semibold text-gray-800">{date}</span>
//               </div>

//               <div className="flex items-center justify-between text-sm">
//                 <span className="text-gray-500">Session Time</span>
//                 <span className="font-semibold text-gray-800">{time}</span>
//               </div>
//               <hr className="border-gray-100" />
//               <div className="flex items-center justify-between text-sm">
//                 <span className="text-gray-500">Status</span>
//                 <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
//                   Confirmed
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// export default function PaymentSuccessPage() {
//   const params = useParams();
//   const locale = (params.locale as string) ?? 'en';

//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen flex items-center justify-center text-gray-400">
//           Loading...
//         </div>
//       }
//     >
//       <PaymentSuccessContent locale={locale} />
//     </Suspense>
//   );
// }


'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, MessageSquare, Mail, Loader2, AlertCircle } from 'lucide-react';
// 1. ✅ بنستورد الـ service الجديدة بتاعة الـ Payment
import { getPaymentById } from '@/services/payment/getPaymentByIdService'; 

type VerifyState = 'checking' | 'paid' | 'timeout' | 'error';

const POLL_INTERVAL_MS = 2000; // بنشيّك كل ثانيتين
const MAX_ATTEMPTS = 10; // الإجمالي حوالي 20 ثانية قبل ما يزهق

function PaymentSuccessContent({ locale }: { locale: string }) {
  const searchParams = useSearchParams();

  // 2. ✅ بنلقط الـ Payment ID اللي جاي في الـ merchant_order_id من Paymob
  const paymentId = searchParams.get('merchant_order_id') ?? '';
  
  const tutorId = searchParams.get('tutorId') ?? '';
  const tutorName = searchParams.get('tutorName') ?? 'your tutor';
  const subject = searchParams.get('subject') ?? 'Session';
  const date = searchParams.get('date') ?? '';
  const time = searchParams.get('time') ?? '';

  const [verifyState, setVerifyState] = useState<VerifyState>('checking');

  useEffect(() => {
    // لو مفيش paymentId في اللينك (لأي سبب) بنعديه حماية للـ User Experience
    if (!paymentId) {
      setVerifyState('paid');
      return;
    }

    let attempts = 0;
    let cancelled = false;

    async function poll() {
      try {
        // 3. ✅ بنسأل السيرفر عن حالة الـ Payment ده بالـ ID بتاعه
        const payment = await getPaymentById(paymentId);

        if (cancelled) return;

        // 4. ✅ الـ شرط الجديد: لو الـ status بقت success، يبقى الـ Webhook سمع وكله تمام!
        if (payment.status === 'success') {
          setVerifyState('paid');
          return;
        }

        // لو لسه مابقتش success، بنزود المحاولات ونعيد الكرّة
        attempts += 1;
        if (attempts >= MAX_ATTEMPTS) {
          setVerifyState('timeout');
          return;
        }

        setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        console.error('Failed to verify payment status:', err);
        if (!cancelled) setVerifyState('error');
      }
    }

    poll();

    return () => {
      cancelled = true;
    };
  }, [paymentId]);

  if (verifyState === 'checking') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <Loader2 size={40} className="animate-spin text-indigo-600" />
        <p className="text-gray-500 text-sm">Confirming your payment status...</p>
      </div>
    );
  }

  if (verifyState === 'timeout' || verifyState === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white px-4 text-center">
        <AlertCircle size={40} className="text-amber-500" />
        <h1 className="text-xl font-bold text-gray-900">
          {verifyState === 'timeout' ? 'Still confirming your payment' : 'Could not verify payment'}
        </h1>
        <p className="text-gray-500 text-sm max-w-sm">
          {verifyState === 'timeout'
            ? "This is taking longer than expected. Your payment may still be processing — check your dashboard in a moment."
            : 'Something went wrong while checking your payment status. Please check your dashboard or contact support.'}
        </p>
        <Link
          href={`/${locale}/dashboard`}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  // verifyState === 'paid' (الدفع سليم ومؤكد في الـ DB)
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
              Contact details are now available. You can now message{' '}
              <span className="font-semibold text-gray-700">{tutorName}</span>{' '}
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
  );
}

export default function PaymentSuccessPage() {
  const params = useParams();
  const locale = (params.locale as string) ?? 'en';

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <PaymentSuccessContent locale={locale} />
    </Suspense>
  );
}