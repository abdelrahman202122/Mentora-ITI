


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


export const statsData = [
  { title: 'Total Users', value: 1250 },
  { title: 'Total Tutors', value: 85 },
  { title: 'Total Bookings', value: 420 },
  { title: 'Total Revenue', value: '$15,000' },
]

export const platformHealthData = [
  {
    label: 'Database',
    value: 'Healthy',
    status: 'operational',
  },
  {
    label: 'Payment API',
    value: 'Slow',
    status: 'degraded',
  },
]


export const financialData = [
  { day: 'Mon', value: 12000 },
  { day: 'Tue', value: 15000 },
  { day: 'Wed', value: 18000 },
  { day: 'Thu', value: 16000 },
  { day: 'Fri', value: 22000 },
  { day: 'Sat', value: 24000 }, 
]




import type {
  User,
  Tutor,
  Review,
  Transaction,
  Withdrawal,
  Booking,
} from "@/types/admin";
import { REVIEW_AVATAR_COLORS } from "@/utils/admin/badge-styles"
import { Clock, Star, UserCheck, Users } from "lucide-react"
// import { REVIEW_AVATAR_COLORS } from "@/utils/badge-styles";

/* ======================== Pagination defaults ======================== */
export const PER_PAGE = 10;
export const TOTAL_USERS = 128;
export const TOTAL_BOOKINGS = 48;
export const TOTAL_REVIEWS = 12842;
export const TOTAL_TX = 124;
export const COMMISSION_RATE = 0.15;

/* ======================== Users mock data ============================ */
export const USERS: User[] = [
  {
    id: "USR-0001",
    name: "Dr. Jane Smith",
    email: "jane.smith@example.com",
    role: "Tutor",
    status: "Active",
    regDate: "Jan 15, 2023",
    totalSessions: 142,
    avgRating: 4.9,
    lastActivity: "2 hours ago",
    roleLabel: "Senior Mathematics Tutor",
    reviews: [
      {
        reviewer: "Alex Rivera",
        rating: 5,
        text: "Exceptional clarity in explaining complex topics.",
        relativeTime: "2 days ago",
      },
      {
        reviewer: "Sarah Chen",
        rating: 5,
        text: "Very patient and knowledgeable.",
        relativeTime: "1 week ago",
      },
    ],
  },
  {
    id: "USR-0002",
    name: "Prof. Mark Chen",
    email: "mark.chen@example.com",
    role: "Tutor",
    status: "Active",
    regDate: "Mar 22, 2023",
    totalSessions: 98,
    avgRating: 4.7,
    lastActivity: "5 hours ago",
    roleLabel: "Computer Science Instructor",
    reviews: [
      {
        reviewer: "Kevin Lee",
        rating: 4,
        text: "Good intro to Python, but the pacing was too fast.",
        relativeTime: "3 days ago",
      },
    ],
  },
  {
    id: "USR-0003",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    role: "Student",
    status: "Active",
    regDate: "Jun 10, 2023",
    totalSessions: 24,
    avgRating: 4.5,
    lastActivity: "1 day ago",
  },
  {
    id: "USR-0004",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    role: "Student",
    status: "Pending",
    regDate: "Oct 1, 2023",
    totalSessions: 0,
    lastActivity: "Just registered",
  },
  {
    id: "USR-0005",
    name: "Admin User",
    email: "admin@mentora.com",
    role: "Admin",
    status: "Active",
    regDate: "Dec 1, 2022",
    totalSessions: 0,
    lastActivity: "30 min ago",
    roleLabel: "Platform Administrator",
  },
];

