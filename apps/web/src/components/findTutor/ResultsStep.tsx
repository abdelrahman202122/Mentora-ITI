"use client";

import { useState, useMemo } from "react";
import { Search, RefreshCcw, User, Star } from "lucide-react";
import { TutorCard } from "./TutorCard";

interface MockTutor {
  id: number;
  name: string;
  title: string;
  bio: string;
  subjects: string[];
  levels: string[];
  curricula: string[];
  hourlyRate: number;
  currency: string;
  avatarGradient: string;
  rating: number;
  totalReviews: number;
}

const STATIC_TUTORS: MockTutor[] = [
  {
    id: 1,
    name: "Dr. Mona Hassan",
    title: "Mathematics Professor & Researcher",
    bio: "Helping high school and university students master Algebra, Calculus, and Statistics. Specializes in simplified math proofs and test preparation.",
    subjects: ["Mathematics", "Algebra", "Calculus"],
    levels: ["secondary", "university"],
    curricula: ["british", "national"],
    hourlyRate: 250,
    currency: "EGP",
    avatarGradient: "from-blue-500 to-indigo-600",
    rating: 4.8,
    totalReviews: 34,
  },
  {
    id: 2,
    name: "Sarah Jenkins",
    title: "Software Engineer & Coding Tutor",
    bio: "Teaching Python, JavaScript, and Computer Science fundamentals. Interactive lessons with practical coding projects suitable for all levels.",
    subjects: ["Computer Science", "Programming"],
    levels: ["preparatory", "secondary", "university"],
    curricula: ["american", "international"],
    hourlyRate: 400,
    currency: "EGP",
    avatarGradient: "from-emerald-400 to-teal-600",
    rating: 4.9,
    totalReviews: 57,
  },
  {
    id: 3,
    name: "Marcus Thorne",
    title: "Senior Physics & Chemistry Educator",
    bio: "Simplifying thermodynamics, mechanics, and organic chemistry. Dedicated to making science intuitive and fun through visual models.",
    subjects: ["Physics", "Chemistry", "Science"],
    levels: ["secondary", "university"],
    curricula: ["british", "american"],
    hourlyRate: 350,
    currency: "EGP",
    avatarGradient: "from-rose-400 to-pink-600",
    rating: 4.7,
    totalReviews: 28,
  },
  {
    id: 4,
    name: "Elena Rodriguez",
    title: "Bilingual Language & Literature Instructor",
    bio: "Native Spanish and English speaker focusing on conversational fluency, creative writing, and Cambridge English exam preparation.",
    subjects: ["English", "Spanish", "Languages"],
    levels: ["primary", "preparatory", "secondary"],
    curricula: ["international", "british"],
    hourlyRate: 300,
    currency: "EGP",
    avatarGradient: "from-amber-400 to-orange-500",
    rating: 5.0,
    totalReviews: 42,
  },
  {
    id: 5,
    name: "David Chen",
    title: "High School Biology Specialist",
    bio: "Passionate about genetics, anatomy, and environmental science. Experienced in national and international curriculum delivery.",
    subjects: ["Biology", "Science"],
    levels: ["primary", "preparatory", "secondary"],
    curricula: ["national", "american"],
    hourlyRate: 280,
    currency: "EGP",
    avatarGradient: "from-purple-500 to-fuchsia-600",
    rating: 4.6,
    totalReviews: 19,
  }
];

interface ResultsStepProps {
  curriculum: string | null;
  level: string | null;
  subject: string | null;
  onReset: () => void;
  onEditStep?: (stepNumber: number) => void;
  setCurriculum?: (value: string | null) => void;
  setLevel?: (value: string | null) => void;
  setSubject?: (value: string | null) => void;
}

