import mongoose from 'mongoose';

import { env } from '../config/env.js';
import { hashPassword } from '../utils/hashPassword.js';
import { UserRole } from '../modules/users/user.interface.js';
import { UserModel } from '../modules/users/user.model.js';
import { TutorProfileModel } from '../modules/tutor/profile/tutor-profile.model.js';
import { TutorSubjectModel } from '../modules/tutor/subject/tutor-subject.model.js';
import { TutorAvailabilityModel } from '../modules/tutor/availability/tutor-availability.model.js';
import Booking from '../modules/bookings/booking.model.js';
import {
  BookingStatus,
  PaymentStatus,
} from '../modules/bookings/booking.types.js';

const seedPassword = 'Password123!';

const learnerSeeds = [
  {
    name: 'Sara Mahmoud',
    email: 'sara.learner@test.com',
  },
  {
    name: 'Adham Fathy',
    email: 'adham.learner@test.com',
  },
  {
    name: 'Mariam Nasser',
    email: 'mariam.learner@test.com',
  },
  {
    name: 'Omar Youssef',
    email: 'omar.learner@test.com',
  },
  {
    name: 'Laila Saad',
    email: 'laila.learner@test.com',
  },
];

const tutorSeeds = [
  {
    name: 'Amira Adel',
    email: 'amira.tutor@test.com',
    headline: 'مدرّسة رياضيات مبتكرة للثانوية العامة',
    bio: 'أساعد الطلاب على فهم التفاضل والتكامل والهندسة بطريقة عملية وبسيطة من أجل نتائج أفضل في الامتحانات.',
    hourlyRate: 220,
    languages: ['Arabic', 'English'],
    rating: 4.9,
    totalReviews: 42,
    subjects: [
      {
        category: 'mathematics',
        title: 'الرياضيات للثانوية العامة',
        description: 'شرح شامل للجبر والهندسة وحل أسئلة سنوات سابقة.',
        educationLevel: 'secondary',
        curriculum: 'national_new',
        gradeNote: 'الصفوف 10-12',
      },
    ],
    timezone: 'Africa/Cairo',
    slots: {
      monday: [{ startTime: '17:00', endTime: '20:00' }],
      wednesday: [{ startTime: '16:00', endTime: '19:00' }],
      friday: [{ startTime: '10:00', endTime: '13:00' }],
    },
  },
  {
    name: 'Khaled Samir',
    email: 'khaled.tutor@test.com',
    headline: 'مدرّس فيزياء متفوق مع خبرة تحضيرية للثانوية',
    bio: 'أبسط المفاهيم العلمية والفيزيائية مع التركيز على أسئلة الامتحانات وأساليب الحل السريع.',
    hourlyRate: 260,
    languages: ['Arabic', 'English'],
    rating: 4.7,
    totalReviews: 30,
    subjects: [
      {
        category: 'sciences',
        title: 'الفيزياء للثانوية العامة',
        description: 'ميكانيكا وكهرومغناطيسية ومراجعة نهائية مكثفة.',
        educationLevel: 'secondary',
        curriculum: 'national_new',
        gradeNote: 'الصف الثالث الثانوي',
      },
      {
        category: 'sciences',
        title: 'الكيمياء الأساسية',
        description: 'مبادئ الكيمياء والهياكل الذرية مع أمثلة امتحانية.',
        educationLevel: 'secondary',
        curriculum: 'national_new',
        gradeNote: 'الصف الثالث الثانوي',
      },
    ],
    timezone: 'Africa/Cairo',
    slots: {
      tuesday: [{ startTime: '18:00', endTime: '21:00' }],
      thursday: [{ startTime: '17:00', endTime: '20:00' }],
      saturday: [{ startTime: '11:00', endTime: '14:00' }],
    },
  },
  {
    name: 'Layla Mostafa',
    email: 'layla.tutor@test.com',
    headline: 'مدرّسة لغة إنجليزية تختص في المحادثة والكتابة الأكاديمية',
    bio: 'أقود الطلاب نحو الثقة في التحدث بالإنجليزية وتحسين القواعد والمفردات للجامعات والعمل.',
    hourlyRate: 200,
    languages: ['Arabic', 'English'],
    rating: 4.8,
    totalReviews: 27,
    subjects: [
      {
        category: 'languages',
        title: 'اللغة الإنجليزية للمحادثة',
        description: 'تدريب على المحادثة، العرض الشفهي، والكتابة الأكاديمية.',
        educationLevel: 'professional',
        curriculum: 'none',
        gradeNote: 'جميع المستويات',
      },
      {
        category: 'languages',
        title: 'English Grammar & Writing',
        description:
          'Grammar foundations and writing practice for confident English use.',
        educationLevel: 'professional',
        curriculum: 'none',
        gradeNote: 'Advanced learners',
      },
    ],
    timezone: 'Europe/London',
    slots: {
      monday: [{ startTime: '09:00', endTime: '11:00' }],
      wednesday: [{ startTime: '14:00', endTime: '16:00' }],
      sunday: [{ startTime: '17:00', endTime: '19:00' }],
    },
  },
  {
    name: 'Omar Hossam',
    email: 'omar.tutor@test.com',
    headline: 'مدرّس برمجة وتكنولوجيا المعلومات للمبتدئين',
    bio: 'أعلم أساسيات البرمجة بلغة JavaScript وأجهزة الكمبيوتر مع أمثلة تطبيقية للمشاريع الصغيرة.',
    hourlyRate: 280,
    languages: ['Arabic', 'English'],
    rating: 4.6,
    totalReviews: 19,
    subjects: [
      {
        category: 'technology',
        title: 'أساسيات البرمجة',
        description:
          'مقدمة في البرمجة والبرمجة بلغة JavaScript ودورات تدريبية عملية.',
        educationLevel: 'university',
        curriculum: 'none',
        gradeNote: 'مناسب للمبتدئين',
      },
      {
        category: 'technology',
        title: 'Web Development Basics',
        description: 'HTML, CSS, وJavaScript لبناء صفحات وتطبيقات بسيطة.',
        educationLevel: 'university',
        curriculum: 'none',
        gradeNote: 'Beginner learners',
      },
    ],
    timezone: 'Africa/Cairo',
    slots: {
      tuesday: [{ startTime: '15:00', endTime: '18:00' }],
      thursday: [{ startTime: '16:00', endTime: '19:00' }],
      saturday: [{ startTime: '09:00', endTime: '12:00' }],
    },
  },
  {
    name: 'Nour Saber',
    email: 'nour.tutor@test.com',
    headline: 'معلمة لغة عربية للقراءة والتحليل الأدبي',
    bio: 'أساعد الطلاب على فهم النصوص وتحليل الأدب العربي وتحسين مهارات التعبير الكتابي.',
    hourlyRate: 210,
    languages: ['Arabic'],
    rating: 4.5,
    totalReviews: 15,
    subjects: [
      {
        category: 'languages',
        title: 'اللغة العربية والتحليل الأدبي',
        description: 'قراءة نصوص، تحليل أدبي، وتدريب على التعبير.',
        educationLevel: 'secondary',
        curriculum: 'national_new',
        gradeNote: 'الثانوية العامة',
      },
    ],
    timezone: 'Africa/Cairo',
    slots: {
      sunday: [{ startTime: '12:00', endTime: '15:00' }],
      tuesday: [{ startTime: '17:00', endTime: '20:00' }],
      thursday: [{ startTime: '18:00', endTime: '20:00' }],
    },
  },
  {
    name: 'Huda Kamal',
    email: 'huda.tutor@test.com',
    headline: 'مدرّسة كيمياء مع خبرة في امتحانات IB وIGCSE',
    bio: 'أقدّم تحضيراً مفصلاً للامتحانات الدولية مع تركيز على الفهم العملي والتجربة الذهنية.',
    hourlyRate: 300,
    languages: ['Arabic', 'English'],
    rating: 4.8,
    totalReviews: 33,
    subjects: [
      {
        category: 'sciences',
        title: 'الكيمياء للامتحانات الدولية',
        description:
          'تحضير IB وIGCSE مع مراجعات منهج الكيمياء العضوية وغير العضوية.',
        educationLevel: 'secondary',
        curriculum: 'igcse',
        gradeNote: 'مناسب لجميع المستويات',
      },
      {
        category: 'sciences',
        title: 'Science Exam Strategy',
        description: 'تنظيم الوقت وتقنيات حل أسئلة العلم للامتحانات الدولية.',
        educationLevel: 'secondary',
        curriculum: 'igcse',
        gradeNote: 'High school learners',
      },
    ],
    timezone: 'Europe/London',
    slots: {
      monday: [{ startTime: '10:00', endTime: '13:00' }],
      thursday: [{ startTime: '15:00', endTime: '18:00' }],
      saturday: [{ startTime: '11:00', endTime: '14:00' }],
    },
  },
  {
    name: 'Mazen Farouk',
    email: 'mazen.tutor@test.com',
    headline: 'Secondary Mathematics tutor with exam focus',
    bio: 'I support learners with algebra, trigonometry, and exam preparation for national and international curricula.',
    hourlyRate: 240,
    languages: ['English', 'Arabic'],
    rating: 4.7,
    totalReviews: 29,
    subjects: [
      {
        category: 'mathematics',
        title: 'Secondary Mathematics',
        description:
          'Algebra, functions, and geometry coaching for high school exams.',
        educationLevel: 'secondary',
        curriculum: 'national_new',
        gradeNote: 'Grades 9-12',
      },
    ],
    timezone: 'Africa/Cairo',
    slots: {
      monday: [{ startTime: '18:00', endTime: '21:00' }],
      wednesday: [{ startTime: '17:00', endTime: '20:00' }],
      sunday: [{ startTime: '09:00', endTime: '12:00' }],
    },
  },
  {
    name: 'Amanda White',
    email: 'amanda.tutor@test.com',
    headline: 'English Language coach for exams and conversation',
    bio: 'I help learners improve fluency, vocabulary, and academic writing for school and work.',
    hourlyRate: 210,
    languages: ['English'],
    rating: 4.6,
    totalReviews: 26,
    subjects: [
      {
        category: 'languages',
        title: 'English Conversation & Writing',
        description:
          'Personalized sessions to build confidence in speaking and writing.',
        educationLevel: 'professional',
        curriculum: 'none',
        gradeNote: 'Beginner to advanced',
      },
      {
        category: 'languages',
        title: 'Academic Writing',
        description:
          'Essay structure, clarity, and academic expression for university learners.',
        educationLevel: 'university',
        curriculum: 'none',
        gradeNote: 'Advanced learners',
      },
    ],
    timezone: 'Europe/London',
    slots: {
      tuesday: [{ startTime: '09:00', endTime: '11:00' }],
      thursday: [{ startTime: '14:00', endTime: '16:00' }],
      saturday: [{ startTime: '10:00', endTime: '12:00' }],
    },
  },
  {
    name: 'Rayan Johnson',
    email: 'rayan.tutor@test.com',
    headline: 'Math tutor for British and American curricula',
    bio: 'Specialized in IGCSE, A-Level, and SAT math with problem-solving practice and exam strategy.',
    hourlyRate: 320,
    languages: ['English'],
    rating: 4.9,
    totalReviews: 45,
    subjects: [
      {
        category: 'mathematics',
        title: 'IGCSE & SAT Mathematics',
        description:
          'Skills training for international exams and advanced high-school math.',
        educationLevel: 'secondary',
        curriculum: 'american',
        gradeNote: 'IGCSE / SAT / Secondary',
      },
      {
        category: 'mathematics',
        title: 'Advanced Problem Solving',
        description:
          'Higher-level reasoning, proof strategies, and exam-style challenges.',
        educationLevel: 'secondary',
        curriculum: 'british',
        gradeNote: 'A-Level and beyond',
      },
    ],
    timezone: 'Europe/London',
    slots: {
      monday: [{ startTime: '10:00', endTime: '13:00' }],
      wednesday: [{ startTime: '14:00', endTime: '17:00' }],
      friday: [{ startTime: '12:00', endTime: '15:00' }],
    },
  },
  {
    name: 'Mina Sherif',
    email: 'mina.tutor@test.com',
    headline: 'Business mathematics tutor with practical case studies',
    bio: 'I explain statistics, finance math, and quantitative reasoning for commerce students.',
    hourlyRate: 275,
    languages: ['English', 'Arabic'],
    rating: 4.7,
    totalReviews: 24,
    subjects: [
      {
        category: 'commerce_law',
        title: 'Business Mathematics',
        description:
          'Statistics, accounting math, and practical exercises for commerce students.',
        educationLevel: 'university',
        curriculum: 'national_new',
        gradeNote: 'Undergraduate and professional learners',
      },
    ],
    timezone: 'Africa/Cairo',
    slots: {
      tuesday: [{ startTime: '16:00', endTime: '19:00' }],
      thursday: [{ startTime: '17:00', endTime: '20:00' }],
      sunday: [{ startTime: '10:00', endTime: '13:00' }],
    },
  },
  {
    name: 'Sara Nabil',
    email: 'sara.tutor2@test.com',
    headline: 'Academic writing tutor for essay and exam success',
    bio: 'I support learners in structuring essays, developing ideas, and producing clear academic responses.',
    hourlyRate: 190,
    languages: ['English'],
    rating: 4.8,
    totalReviews: 28,
    subjects: [
      {
        category: 'languages',
        title: 'Academic Writing',
        description:
          'Essay planning, paragraph structure, and exam-style writing practice.',
        educationLevel: 'university',
        curriculum: 'none',
        gradeNote: 'University students and professionals',
      },
    ],
    timezone: 'Europe/London',
    slots: {
      monday: [{ startTime: '09:00', endTime: '11:00' }],
      wednesday: [{ startTime: '10:00', endTime: '12:00' }],
      friday: [{ startTime: '15:00', endTime: '17:00' }],
    },
  },
  {
    name: 'Youssef Naji',
    email: 'youssef.tutor@test.com',
    headline: 'حاسب آلي وبرمجة للطلاب الجامعيين',
    bio: 'أقدم تدريباً عملياً في الجافا سكربت وعلوم الحاسب مع مشاريع صغيرة لفهم البرمجيات.',
    hourlyRate: 330,
    languages: ['Arabic', 'English'],
    rating: 4.7,
    totalReviews: 22,
    subjects: [
      {
        category: 'technology',
        title: 'البرمجة وعلوم الحاسب',
        description: 'برمجة JavaScript وهياكل البيانات والمشاريع التطبيقية.',
        educationLevel: 'university',
        curriculum: 'none',
        gradeNote: 'المرحلة الجامعية',
      },
      {
        category: 'technology',
        title: 'Data Structures & Algorithms',
        description:
          'Introduction to arrays, stacks, queues, and algorithmic thinking.',
        educationLevel: 'university',
        curriculum: 'none',
        gradeNote: 'First-year CS students',
      },
    ],
    timezone: 'Asia/Dubai',
    slots: {
      tuesday: [{ startTime: '12:00', endTime: '15:00' }],
      thursday: [{ startTime: '16:00', endTime: '19:00' }],
      saturday: [{ startTime: '13:00', endTime: '16:00' }],
    },
  },
  {
    name: 'Hana Khalil',
    email: 'hana.tutor@test.com',
    headline: 'Private chemistry tutor with active exam prep',
    bio: 'I review chemistry fundamentals and help learners solve exam questions with confidence.',
    hourlyRate: 295,
    languages: ['English'],
    rating: 4.6,
    totalReviews: 31,
    subjects: [
      {
        category: 'sciences',
        title: 'General Chemistry',
        description:
          'Chemistry fundamentals, reactions, and exam question practice.',
        educationLevel: 'secondary',
        curriculum: 'national_new',
        gradeNote: 'High school science students',
      },
      {
        category: 'sciences',
        title: 'Biology Fundamentals',
        description:
          'Basic biology concepts and exam readiness for science learners.',
        educationLevel: 'secondary',
        curriculum: 'national_new',
        gradeNote: 'High school learners',
      },
    ],
    timezone: 'Africa/Cairo',
    slots: {
      monday: [{ startTime: '17:00', endTime: '20:00' }],
      wednesday: [{ startTime: '16:00', endTime: '19:00' }],
      friday: [{ startTime: '09:00', endTime: '12:00' }],
    },
  },
  {
    name: 'Nadia Fadel',
    email: 'nadia.tutor@test.com',
    headline: 'Physics and mathematics tutor for science students',
    bio: 'I support students with problem solving and concept revision for science and engineering tracks.',
    hourlyRate: 310,
    languages: ['English'],
    rating: 4.9,
    totalReviews: 38,
    subjects: [
      {
        category: 'sciences',
        title: 'Physics for Science Students',
        description:
          'Mechanics, waves, and practical problem-solving for high school and university prep.',
        educationLevel: 'secondary',
        curriculum: 'national_new',
        gradeNote: 'Grades 10-12',
      },
    ],
    timezone: 'Europe/London',
    slots: {
      tuesday: [{ startTime: '10:00', endTime: '13:00' }],
      thursday: [{ startTime: '14:00', endTime: '17:00' }],
      saturday: [{ startTime: '11:00', endTime: '14:00' }],
    },
  },
  {
    name: 'Karim Zaki',
    email: 'karim.tutor@test.com',
    headline: 'Experienced econometrics tutor for university students',
    bio: 'I teach quantitative analysis, statistics, and exam preparation for economics and finance majors.',
    hourlyRate: 340,
    languages: ['English'],
    rating: 4.8,
    totalReviews: 35,
    subjects: [
      {
        category: 'commerce_law',
        title: 'Econometrics & Statistics',
        description:
          'Regression, probability, and applied statistics for business and economics.',
        educationLevel: 'university',
        curriculum: 'none',
        gradeNote: 'Undergraduate learners',
      },
      {
        category: 'commerce_law',
        title: 'Statistics for Business',
        description:
          'Business-focused statistics concepts and practical case studies.',
        educationLevel: 'university',
        curriculum: 'none',
        gradeNote: 'Finance and commerce students',
      },
    ],
    timezone: 'Europe/London',
    slots: {
      monday: [{ startTime: '15:00', endTime: '18:00' }],
      wednesday: [{ startTime: '14:00', endTime: '17:00' }],
      friday: [{ startTime: '12:00', endTime: '15:00' }],
    },
  },
  {
    name: 'Tamer Yousry',
    email: 'tamer.tutor@test.com',
    headline: 'مدرّس دراسات اجتماعية واجتماعيات للثانوية العامة',
    bio: 'أقدّم مراجعات قوية للمناهج والاجتماعيات وأمارس مهارات التحليل والنقاش.',
    hourlyRate: 190,
    languages: ['Arabic'],
    rating: 4.4,
    totalReviews: 18,
    subjects: [
      {
        category: 'social_studies',
        title: 'الدراسات الاجتماعية',
        description: 'تاريخ، جغرافيا، ومهارات تحليل اجتماعي للثانوية العامة.',
        educationLevel: 'secondary',
        curriculum: 'national_new',
        gradeNote: 'الصف الثالث الثانوي',
      },
    ],
    timezone: 'Africa/Cairo',
    slots: {
      sunday: [{ startTime: '10:00', endTime: '13:00' }],
      tuesday: [{ startTime: '17:00', endTime: '20:00' }],
      thursday: [{ startTime: '18:00', endTime: '20:00' }],
    },
  },
  {
    name: 'Mariam Ali',
    email: 'mariam.tutor@test.com',
    headline: 'Arabic tutor for literature and comprehension',
    bio: 'I support learners in Arabic literature, reading comprehension, and written expression.',
    hourlyRate: 210,
    languages: ['Arabic', 'English'],
    rating: 4.5,
    totalReviews: 20,
    subjects: [
      {
        category: 'languages',
        title: 'Arabic Literature',
        description:
          'Literary analysis, reading skills, and composition training.',
        educationLevel: 'secondary',
        curriculum: 'national_new',
        gradeNote: 'High school',
      },
    ],
    timezone: 'Asia/Dubai',
    slots: {
      monday: [{ startTime: '11:00', endTime: '14:00' }],
      wednesday: [{ startTime: '13:00', endTime: '16:00' }],
      saturday: [{ startTime: '10:00', endTime: '13:00' }],
    },
  },
  {
    name: 'Omar Fathy',
    email: 'omar.tutor2@test.com',
    headline: 'Certified tutor for computer science fundamentals',
    bio: 'I teach programming concepts, data structures, and exam problem solving for tech learners.',
    hourlyRate: 310,
    languages: ['English'],
    rating: 4.6,
    totalReviews: 32,
    subjects: [
      {
        category: 'technology',
        title: 'Computer Science Fundamentals',
        description:
          'Algorithms, programming principles, and software thinking for university prep.',
        educationLevel: 'university',
        curriculum: 'none',
        gradeNote: 'Beginner to intermediate',
      },
      {
        category: 'technology',
        title: 'Algorithms',
        description:
          'Introduction to algorithmic thinking and problem solving.',
        educationLevel: 'university',
        curriculum: 'none',
        gradeNote: 'Computer science learners',
      },
    ],
    timezone: 'Europe/London',
    slots: {
      tuesday: [{ startTime: '13:00', endTime: '16:00' }],
      thursday: [{ startTime: '16:00', endTime: '19:00' }],
      saturday: [{ startTime: '10:00', endTime: '13:00' }],
    },
  },
  {
    name: 'Layla Shams',
    email: 'layla.tutor2@test.com',
    headline: 'Arabic and English language tutor for exam success',
    bio: 'I combine language practice with exam strategy for both Arabic and English tracks.',
    hourlyRate: 205,
    languages: ['Arabic', 'English'],
    rating: 4.7,
    totalReviews: 23,
    subjects: [
      {
        category: 'languages',
        title: 'Arabic & English Language Support',
        description:
          'Grammar, reading, and exam writing practice in both languages.',
        educationLevel: 'secondary',
        curriculum: 'national_new',
        gradeNote: 'High school and above',
      },
    ],
    timezone: 'Africa/Cairo',
    slots: {
      monday: [{ startTime: '15:00', endTime: '18:00' }],
      wednesday: [{ startTime: '17:00', endTime: '20:00' }],
      friday: [{ startTime: '09:00', endTime: '12:00' }],
    },
  },
  {
    name: 'Ola Fahmy',
    email: 'ola.tutor@test.com',
    headline: 'English literature tutor for secondary and university learners',
    bio: 'I guide students through literature analysis, critical reading, and exam essay writing.',
    hourlyRate: 215,
    languages: ['English'],
    rating: 4.8,
    totalReviews: 26,
    subjects: [
      {
        category: 'languages',
        title: 'English Literature',
        description:
          'Book analysis, exam essay preparation, and literary criticism skills.',
        educationLevel: 'university',
        curriculum: 'none',
        gradeNote: 'Advanced learners',
      },
    ],
    timezone: 'Europe/London',
    slots: {
      tuesday: [{ startTime: '11:00', endTime: '14:00' }],
      friday: [{ startTime: '13:00', endTime: '16:00' }],
      sunday: [{ startTime: '10:00', endTime: '13:00' }],
    },
  },
  {
    name: 'Hassan El-Masry',
    email: 'hassan.tutor@test.com',
    headline: 'مدرّس رياضيات للطلاب الدوليين',
    bio: 'أقدّم جلسات رياضيات متقدمة للمنهج البريطاني والأمريكي مع تركيز على حل الأعداد والمسائل.',
    hourlyRate: 300,
    languages: ['Arabic', 'English'],
    rating: 4.9,
    totalReviews: 40,
    subjects: [
      {
        category: 'mathematics',
        title: 'International Mathematics',
        description:
          'IGCSE and American curriculum mathematics with نظام حل واضح.',
        educationLevel: 'secondary',
        curriculum: 'british',
        gradeNote: 'IGCSE / A-Level',
      },
    ],
    timezone: 'Europe/London',
    slots: {
      monday: [{ startTime: '10:00', endTime: '13:00' }],
      thursday: [{ startTime: '15:00', endTime: '18:00' }],
      saturday: [{ startTime: '09:00', endTime: '12:00' }],
    },
  },
  {
    name: 'Noha Rashad',
    email: 'noha.tutor@test.com',
    headline: 'ISTE-trained science tutor for practical learning',
    bio: 'I present science concepts with experiments, diagrams, and active problem-solving.',
    hourlyRate: 265,
    languages: ['English'],
    rating: 4.6,
    totalReviews: 20,
    subjects: [
      {
        category: 'sciences',
        title: 'Practical Science Learning',
        description: 'Hands-on science coaching for secondary school learners.',
        educationLevel: 'secondary',
        curriculum: 'national_new',
        gradeNote: 'Grades 7-12',
      },
    ],
    timezone: 'Africa/Cairo',
    slots: {
      sunday: [{ startTime: '10:00', endTime: '12:00' }],
      tuesday: [{ startTime: '16:00', endTime: '18:00' }],
      friday: [{ startTime: '14:00', endTime: '16:00' }],
    },
  },
  {
    name: 'Mona Fawzi',
    email: 'mona.tutor@test.com',
    headline: 'English exam preparation specialist',
    bio: 'Focus on IELTS, TOEFL, and general English exams with practice tests and feedback.',
    hourlyRate: 280,
    languages: ['English'],
    rating: 4.8,
    totalReviews: 36,
    subjects: [
      {
        category: 'languages',
        title: 'English Exam Preparation',
        description: 'IELTS, TOEFL, and academic English exam coaching.',
        educationLevel: 'professional',
        curriculum: 'american',
        gradeNote: 'Advanced learners',
      },
    ],
    timezone: 'Europe/London',
    slots: {
      monday: [{ startTime: '10:00', endTime: '13:00' }],
      thursday: [{ startTime: '14:00', endTime: '17:00' }],
      saturday: [{ startTime: '11:00', endTime: '14:00' }],
    },
  },
  {
    name: 'Farah Abdel',
    email: 'farah.tutor@test.com',
    headline: 'مدرّسة اللغة العربية للمستويات الابتدائية والإعدادية',
    bio: 'أستخدم طرقاً سهلة لجعل القراءة والكتابة العربية ممتعة وتطوير مهارات الفهم.',
    hourlyRate: 195,
    languages: ['Arabic'],
    rating: 4.5,
    totalReviews: 21,
    subjects: [
      {
        category: 'languages',
        title: 'اللغة العربية للمراحل الأولية',
        description: 'تعليم القراءة والكتابة والقواعد بطريقة مبسطة وممتعة.',
        educationLevel: 'primary',
        curriculum: 'national_new',
        gradeNote: 'المرحلة الابتدائية',
      },
    ],
    timezone: 'Africa/Cairo',
    slots: {
      monday: [{ startTime: '08:00', endTime: '10:00' }],
      wednesday: [{ startTime: '09:00', endTime: '11:00' }],
      friday: [{ startTime: '10:00', endTime: '12:00' }],
    },
  },
  {
    name: 'Hani Soliman',
    email: 'hani.tutor@test.com',
    headline: 'Engineering mathematics tutor for university students',
    bio: 'I coach engineering students in calculus, differential equations, and mechanics problems.',
    hourlyRate: 350,
    languages: ['English'],
    rating: 4.9,
    totalReviews: 41,
    subjects: [
      {
        category: 'engineering',
        title: 'Engineering Mathematics',
        description:
          'Advanced calculus, linear algebra, and engineering problem solving.',
        educationLevel: 'university',
        curriculum: 'university',
        gradeNote: 'Undergraduate engineers',
      },
    ],
    timezone: 'Asia/Dubai',
    slots: {
      tuesday: [{ startTime: '14:00', endTime: '17:00' }],
      thursday: [{ startTime: '15:00', endTime: '18:00' }],
      sunday: [{ startTime: '13:00', endTime: '16:00' }],
    },
  },
  {
    name: 'Rania Hamed',
    email: 'rania.tutor@test.com',
    headline: 'Creative arts and design tutor for students and hobbyists',
    bio: 'I help learners build visual thinking and practical design skills for projects and portfolios.',
    hourlyRate: 230,
    languages: ['English'],
    rating: 4.5,
    totalReviews: 17,
    subjects: [
      {
        category: 'arts',
        title: 'Arts & Design Fundamentals',
        description:
          'Drawing, composition, and portfolio development for creative learners.',
        educationLevel: 'professional',
        curriculum: 'none',
        gradeNote: 'Beginner to intermediate',
      },
    ],
    timezone: 'Europe/London',
    slots: {
      monday: [{ startTime: '11:00', endTime: '14:00' }],
      friday: [{ startTime: '12:00', endTime: '15:00' }],
      sunday: [{ startTime: '09:00', endTime: '12:00' }],
    },
  },
  {
    name: 'Sara Adel',
    email: 'sara.tutor3@test.com',
    headline: 'Secondary science tutor with exam strategy',
    bio: 'I help students develop confidence in biology, chemistry, and physics concepts for exams.',
    hourlyRate: 260,
    languages: ['English'],
    rating: 4.6,
    totalReviews: 29,
    subjects: [
      {
        category: 'sciences',
        title: 'Secondary Science Review',
        description:
          'Integrated science coaching for high school exam readiness.',
        educationLevel: 'secondary',
        curriculum: 'national_new',
        gradeNote: 'Grades 9-12',
      },
    ],
    timezone: 'Africa/Cairo',
    slots: {
      tuesday: [{ startTime: '16:00', endTime: '19:00' }],
      thursday: [{ startTime: '17:00', endTime: '20:00' }],
      saturday: [{ startTime: '10:00', endTime: '13:00' }],
    },
  },
  {
    name: 'Nadine Amin',
    email: 'nadine.tutor2@test.com',
    headline: 'Professional English speaking coach',
    bio: 'I coach professionals in presentations, interviews, and workplace communication skills.',
    hourlyRate: 240,
    languages: ['English'],
    rating: 4.6,
    totalReviews: 22,
    subjects: [
      {
        category: 'languages',
        title: 'Professional English Communication',
        description:
          'Workplace speaking, presentations, and interview preparation.',
        educationLevel: 'professional',
        curriculum: 'none',
        gradeNote: 'Professionals and advanced learners',
      },
    ],
    timezone: 'Europe/London',
    slots: {
      monday: [{ startTime: '10:00', endTime: '13:00' }],
      wednesday: [{ startTime: '14:00', endTime: '17:00' }],
      friday: [{ startTime: '09:00', endTime: '12:00' }],
    },
  },
  {
    name: 'Zeinab Khaled',
    email: 'zeinab.tutor@test.com',
    headline: 'مدرّسة مفردات ومحادثة الإنجليزية',
    bio: 'أعمل مع الطلاب على توسيع المفردات وتحسين الطلاقة في المواقف اليومية والأكاديمية.',
    hourlyRate: 205,
    languages: ['Arabic', 'English'],
    rating: 4.7,
    totalReviews: 25,
    subjects: [
      {
        category: 'languages',
        title: 'Vocabulary & Conversation',
        description: 'توسيع المفردات وتدريب المحادثة باللغة الإنجليزية.',
        educationLevel: 'secondary',
        curriculum: 'none',
        gradeNote: 'مستويات ما قبل المتوسط إلى المتقدم',
      },
    ],
    timezone: 'Africa/Cairo',
    slots: {
      sunday: [{ startTime: '09:00', endTime: '12:00' }],
      tuesday: [{ startTime: '15:00', endTime: '18:00' }],
      thursday: [{ startTime: '16:00', endTime: '19:00' }],
    },
  },
  {
    name: 'Hany Fadel',
    email: 'hany.tutor@test.com',
    headline: 'Mathematics tutor for national and international tracks',
    bio: 'I deliver clear lessons in calculus, algebra, and exam skills for both national and international students.',
    hourlyRate: 285,
    languages: ['English'],
    rating: 4.8,
    totalReviews: 32,
    subjects: [
      {
        category: 'mathematics',
        title: 'Calculus & Algebra',
        description: 'Clear math coaching for school and university readiness.',
        educationLevel: 'secondary',
        curriculum: 'ib',
        gradeNote: 'IGCSE / IB / National',
      },
    ],
    timezone: 'Europe/London',
    slots: {
      monday: [{ startTime: '12:00', endTime: '15:00' }],
      wednesday: [{ startTime: '14:00', endTime: '17:00' }],
      saturday: [{ startTime: '10:00', endTime: '13:00' }],
    },
  },
];

