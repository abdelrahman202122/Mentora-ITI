import { Button } from "@/components/ui/button";

interface TutorCardProps {
    tutor: {
        avatarGradient: string;
        bio: string;
        currency: string;
        hourlyRate: number;
        name: string;
        subjects: string[];
        title: string;
    };
    onBook: (name: string) => void;
}

export const TutorCard = ({ tutor, onBook }: TutorCardProps) => {
    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row gap-5 hover:shadow-md transition-all">
            {/* Avatar */}
            <div className={`h-16 w-16 rounded-2xl bg-gradient-to-tr ${tutor.avatarGradient} flex items-center justify-center text-white font-bold text-xl`}>
                {tutor.name.split(" ").map((n: string) => n[0]).join("")}
            </div>

            {/* Main Info */}
            <div className="flex-1 space-y-2">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">{tutor.name}</h3>
                    <p className="text-xs text-slate-500">{tutor.title}</p>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{tutor.bio}</p>

                {/* Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                    {tutor.subjects.map((sub: string) => (
                        <span key={sub} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-[10px] font-medium">
                            {sub}
                        </span>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-row md:flex-col justify-between items-center md:items-end border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 gap-3">
                <div className="text-right">
                    <p className="text-2xl font-black text-slate-950">{tutor.hourlyRate} <span className="text-sm font-bold text-slate-500">{tutor.currency}</span></p>
                </div>
                <Button onClick={() => onBook(tutor.name)} className="bg-indigo-600 hover:bg-indigo-700 h-9 px-6">
                    Book Session
                </Button>
            </div>
        </div>
    );
};