/* ======================== Tutors mock data =========================== */
export const tutorStats = [
  {
    label: "Total Tutors",
    value: "1,284",
    subtext: "+8% this month",
    icon: Users,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600",
  },
  {
    label: "Active Tutors",
    value: "1,024",
    subtext: "80% of total",
    icon: UserCheck,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
  },
  {
    label: "Pending Approval",
    value: "48",
    subtext: "Requires review",
    icon: Clock,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
  },
  {
    label: "Avg. Rating",
    value: "4.7",
    subtext: "★★★★★",
    icon: Star,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
];

export const TUTORS: Tutor[] = [
  {
    id: "TUT-001",
    name: "Dr. Aris Thorne",
    email: "aris.thorne@example.com",
    subjects: ["Physics", "Math"],
    hourlyRate: 65.0,
    rating: 4.9,
    approval: "Approved",
    account: "Active",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces",
    degree: "Ph.D. in Theoretical Physics",
    location: "New York, USA",
    joinedDate: "Jan 2023",
    bio: "Passionate physics educator with over 10 years of experience in making complex concepts accessible and engaging for students of all levels.",
    experience: [
      {
        title: "Senior Physics Lecturer",
        org: "Columbia University",
        period: "2018 - Present",
        description:
          "Lead instructor for undergraduate and graduate physics courses.",
      },
      {
        title: "Research Scientist",
        org: "MIT Lincoln Lab",
        period: "2014 - 2018",
        description:
          "Conducted research in quantum computing and theoretical physics.",
      },
    ],
    commissionRate: "15%",
    moderatorNotes: "Excellent tutor, highly recommended by students.",
  },
  {
    id: "TUT-002",
    name: "Prof. Elena Vance",
    email: "elena.vance@example.com",
    subjects: ["Chemistry", "Biology"],
    hourlyRate: 55.0,
    rating: 4.8,
    approval: "Approved",
    account: "Active",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop&crop=faces",
    degree: "M.Sc. in Organic Chemistry",
    location: "London, UK",
    joinedDate: "Mar 2023",
    bio: "Dedicated chemistry and biology tutor with a focus on practical lab skills and conceptual understanding.",
    experience: [
      {
        title: "Lab Instructor",
        org: "Imperial College London",
        period: "2019 - Present",
        description:
          "Conducts lab sessions and supervises student research projects.",
      },
    ],
    commissionRate: "15%",
  },
  {
    id: "TUT-003",
    name: "Marcus Holloway",
    email: "marcus.holloway@example.com",
    subjects: ["History", "English"],
    hourlyRate: 45.0,
    rating: 4.5,
    approval: "Pending",
    account: "Active",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces",
    degree: "B.A. in Modern History",
    location: "Chicago, USA",
    joinedDate: "Sep 2023",
    bio: "History and English tutor with a storytelling approach that brings the past to life.",
  },
];

/* ======================== Reviews mock data ========================== */
export const REVIEWS: Review[] = [
  {
    id: "r_001",
    tutor: "Dr. Jane Smith",
    tutorAvatarColor: REVIEW_AVATAR_COLORS[0],
    learner: "Alex Rivera",
    rating: 5,
    snippet: "Exceptional clarity in explaining complex topics.",
    fullReview:
      "Exceptional clarity in explaining complex topics. Dr. Smith broke down challenging calculus concepts into digestible pieces, making even the most difficult problems feel approachable. The session was well-structured with a perfect balance of theory and practice problems. Her patience and willingness to revisit concepts ensured I truly understood the material before moving forward. Highly recommended for anyone struggling with advanced mathematics.",
    date: "Oct 24, 2023",
    dateFull: "October 24, 2023 at 2:15 PM",
    topicArea: "Advanced Mathematics - Calculus II",
    sessionDuration: "60 Minutes",
  },
  {
    id: "r_002",
    tutor: "Prof. Mark Chen",
    tutorAvatarColor: REVIEW_AVATAR_COLORS[1],
    learner: "Sarah Connor",
    rating: 4,
    snippet: "Good intro to Python, but the pacing was too fast.",
    fullReview:
      "Good intro to Python, but the pacing was too fast for beginners. Prof. Chen clearly knows his stuff and the content was well-organized, but I felt like we rushed through some fundamental concepts that needed more time to sink in. The hands-on coding exercises were great though, and I appreciated the real-world examples. Would recommend for learners with some prior programming experience, but absolute beginners might want to start with a slower-paced session.",
    date: "Oct 22, 2023",
    dateFull: "October 22, 2023 at 10:30 AM",
    topicArea: "Computer Science - Python Basics",
    sessionDuration: "45 Minutes",
  },
  {
    id: "r_003",
    tutor: "Dr. Lisa Huang",
    tutorAvatarColor: REVIEW_AVATAR_COLORS[2],
    learner: "David Kim",
    rating: 5,
    snippet: "The lab demonstration was incredibly helpful.",
    fullReview:
      "The lab demonstration was incredibly helpful. Dr. Huang's approach to teaching organic chemistry through practical lab experiments made the abstract concepts tangible and memorable. Her detailed explanations of reaction mechanisms, combined with the live demonstrations, gave me a much deeper understanding than any textbook could. The session was engaging from start to finish, and I left feeling confident about upcoming exams. One of the best tutoring sessions I've ever had.",
    date: "Oct 20, 2023",
    dateFull: "October 20, 2023 at 3:45 PM",
    topicArea: "Chemistry - Organic Chemistry Lab",
    sessionDuration: "90 Minutes",
  },
];

/* ======================== Finance mock data ========================== */
export const TRANSACTIONS: Transaction[] = [
  {
    id: "tx_001",
    txId: "#TX-89210",
    learner: "Sarah Chen",
    tutor: "Dr. Aris Thorne",
    amount: 120.0,
    commission: 18.0,
    status: "COMPLETED",
    date: "Oct 24, 2023",
  },
  {
    id: "tx_002",
    txId: "#TX-89211",
    learner: "James Miller",
    tutor: "Prof. Elena Vance",
    amount: 85.0,
    commission: 12.75,
    status: "COMPLETED",
    date: "Oct 24, 2023",
  },
  {
    id: "tx_003",
    txId: "#TX-89212",
    learner: "Kevin Lee",
    tutor: "Dr. Aris Thorne",
    amount: 31.5,
    commission: 4.73,
    status: "PROCESSING",
    date: "Oct 25, 2023",
  },
];

export const WITHDRAWALS: Withdrawal[] = [
  {
    id: "wd_001",
    tutor: "Dr. Elena Vance",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop&crop=faces",
    requestedAmount: 1250.0,
    walletBalance: 1580.4,
    requestDate: "Oct 25, 2023",
    status: "PENDING",
  },
  {
    id: "wd_002",
    tutor: "Marcus Holloway",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces",
    requestedAmount: 450.0,
    walletBalance: 450.0,
    requestDate: "Oct 24, 2023",
    status: "PENDING",
  },
  {
    id: "wd_003",
    tutor: "Dr. Aris Thorne",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces",
    requestedAmount: 980.0,
    walletBalance: 1200.0,
    requestDate: "Oct 23, 2023",
    status: "PENDING",
  },
];

/* ======================== Bookings mock data ========================= */
export const BOOKINGS: Booking[] = [
  {
    id: "bk_001",
    bookingId: "#BK-41201",
    learner: "Sarah Chen",
    tutor: "Dr. Aris Thorne",
    subject: "PHYSICS",
    hasBadge: true,
    date: "Oct 25, 2023",
    status: "CONFIRMED",
    payment: "PAID",
    paymentMethod: "Visa •• 4242",
  },
  {
    id: "bk_002",
    bookingId: "#BK-41202",
    learner: "James Miller",
    tutor: "Prof. Elena Vance",
    subject: "CHEMISTRY",
    date: "Oct 25, 2023",
    status: "PENDING",
    payment: "PENDING",
  },
  {
    id: "bk_003",
    bookingId: "#BK-41203",
    learner: "Kevin Lee",
    tutor: "Dr. Aris Thorne",
    subject: "MATH",
    date: "Oct 24, 2023",
    status: "COMPLETED",
    payment: "PAID",
    paymentMethod: "Mastercard •• 8888",
  },
  {
    id: "bk_004",
    bookingId: "#BK-41204",
    learner: "Emily Davis",
    tutor: "Marcus Holloway",
    subject: "HISTORY",
    date: "Oct 23, 2023",
    status: "CANCELLED",
    payment: "REFUNDED",
  },
];