const bookingSeeds = [
  {
    learnerIndex: 0,
    tutorIndex: 0,
    daysAhead: 2,
    startHour: 17,
    durationMinutes: 60,
    paymentStatus: PaymentStatus.PAID,
    bookingStatus: BookingStatus.CONFIRMED,
    learnerNote: 'I need help with last-minute revision.',
  },
  {
    learnerIndex: 1,
    tutorIndex: 2,
    daysAhead: 3,
    startHour: 9,
    durationMinutes: 90,
    paymentStatus: PaymentStatus.UNPAID,
    bookingStatus: BookingStatus.PENDING,
    learnerNote: 'Practice speaking skills before the interview.',
  },
  {
    learnerIndex: 2,
    tutorIndex: 6,
    daysAhead: 4,
    startHour: 18,
    durationMinutes: 60,
    paymentStatus: PaymentStatus.PAID,
    bookingStatus: BookingStatus.CONFIRMED,
    learnerNote: 'Need help on algebra topics.',
  },
  {
    learnerIndex: 3,
    tutorIndex: 10,
    daysAhead: 5,
    startHour: 16,
    durationMinutes: 60,
    paymentStatus: PaymentStatus.PAID,
    bookingStatus: BookingStatus.CONFIRMED,
    learnerNote: 'Working on physics exam questions.',
  },
  {
    learnerIndex: 4,
    tutorIndex: 13,
    daysAhead: 6,
    startHour: 14,
    durationMinutes: 60,
    paymentStatus: PaymentStatus.PAID,
    bookingStatus: BookingStatus.CONFIRMED,
    learnerNote: 'I want to improve my writing score.',
  },
  {
    learnerIndex: 0,
    tutorIndex: 15,
    daysAhead: 7,
    startHour: 10,
    durationMinutes: 60,
    paymentStatus: PaymentStatus.PENDING,
    bookingStatus: BookingStatus.PENDING,
    learnerNote: 'Looking for professional communication coaching.',
  },
  {
    learnerIndex: 1,
    tutorIndex: 18,
    daysAhead: 8,
    startHour: 12,
    durationMinutes: 90,
    paymentStatus: PaymentStatus.PAID,
    bookingStatus: BookingStatus.CONFIRMED,
    learnerNote: 'Preparation for university entrance.',
  },
  {
    learnerIndex: 2,
    tutorIndex: 21,
    daysAhead: 9,
    startHour: 15,
    durationMinutes: 60,
    paymentStatus: PaymentStatus.UNPAID,
    bookingStatus: BookingStatus.PENDING,
    learnerNote: 'Need support with business math.',
  },
  {
    learnerIndex: 3,
    tutorIndex: 7,
    daysAhead: 10,
    startHour: 10,
    durationMinutes: 60,
    paymentStatus: PaymentStatus.PAID,
    bookingStatus: BookingStatus.CONFIRMED,
    learnerNote: 'General English conversation practice.',
  },
  {
    learnerIndex: 4,
    tutorIndex: 4,
    daysAhead: 11,
    startHour: 12,
    durationMinutes: 60,
    paymentStatus: PaymentStatus.PAID,
    bookingStatus: BookingStatus.CONFIRMED,
    learnerNote: 'Arabic literature review session.',
  },
];

