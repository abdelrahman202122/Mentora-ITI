"use client";

import { useState, useEffect } from "react";
import { Star, User, BookOpen, CheckCircle2, RefreshCcw, ChevronDown, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurricula } from "@/hooks/metadata/useCurricula";
import { useEducationLevels } from "@/hooks/metadata/useEducationLevels";
import { useSubjectCategories } from "@/hooks/metadata/useSubjectCategories";

interface ResultsStepProps {
    curriculum: string | null;
    level: string | null;
    subject: string | null;
    onReset: () => void;
    onEditStep: (stepNumber: number) => void;
    setCurriculum: (value: string | null) => void;
    setLevel: (value: string | null) => void;
    setSubject: (value: string | null) => void;
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

const MOCK_TUTORS: MockTutor[] = [
    {
        id: "t1",
        name: "Dr. Mona Hassan",
        title: "PhD in Pure Mathematics",
        bio: "Passionate mathematician with 8+ years of experience helping students master Algebra, Calculus, and general mathematics. Specializes in GCSE and high school curriculum.",
        subjects: ["Mathematics", "Algebra", "Calculus"],
        levels: ["secondary", "university"],
        curricula: ["british", "national_new", "national_old"],
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
        levels: ["preparatory", "secondary", "university"],
        curricula: ["american", "ib", "igcse"],
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
        curricula: ["british", "american", "igcse"],
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
        levels: ["primary", "preparatory", "secondary"],
        curricula: ["ib", "igcse", "british"],
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
        levels: ["preparatory", "secondary"],
        curricula: ["american", "national_new", "national_old"],
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
    setCurriculum,
    setLevel,
    setSubject,
}: ResultsStepProps) {
    const [filteredTutors, setFilteredTutors] = useState<MockTutor[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [bookingTutorName, setBookingTutorName] = useState<string | null>(null);
    const [openDropdown, setOpenDropdown] = useState<"curriculum" | "level" | "subject" | null>(null);

    // Fetch metadata lists for drop-down selections
    const { data: curricula } = useCurricula();
    const { data: levels } = useEducationLevels();
    const { data: categories } = useSubjectCategories();

    // Find English label for selected values
    const getCurriculumLabel = () => {
        if (!curriculum) return "All Curricula";
        return curricula?.find((c) => c.value === curriculum)?.en ?? curriculum;
    };

    const getLevelLabel = () => {
        if (!level) return "All Levels";
        return levels?.find((l) => l.value === level)?.en ?? level;
    };

    const getSubjectLabel = () => {
        if (!subject) return "All Subjects";
        return categories?.find((cat) => cat.value === subject)?.en ?? subject;
    };

    const handleReset = () => {
        setSearchQuery("");
        onReset();
    };

    useEffect(() => {
        // Advanced filtering engine matching selections and search query
        const results = MOCK_TUTORS.filter((tutor) => {
            // 1. Filter by Curriculum
            if (curriculum) {
                const matchesCurriculum = tutor.curricula.some(
                    (c) => c.toLowerCase() === curriculum.toLowerCase()
                );
                if (!matchesCurriculum) return false;
            }

            // 2. Filter by Level
            if (level) {
                const matchesLevel = tutor.levels.some(
                    (l) => l.toLowerCase() === level.toLowerCase()
                );
                if (!matchesLevel) return false;
            }

            // 3. Filter by Subject Category
            if (subject) {
                const subLower = subject.toLowerCase();
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

            // 4. Filter by Search Query (Name, Title, Bio, Subjects)
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const matchesQuery =
                    tutor.name.toLowerCase().includes(query) ||
                    tutor.title.toLowerCase().includes(query) ||
                    tutor.bio.toLowerCase().includes(query) ||
                    tutor.subjects.some((s) => s.toLowerCase().includes(query));

                if (!matchesQuery) return false;
            }

            return true;
        });

        setFilteredTutors(results);
    }, [curriculum, level, subject, searchQuery]);

    const handleBookSession = (tutorName: string) => {
        setBookingTutorName(tutorName);
        setTimeout(() => setBookingTutorName(null), 3000);
    };

    return (
        <div className="space-y-6">
            {/* Click-away backdrop for active dropdowns */}
            {openDropdown && (
                <div
                    className="fixed inset-0 z-20 cursor-default"
                    onClick={() => setOpenDropdown(null)}
                />
            )}

            {/* Interactive Free Filter Bar */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 md:p-5 space-y-4 relative z-30">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800">Filter Tutors Instantly</h3>
                    <button
                        onClick={handleReset}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors"
                    >
                        <RefreshCcw className="size-3" />
                        Reset All
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, subject, or bio keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 rounded-xl text-xs font-semibold text-slate-750 placeholder:text-slate-400 outline-none transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2.5 md:flex-shrink-0">
                        {/* 1. Curriculum Filter */}
                        <div className="relative">
                            <button
                                onClick={() => setOpenDropdown(openDropdown === "curriculum" ? null : "curriculum")}
                                type="button"
                                className={`flex items-center gap-2 px-4 py-2.5 bg-white border rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition-all cursor-pointer ${curriculum
                                        ? "border-indigo-500 bg-indigo-50/20 text-indigo-700 ring-1 ring-indigo-500/10"
                                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                                    }`}
                            >
                                <span className={curriculum ? "text-indigo-600/70" : "text-slate-400"}>Curriculum:</span>
                                <span className="font-bold">{getCurriculumLabel()}</span>
                                <ChevronDown className={`size-3.5 transition-transform duration-200 ${curriculum ? "text-indigo-600" : "text-slate-400"} ${openDropdown === "curriculum" ? "rotate-180" : ""}`} />
                            </button>

                            {openDropdown === "curriculum" && (
                                <div className="absolute right-0 md:left-0 mt-2 w-56 bg-white border border-slate-150 rounded-xl shadow-xl py-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <button
                                        onClick={() => {
                                            setCurriculum(null);
                                            setOpenDropdown(null);
                                        }}
                                        type="button"
                                        className="flex items-center justify-between w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left font-semibold transition-colors"
                                    >
                                        <span>All Curricula</span>
                                        {!curriculum && <Check className="size-3 text-indigo-600 stroke-[3]" />}
                                    </button>
                                    <div className="h-px bg-slate-100 my-1" />
                                    {curricula?.map((c) => (
                                        <button
                                            key={c.value}
                                            onClick={() => {
                                                setCurriculum(c.value);
                                                setOpenDropdown(null);
                                            }}
                                            type="button"
                                            className="flex items-center justify-between w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left font-medium transition-colors"
                                        >
                                            <span>{c.en}</span>
                                            {curriculum === c.value && <Check className="size-3 text-indigo-600 stroke-[3]" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 2. Level Filter */}
                        <div className="relative">
                            <button
                                onClick={() => setOpenDropdown(openDropdown === "level" ? null : "level")}
                                type="button"
                                className={`flex items-center gap-2 px-4 py-2.5 bg-white border rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition-all cursor-pointer ${level
                                        ? "border-indigo-500 bg-indigo-50/20 text-indigo-700 ring-1 ring-indigo-500/10"
                                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                                    }`}
                            >
                                <span className={level ? "text-indigo-600/70" : "text-slate-400"}>Level:</span>
                                <span className="font-bold">{getLevelLabel()}</span>
                                <ChevronDown className={`size-3.5 transition-transform duration-200 ${level ? "text-indigo-600" : "text-slate-400"} ${openDropdown === "level" ? "rotate-180" : ""}`} />
                            </button>

                            {openDropdown === "level" && (
                                <div className="absolute right-0 md:left-0 mt-2 w-56 bg-white border border-slate-150 rounded-xl shadow-xl py-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <button
                                        onClick={() => {
                                            setLevel(null);
                                            setOpenDropdown(null);
                                        }}
                                        type="button"
                                        className="flex items-center justify-between w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left font-semibold transition-colors"
                                    >
                                        <span>All Levels</span>
                                        {!level && <Check className="size-3 text-indigo-600 stroke-[3]" />}
                                    </button>
                                    <div className="h-px bg-slate-100 my-1" />
                                    {levels?.map((l) => (
                                        <button
                                            key={l.value}
                                            onClick={() => {
                                                setLevel(l.value);
                                                setOpenDropdown(null);
                                            }}
                                            type="button"
                                            className="flex items-center justify-between w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left font-medium transition-colors"
                                        >
                                            <span>{l.en}</span>
                                            {level === l.value && <Check className="size-3 text-indigo-600 stroke-[3]" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 3. Subject Filter */}
                        <div className="relative">
                            <button
                                onClick={() => setOpenDropdown(openDropdown === "subject" ? null : "subject")}
                                type="button"
                                className={`flex items-center gap-2 px-4 py-2.5 bg-white border rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition-all cursor-pointer ${subject
                                        ? "border-indigo-500 bg-indigo-50/20 text-indigo-700 ring-1 ring-indigo-500/10"
                                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                                    }`}
                            >
                                <span className={subject ? "text-indigo-600/70" : "text-slate-400"}>Subject:</span>
                                <span className="font-bold">{getSubjectLabel()}</span>
                                <ChevronDown className={`size-3.5 transition-transform duration-200 ${subject ? "text-indigo-600" : "text-slate-400"} ${openDropdown === "subject" ? "rotate-180" : ""}`} />
                            </button>

                            {openDropdown === "subject" && (
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-150 rounded-xl shadow-xl py-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <button
                                        onClick={() => {
                                            setSubject(null);
                                            setOpenDropdown(null);
                                        }}
                                        type="button"
                                        className="flex items-center justify-between w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left font-semibold transition-colors"
                                    >
                                        <span>All Subjects</span>
                                        {!subject && <Check className="size-3 text-indigo-600 stroke-[3]" />}
                                    </button>
                                    <div className="h-px bg-slate-100 my-1" />
                                    {categories?.map((cat) => (
                                        <button
                                            key={cat.value}
                                            onClick={() => {
                                                setSubject(cat.value);
                                                setOpenDropdown(null);
                                            }}
                                            type="button"
                                            className="flex items-center justify-between w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left font-medium transition-colors"
                                        >
                                            <span>{cat.en}</span>
                                            {subject === cat.value && <Check className="size-3 text-indigo-600 stroke-[3]" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
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
            <div className="relative z-10">
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
                        <Button onClick={handleReset} variant="outline" className="text-indigo-600 border-indigo-600 hover:bg-indigo-50 cursor-pointer">
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
