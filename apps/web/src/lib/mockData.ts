export const mockUser = {
  _id: "u1",
  firstName: "Ahmed",
  lastName: "Ali",
  email: "ahmed@example.com",
  role: "LEARNER",
  avatar: "/images/avatar.png",
  language: "en",
}

export const mockTutor = {
  _id: "t1",
  user: {
    _id: "u2",
    firstName: "Mona",
    lastName: "Hassan",
    email: "mona@example.com",
    avatar: "/images/tutor.png",
  },
  bio: "Math tutor with 5 years of experience.",
  headline: "Expert Math Tutor",
  educationLevel: "University",
  subjects: [
    {
      _id: "s1",
      nameEn: "Mathematics",
      nameAr: "الرياضيات",
      category: "Science",
    },
  ],
  hourlyRate: 250,
  currency: "EGP",
  meetingLink: "https://meet.google.com/example",
  isAvailable: true,
  averageRating: 4.8,
  totalReviews: 24,
}

export const mockBooking = {
  _id: "b1",
  learner: mockUser,
  tutor: mockTutor,
  subject: {
    _id: "s1",
    nameEn: "Mathematics",
    nameAr: "الرياضيات",
  },
  startTime: "2026-06-15T16:00:00.000Z",
  endTime: "2026-06-15T17:00:00.000Z",
  status: "PENDING",
  price: 250,
  platformCommission: 25,
  notes: "I need help with algebra.",
}

export const mockChat = {
  _id: "c1",
  participants: [mockUser, mockTutor.user],
  lastMessage: {
    _id: "m1",
    senderId: "u1",
    message: "Hello, are you available tomorrow?",
    isRead: false,
    createdAt: "2026-06-09T10:00:00.000Z",
  },
  unreadCount: 1,
}

export const mockMessage = {
  _id: "m1",
  chatId: "c1",
  sender: mockUser,
  message: "Hello, are you available tomorrow?",
  isRead: false,
  createdAt: "2026-06-09T10:00:00.000Z",
}

export const mockPayment = {
  _id: "p1",
  bookingId: "b1",
  amount: 250,
  platformCommission: 25,
  tutorEarning: 225,
  currency: "EGP",
  status: "PAID",
  paymentGateway: "Paymob",
  transactionId: "txn_123456",
  paidAt: "2026-06-09T10:30:00.000Z",
}

export const mockReview = {
  _id: "r1",
  bookingId: "b1",
  learner: mockUser,
  tutorId: "t1",
  rating: 5,
  comment: "Very helpful tutor.",
  createdAt: "2026-06-09T12:00:00.000Z",
}

export const mockAiRecommendation = {
  _id: "rec1",
  tutor: mockTutor,
  score: 92,
  reason: "This tutor matches your subject, budget, and preferred schedule.",
}