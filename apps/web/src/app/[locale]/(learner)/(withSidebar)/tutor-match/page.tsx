"use client"

import { useState, useEffect } from "react"
import { Search, ChevronDown } from "lucide-react"
import { useLocale } from "next-intl"
import { AIFinderCta } from "@/components/ai/AIFinderCta"
import TutorCard from "@/components/learner/TutorCard"
import { getTutors, type TutorSummary } from "@/services/tutor/tutor-service"
import { getLocalePath } from "@/utils/i18n/locale-path"

const filters = ["Category", "Age Group", "School System", "Rating", "Level"]
const ITEMS_PER_PAGE = 4

export default function TutorMatchPage() {
  const locale = useLocale()
  const [tutors, setTutors] = useState<TutorSummary[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    async function fetchTutors() {
      setLoading(true)
      try {
        const data = await getTutors()
        setTutors(data)
      } finally {
        setLoading(false)
      }
    }
    fetchTutors()
  }, [])

  const filtered = tutors.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentTutors = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <div>
      <div className="mb-6">
        <AIFinderCta
          href={getLocalePath(locale, "/ai-assistant")}
          title="Want a faster tutor match?"
          description="Let AI rank tutors by your subject, level, curriculum, language, and budget."
        />
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">

        {/* Search Bar */}
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 mb-4 w-full md:w-64">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by teacher..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="text-sm outline-none flex-1 bg-transparent text-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              className="flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              {filter}
              <ChevronDown size={14} />
            </button>
          ))}
        </div>

      </div>

      {/* Results Count + Sort */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-700">
          {filtered.length} Teachers found
        </p>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          Sort by:
          <span className="text-indigo-600 font-medium cursor-pointer">
            Relevance
          </span>
          <ChevronDown size={14} className="text-indigo-600" />
        </div>
      </div>

      {/* Tutor Cards */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : currentTutors.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          No teachers found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {currentTutors.map((tutor) => (
            <TutorCard
              key={tutor.id}
              id={tutor.id}
              name={tutor.name}
              title={tutor.title}
              subjects={tutor.subjects}
              rating={tutor.rating}
              locale={locale}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">

          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-lg text-sm ${
                page === currentPage
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-200 text-gray-500 hover:bg-indigo-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ›
          </button>

        </div>
      )}

    </div>
  )
}
