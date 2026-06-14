// import api from "@/lib/axios"
// export async function getMyBookings() {
//   // ✅ لما الـ backend يخلص — شيل الـ comment
//   // const res = await api.get("/bookings/my")
//   // return res.data

//   // 🔄 Static data مؤقتة
//   return [
//     {
//       id: 1,
//       subject: 'Academic Writing & Ethics',
//       tutorName: 'Dr. Elena Rodriguez',
//       time: 'Tomorrow, 10:00 AM (1h session)',
//       paymentPending: false,
//     },
//     {
//       id: 2,
//       subject: 'Microeconomics',
//       tutorName: 'Markus Weber',
//       time: 'Tomorrow, 02:00 PM (1h session)',
//       paymentPending: false,
//     },
//     {
//       id: 3,
//       subject: 'Advanced Physics',
//       tutorName: 'Sarah Jenkins',
//       time: 'Oct 28, 11:30 AM (1.5h session)',
//       paymentPending: true,
//     },
//   ];
// }
import api from "@/lib/axios"
import { mockBooking } from "@/lib/mockData"

export async function getMyBookings() {
  // ✅ لما الـ backend يخلص
  // const res = await api.get("/bookings/my")
  // return res.data

  return [
    {
      id: mockBooking._id,
      subject: mockBooking.subject.nameEn,
      tutorName:
        mockBooking.tutor.user.firstName +
        " " +
        mockBooking.tutor.user.lastName,
      startTime: mockBooking.startTime,
      endTime: mockBooking.endTime,
      status: mockBooking.status,
      price: mockBooking.price,
      currency: mockBooking.tutor.currency,
      notes: mockBooking.notes,
    },
  ]
}

export async function createBooking(data: {
  tutorId: string
  subjectId: string
  startTime: string
  endTime: string
  notes?: string
}) {
  // ✅ لما الـ backend يخلص
  // const res = await api.post("/bookings", data)
  // return res.data

  return {
    id: "b_new",
    ...data,
    status: "PENDING",
    price: mockBooking.price,
    currency: mockBooking.tutor.currency,
  }
}

export async function cancelBooking(id: string) {
  // ✅ لما الـ backend يخلص
  // const res = await api.patch(`/bookings/${id}/cancel`)
  // return res.data

  return { success: true }
}