export default function ResultsStep({
  curriculum,
  level,
  subject,
  onReset,
  setCurriculum,
  setLevel,
  setSubject,
}: ResultsStepProps) {
  // Static state filters initialized with the selections from the previous steps
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCurriculum, setSelectedCurriculum] = useState(curriculum || "");
  const [selectedLevel, setSelectedLevel] = useState(level || "");
  const [selectedSubject, setSelectedSubject] = useState(subject || "");
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  // Filter logic
  const filteredTutors = useMemo(() => {
    return STATIC_TUTORS.filter((tutor) => {
      // 1. Text Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          tutor.name.toLowerCase().includes(query) ||
          tutor.title.toLowerCase().includes(query) ||
          tutor.bio.toLowerCase().includes(query) ||
          tutor.subjects.some((sub) => sub.toLowerCase().includes(query));
        if (!matchesQuery) return false;
      }

      // 2. Curriculum Filter
      if (selectedCurriculum) {
        const matchesCurriculum = tutor.curricula.includes(selectedCurriculum.toLowerCase());
        if (!matchesCurriculum) return false;
      }

      // 3. Level Filter
      if (selectedLevel) {
        const matchesLevel = tutor.levels.includes(selectedLevel.toLowerCase());
        if (!matchesLevel) return false;
      }

      // 4. Subject Filter
      if (selectedSubject) {
        const querySub = selectedSubject.toLowerCase();
        const matchesSubject = tutor.subjects.some((sub) => {
          const sLower = sub.toLowerCase();
          if (querySub === "math" && (sLower.includes("math") || sLower.includes("calculus") || sLower.includes("algebra"))) return true;
          if (querySub === "science" && (sLower.includes("science") || sLower.includes("phys") || sLower.includes("chem") || sLower.includes("bio"))) return true;
          if (querySub === "languages" && (sLower.includes("english") || sLower.includes("spanish"))) return true;
          return sLower.includes(querySub);
        });
        if (!matchesSubject) return false;
      }

      return true;
    });
  }, [searchQuery, selectedCurriculum, selectedLevel, selectedSubject]);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCurriculum("");
    setSelectedLevel("");
    setSelectedSubject("");
    setCurriculum?.(null);
   setLevel?.(null);
  setSubject?.(null);
  };

  const handleBook = (name: string) => {
    setBookingMessage(`Booking request sent successfully to ${name}!`);
    setTimeout(() => setBookingMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Toast Message */}
      {bookingMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-semibold shadow-sm transition-all animate-in fade-in slide-in-from-top-4 duration-300">
          {bookingMessage}
        </div>
      )}

      {/* Static Interactive Filter Bar */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 md:p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Static Filter Sandbox</h3>
          <button
            onClick={handleReset}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCcw className="size-3" />
            Reset Filters
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, title, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 rounded-xl text-xs font-semibold text-slate-700 placeholder:text-slate-400 outline-none transition-all shadow-sm"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap gap-2.5 md:flex-shrink-0">
            {/* Curriculum Filter */}
            <select
              value={selectedCurriculum}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedCurriculum(val);
                setCurriculum?.(val || null);
              }}
              className="px-4 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 rounded-xl text-xs font-semibold text-slate-700 outline-none transition-all shadow-sm cursor-pointer"
            >
              <option value="">All Curricula</option>
              <option value="british">British System</option>
              <option value="american">American System</option>
              <option value="international">International System</option>
              <option value="national">National System</option>
            </select>

            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedLevel(val);
                setLevel?.(val || null);
              }}
              className="px-4 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 rounded-xl text-xs font-semibold text-slate-700 outline-none transition-all shadow-sm cursor-pointer"
            >
              <option value="">All Levels</option>
              <option value="primary">Primary</option>
              <option value="preparatory">Preparatory</option>
              <option value="secondary">Secondary</option>
              <option value="university">University</option>
            </select>

            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedSubject(val);
                setSubject?.(val || null);
              }}
              className="px-4 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 rounded-xl text-xs font-semibold text-slate-700 outline-none transition-all shadow-sm cursor-pointer"
            >
              <option value="">All Subjects</option>
              <option value="math">Mathematics</option>
              <option value="science">Sciences (Phys/Chem/Bio)</option>
              <option value="languages">Languages</option>
              <option value="programming">Computer Science</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tutors Listing */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">
            Matching Tutors ({filteredTutors.length})
          </h2>
        </div>

        {filteredTutors.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl p-8 space-y-4 shadow-sm">
            <div className="h-16 w-16 bg-slate-50 border border-slate-200/50 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <User className="size-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-850">No Results Found</h3>
              <p className="text-xs text-slate-550 mt-1 max-w-sm mx-auto">
                No tutors matched your selected filter criteria. Try resetting or selecting a broader filter.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs border border-indigo-100 transition-all cursor-pointer shadow-sm"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTutors.map((tutor) => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                onBook={handleBook}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}