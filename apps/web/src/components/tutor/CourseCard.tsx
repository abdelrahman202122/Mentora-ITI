
import { Edit, Trash2, GraduationCap, Calendar, Layers } from "lucide-react";
import { TutorSubject } from "@/types/tutor/tutor-subject";
import { formatDate } from "@/utils/tutor/formateDate";
import { useLocale } from "next-intl";
export default function CourseCard({

  course,
}: {
  course: TutorSubject ;
}) {
  const locale = useLocale() as "ar" | "en";
const level = course.gradeNote || course.educationLevel;
  const category = course.category.charAt(0).toUpperCase() + course.category.slice(1);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 group relative hover:shadow-sm transition-shadow">

      {/* Category badge — primary color at low opacity */}
      <span className="self-start text-xs font-semibold px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
        {category}
      </span>

      {/* Title + description */}
      <div className="space-y-1 pr-14">
        <h3 className="text-base font-semibold text-foreground leading-snug">
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {course.description}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-3">

        <div className="flex items-start gap-2">
          <GraduationCap className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">Level</p>
            <p className="text-sm text-foreground font-medium">{level}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Layers className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">Curriculum</p>
            <p className="text-sm text-foreground font-medium">{course.curriculum}</p>
          </div>
        </div>

        <div className="flex items-start gap-2 col-span-2">
          <Calendar className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">Created</p>
            <p className="text-sm text-foreground font-medium">{formatDate(course.createdAt , locale)}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

