"use client";

import { useState, useEffect } from "react";
import { Star, User, BookOpen, Clock, Calendar, CheckCircle2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultsStepProps {
  curriculum: string | null;
  level: string | null;
  subject: string | null;
  onReset: () => void;
  onEditStep: (stepNumber: number) => void;
}

interface MockTutor {
  id: string;
  name: string;
  title: string;
  bio: string;
  subjects: string[];
  levels: string[];
  curricula: string[];
  rating: number;
  totalReviews: number;
  hourlyRate: number;
  currency: string;
  avatarGradient: string;
}

// Rich mock data representing tutors with diverse profiles
const MOCK_TUTORS: MockTutor[] = [
  {
    id: "t1",
    name: "Dr. Mona Hassan",
    title: "PhD in Pure Mathematics",
    bio: "Passionate mathematician with 8+ years of experience helping students master Algebra, Calculus, and general mathematics. Specializes in GCSE and high school curriculum.",
    subjects: ["Mathematics", "Algebra", "Calculus"],
    levels: ["secondary", "university"],
    curricula: ["british", "national"],
    rating: 4.8,
    totalReviews: 24,
    hourlyRate: 250,
    currency: "EGP",
    avatarGradient: "from-indigo-500 to-purple-500",
  },
  {
    id: "t2",
    name: "Dr. Sarah Jenkins",
    title: "Computer Science Professor",
    bio: "Teaching coding, AI, and computer science concepts. Extremely patient with beginners. I focus on hands-on coding exercises and building real projects.",
    subjects: ["Computer Science", "Programming", "Technology"],
    levels: ["prep", "secondary", "university"],
    curricula: ["american", "international"],
    rating: 4.9,
    totalReviews: 128,
    hourlyRate: 450,
    currency: "EGP",
    avatarGradient: "from-rose-500 to-orange-500",
  },
  {
    id: "t3",
    name: "Marcus Thorne",
    title: "Senior Physics & Chemistry Instructor",
    bio: "Let's make science fun and intuitive! I use interactive simulations, animations, and practical examples to explain complex quantum and thermodynamic theories.",
    subjects: ["Physics", "Chemistry", "Science"],
    levels: ["secondary", "university"],
    curricula: ["british", "american"],
    rating: 4.7,
    totalReviews: 95,
    hourlyRate: 350,
    currency: "EGP",
    avatarGradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "t4",
    name: "Elena Rodriguez",
    title: "Bilingual Literature & Language Coach",
    bio: "Interactive language coach focusing on conversational English and French. Native speaker experience. Tailored homework plans and exam preparation strategies.",
    subjects: ["English", "French", "Languages"],
    levels: ["primary", "prep", "secondary"],
    curricula: ["international", "british"],
    rating: 5.0,
    totalReviews: 76,
    hourlyRate: 300,
    currency: "EGP",
    avatarGradient: "from-cyan-500 to-blue-500",
  },
  {
    id: "t5",
    name: "David Chen",
    title: "High School Biology & Chemistry Specialist",
    bio: "Helping students excel in molecular biology, organic chemistry, and lab preps. I break down difficult academic modules into simple, digestible steps.",
    subjects: ["Biology", "Chemistry", "Science"],
    levels: ["prep", "secondary"],
    curricula: ["american", "national"],
    rating: 4.6,
    totalReviews: 60,
    hourlyRate: 280,
    currency: "EGP",
    avatarGradient: "from-amber-500 to-yellow-500",
  },
];

export default function ResultsStep({
  curriculum,
  level,
  subject,
  onReset,
  onEditStep,
}: ResultsStepProps) {
  const [filteredTutors, setFilteredTutors] = useState<MockTutor[]>([]);
  const [bookingTutorName, setBookingTutorName] = useState<string | null>(null);

  useEffect(() => {
    // Advanced filtering engine
    const results = MOCK_TUTORS.filter((tutor) => {
      // 1. Filter by Curriculum (if selected)
      if (curriculum) {
        const matchesCurriculum = tutor.curricula.some(
          (c) => c.toLowerCase() === curriculum.toLowerCase()
        );
        if (!matchesCurriculum) return false;
      }

      // 2. Filter by Level (if selected)
      if (level) {
        const matchesLevel = tutor.levels.some(
          (l) => l.toLowerCase() === level.toLowerCase()
        );
        if (!matchesLevel) return false;
      }

      // 3. Filter by Subject Category (if selected)
      if (subject) {
        const subLower = subject.toLowerCase();
        // Map category keyword to tutor subjects
        const matchesSubject = tutor.subjects.some((subj) => {
          const sLower = subj.toLowerCase();
          if (subLower.includes("math") && (sLower.includes("math") || sLower.includes("calculus") || sLower.includes("algebra"))) {
            return true;
          }
          if (subLower.includes("science") && (sLower.includes("science") || sLower.includes("phys") || sLower.includes("chem") || sLower.includes("bio"))) {
            return true;
          }
          if (subLower.includes("lang") && (sLower.includes("english") || sLower.includes("french") || sLower.includes("german") || sLower.includes("arab"))) {
            return true;
          }
          if (subLower.includes("tech") && (sLower.includes("comp") || sLower.includes("prog") || sLower.includes("code"))) {
            return true;
          }
          return sLower.includes(subLower) || subLower.includes(sLower);
        });
        
        if (!matchesSubject) return false;
      }

      return true;
    });

    setFilteredTutors(results);
  }, [curriculum, level, subject]);

  const handleBookSession = (tutorName: string) => {
    setBookingTutorName(tutorName);
    setTimeout(() => setBookingTutorName(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Active Filters Display */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Applied Search Filters</h3>
          <button
            onClick={onReset}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors"
          >
            <RefreshCcw className="size-3" />
            Reset All
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {curriculum && (
            <button
              onClick={() => onEditStep(1)}
              className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 text-xs font-medium rounded-lg text-slate-700 transition-all group"
            >
              <span className="text-slate-400 group-hover:text-indigo-400">Curriculum:</span>
              <span className="capitalize text-slate-900 font-semibold">{curriculum}</span>
              <span className="text-[10px] bg-slate-100 text-slate-500 rounded px-1 group-hover:bg-indigo-100 group-hover:text-indigo-700">Edit</span>
            </button>
          )}
          {level && (
            <button
              onClick={() => onEditStep(2)}
              className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 text-xs font-medium rounded-lg text-slate-700 transition-all group"
            >
              <span className="text-slate-400 group-hover:text-indigo-400">Level:</span>
              <span className="capitalize text-slate-900 font-semibold">{level}</span>
              <span className="text-[10px] bg-slate-100 text-slate-500 rounded px-1 group-hover:bg-indigo-100 group-hover:text-indigo-700">Edit</span>
            </button>
          )}
          {subject && (
            <button
              onClick={() => onEditStep(3)}
              className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 text-xs font-medium rounded-lg text-slate-700 transition-all group"
            >
              <span className="text-slate-400 group-hover:text-indigo-400">Subject:</span>
              <span className="capitalize text-slate-900 font-semibold">{subject}</span>
              <span className="text-[10px] bg-slate-100 text-slate-500 rounded px-1 group-hover:bg-indigo-100 group-hover:text-indigo-700">Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Booking Success Toast */}
      {bookingTutorName && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="size-5 text-emerald-600 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-bold">Request Sent!</span> Your demo session booking request has been sent to <span className="font-bold">{bookingTutorName}</span>. They will respond shortly.
          </div>
        </div>
      )}

      {/* Tutors Grid */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Available Mentors ({filteredTutors.length})
        </h2>

        {filteredTutors.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl p-8 space-y-4">
            <div className="h-16 w-16 bg-slate-50 border border-slate-200/50 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <User className="size-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">No Mentors Found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                We couldn't find tutors matching this exact combination. Try broadening your filters.
              </p>
            </div>
            <Button onClick={onReset} variant="outline" className="text-indigo-600 border-indigo-600 hover:bg-indigo-50">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTutors.map((tutor) => (
              <div
                key={tutor.id}
                className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row gap-5 hover:shadow-md hover:border-slate-200/80 transition-all duration-300"
              >
                {/* Avatar */}
                <div className="flex-shrink-0 flex md:flex-col items-center gap-3">
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-tr ${tutor.avatarGradient} flex items-center justify-center text-white font-bold text-xl shadow-inner`}>
                    {tutor.name
                      .split(" ")
                      .filter((n) => !n.includes("Dr."))
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-0.5 text-xs text-amber-700 font-semibold">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span>{tutor.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{tutor.name}</h3>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium border border-slate-200/30">
                        {tutor.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {tutor.bio}
                    </p>
                  </div>

                  {/* Badges / Meta */}
                  <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="size-4 text-indigo-500" />
                      <div className="flex flex-wrap gap-1">
                        {tutor.subjects.map((sub) => (
                          <span key={sub} className="bg-indigo-50/50 text-indigo-700 px-2 py-0.5 rounded-md font-medium text-[11px] border border-indigo-100/40">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="capitalize">
                        <strong className="text-slate-700">Curricula:</strong> {tutor.curricula.join(", ")}
                      </span>
                      <span className="capitalize border-l border-slate-200 pl-4">
                        <strong className="text-slate-700">Level:</strong> {tutor.levels.join(", ")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rates & Actions */}
                <div className="flex flex-row md:flex-col justify-between items-center md:items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex-shrink-0 gap-4">
                  <div className="space-y-0.5 text-left md:text-right">
                    <p className="text-xs text-slate-400">Hourly Rate</p>
                    <p className="text-2xl font-black text-slate-950">
                      {tutor.hourlyRate} <span className="text-sm font-bold text-slate-500">{tutor.currency}</span>
                    </p>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    <Button
                      onClick={() => handleBookSession(tutor.name)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex-1 md:flex-none cursor-pointer"
                    >
                      Book Session
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
