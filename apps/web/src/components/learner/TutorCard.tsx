import Link from "next/link"
import { Star } from "lucide-react"

interface TutorCardProps {
  id: string
  name: string
  title: string
  subjects: string[]
  rating: number
}

export default function TutorCard({
  id,
  name,
  title,
  subjects,
  rating,
}: TutorCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">

      {/* Tutor Image */}
      <div className="w-full h-32 md:h-48 bg-indigo-50" />

      {/* Tutor Info */}
      <div className="p-3 md:p-4">

        {/* Name */}
        <p className="font-semibold text-gray-800 text-sm md:text-base leading-tight">
          {name}
        </p>

        {/* Title */}
        <p className="text-xs text-gray-400 mb-2 leading-tight">{title}</p>

        {/* Subjects */}
        <div className="flex flex-wrap gap-1 mb-3">
          {subjects.slice(0, 2).map((subject) => (
            <span
              key={subject}
              className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full"
            >
              {subject}
            </span>
          ))}
        </div>

        {/* Rating + Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-medium text-gray-700">{rating}</span>
          </div>
          <Link
            href={"/pages/learner/tutor-match/" + id}
            className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-700 whitespace-nowrap"
          >
            View Profile
          </Link>
        </div>

      </div>
    </div>
  )
}