function createFutureDate(daysAhead: number, hour: number, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function upsertUser(seed: {
  name: string;
  email: string;
  role: UserRole;
}) {
  const password = await hashPassword(seedPassword);

  return UserModel.findOneAndUpdate(
    { email: seed.email },
    {
      $set: {
        name: seed.name,
        email: seed.email,
        role: seed.role,
        isEmailVerified: true,
        isActive: true,
      },
      $setOnInsert: {
        password,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );
}

async function seedLearners() {
  return Promise.all(
    learnerSeeds.map((seed) =>
      upsertUser({
        name: seed.name,
        email: seed.email,
        role: UserRole.LEARNER,
      }),
    ),
  );
}

async function seedTutors() {
  const seededTutors: Array<{
    user: mongoose.Document;
    profileId: mongoose.Types.ObjectId;
    subjects: mongoose.Document[];
  }> = [];

  for (const tutorSeed of tutorSeeds) {
    const tutor = await upsertUser({
      name: tutorSeed.name,
      email: tutorSeed.email,
      role: UserRole.TUTOR,
    });

    const tutorProfile = await TutorProfileModel.findOneAndUpdate(
      { userId: tutor._id },
      {
        $set: {
          userId: tutor._id,
          headline: tutorSeed.headline,
          bio: tutorSeed.bio,
          hourlyRate: tutorSeed.hourlyRate,
          languages: tutorSeed.languages,
          experience: [
            {
              title: 'Private Tutor',
              startYear: 2020,
              startMonth: 1,
              isCurrent: true,
            },
          ],
          education: [
            {
              degree: 'Bachelor',
              field: 'Education',
              institution: 'Mentora Demo University',
              graduationYear: 2019,
            },
          ],
          isAvailable: true,
          rating: tutorSeed.rating,
          totalReviews: tutorSeed.totalReviews,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    await UserModel.findByIdAndUpdate(tutor._id, { role: UserRole.TUTOR });

    const subjects = await TutorSubjectModel.insertMany(
      tutorSeed.subjects.map((subject) => ({ tutorId: tutor._id, ...subject })),
      { ordered: true },
    );

    await TutorAvailabilityModel.findOneAndUpdate(
      { tutorId: tutor._id },
      {
        $set: {
          tutorId: tutor._id,
          slots: tutorSeed.slots,
          timezone: tutorSeed.timezone,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    seededTutors.push({ user: tutor, profileId: tutorProfile._id, subjects });
  }

  return seededTutors;
}

async function seedBookings(
  learners: mongoose.Document[],
  tutors: Array<{
    user: mongoose.Document;
    profileId: mongoose.Types.ObjectId;
    subjects: mongoose.Document[];
  }>,
) {
  await Promise.all(
    bookingSeeds.map(async (bookingSeed) => {
      const learner = learners[bookingSeed.learnerIndex];
      const tutor = tutors[bookingSeed.tutorIndex];
      const subject = tutor.subjects[0];

      if (!learner || !tutor || !subject) {
        return;
      }

      const startAt = createFutureDate(
        bookingSeed.daysAhead,
        bookingSeed.startHour,
      );
      const endAt = new Date(
        startAt.getTime() + bookingSeed.durationMinutes * 60 * 1000,
      );

      await Booking.create({
        learnerId: learner._id,
        tutorId: tutor.user._id,
        tutorProfileId: tutor.profileId,
        subjectId: subject._id,
        startAt,
        endAt,
        durationMinutes: bookingSeed.durationMinutes,
        price: Math.max(
          (bookingSeed.durationMinutes / 60) *
            tutorSeeds[bookingSeed.tutorIndex].hourlyRate,
          1,
        ),
        currency: 'EGP',
        bookingStatus: bookingSeed.bookingStatus,
        paymentStatus: bookingSeed.paymentStatus,
        learnerNote: bookingSeed.learnerNote,
      });
    }),
  );
}

async function run() {
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.ALLOW_PROD_SEED !== 'true'
  ) {
    throw new Error('Refusing to seed production without ALLOW_PROD_SEED=true');
  }

  await mongoose.connect(env.MONGO_URI);

  const learners = await seedLearners();
  const tutors = await seedTutors();
  await seedBookings(learners, tutors);

  console.log('Tutor seed completed');
  console.log(
    `Learners: ${learners.map((learner) => learner.email).join(', ')}`,
  );
  console.log(
    `Tutors: ${tutors.map((tutor) => (tutor.user as any).email).join(', ')}`,
  );

  await mongoose.disconnect();
}

run().catch(async (error: unknown) => {
  console.error('Tutor seed failed', error);
  await mongoose.disconnect();
  process.exit(1);
});
