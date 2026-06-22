export interface BookingPayload {
  tutorProfileId: string;
  subjectId: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
}

export interface BookingResponse {
  success: boolean;
  bookingId: string;
  message?: string;
}

// 🔧 تحكمي من هنا: لو true هيشتغل Mock data، لو false هيضرب في الـ API الحقيقي علطول!
const IS_MOCK = true; 
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "YOUR_API_URL";

export async function createBooking(payload: BookingPayload): Promise<BookingResponse> {
  if (IS_MOCK) {
    // 🔧 محاكاة الـ Mock API (تأخير ثانية ونص ونجاح وهمي)
    await new Promise((res) => setTimeout(res, 1500));
    console.log("=== [Mock API] الطلب المرسل للباك اند ===", payload);
    return { success: true, bookingId: "mock-booking-123" };
  }

  // 🔗 الـ API الحقيقي (هتشتغل علطول أول ما تغيري IS_MOCK لـ false)
  const res = await fetch(`${BASE_URL}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // لو الـ API محتاج Token للحماية ممكن تضيفيه هنا مستقبلاً:
      // "Authorization": `Bearer ${token}` 
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Booking failed");
  }

  return res.json();
}