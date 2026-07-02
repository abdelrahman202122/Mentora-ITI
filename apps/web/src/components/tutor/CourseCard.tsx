// "use client";

// import { useState } from "react";
// import { Edit, Trash2, GraduationCap, Calendar, Layers, Loader2, AlertTriangle } from "lucide-react";
// import { useLocale } from "next-intl";
// import { TutorSubject } from "@/types/tutor/tutor-subject";
// import { formatDate } from "@/utils/tutor/formateDate";
// import { useDeleteTutorSubject } from "@/hooks/tutor/useDeleteSubject";
// import { useCurrentUser } from '@/hooks/auth/use-auth';

// export default function CourseCard({ course,
//     onEdit,

//  }: { course: TutorSubject,
//       onEdit?: (id: string) => void;

//   }) {
//   const user = useCurrentUser()
//   const locale = useLocale() as "ar" | "en";
//   const deleteSubject = useDeleteTutorSubject(user.data?.id);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const isOwner = user.data?.id === course.tutorId;

//   const  handleDelete = async () => {
//     // await deleteTutorSubject(course._id);
//     deleteSubject.mutate(course._id, {
//       onSuccess: () => setShowConfirm(false),
//       onError: () => setShowConfirm(false),
//     });
//   };

//   return (
//     <div className={`bg-card border rounded-2xl p-5 flex flex-col gap-4 relative hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${
//       showConfirm ? "border-red-300" : "border-border"
//     }`}>

//       {/* Actions */}
//     {isOwner && (

//       <div className="absolute top-4 right-4 flex items-center gap-2">
//         <button
//           type="button"
//           aria-label="Edit subject"
//           disabled={showConfirm}
//           onClick={() => onEdit?.(course._id)}
//           className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-primary/10 transition disabled:opacity-40"
//         >
//           <Edit className="w-4 h-4 text-primary" />
//         </button>
//         <button
//           type="button"
//           aria-label="Delete subject"
//           onClick={() => setShowConfirm(true)}
//           disabled={showConfirm || deleteSubject.isPending}
//           className="h-8 w-8 rounded-lg border border-red-200 flex items-center justify-center hover:bg-red-50 transition disabled:opacity-40"
//         >
//           <Trash2 className="w-4 h-4 text-red-500" />
//         </button>
//       </div>
// )}

//       {/* Category */}
//       <span className={`self-start text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 transition-all ${
//         showConfirm ? "opacity-40 blur-[1px]" : ""
//       }`}>
//         {course.category[locale]}
//       </span>

//       {/* Title + Description */}
//       <div className={`pr-16 transition-all ${showConfirm ? "opacity-40 blur-[1px]" : ""}`}>
//         <h3 className="text-lg font-semibold text-foreground mb-1">{course.title}</h3>
//         <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{course.description}</p>
//       </div>

//       <div className="border-t border-border" />

//       {/* Confirmation Panel */}
//       {showConfirm ? (
//         <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col gap-3">
//           <div className="flex items-center gap-2">
//             <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
//             <p className="text-sm font-medium text-red-700">Delete this subject?</p>
//           </div>
//           <p className="text-xs text-red-500">This action cannot be undone.</p>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setShowConfirm(false)}
//               disabled={deleteSubject.isPending}
//               className="flex-1 py-1.5 text-sm rounded-lg border border-border bg-white hover:bg-muted transition disabled:opacity-50"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleDelete}
//               disabled={deleteSubject.isPending}
//               className="flex-1 py-1.5 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
//             >
//               {deleteSubject.isPending ? (
//                 <Loader2 className="w-3.5 h-3.5 animate-spin" />
//               ) : null}
//               Delete
//             </button>
//           </div>
//         </div>
//       ) : (
//         /* Meta Info */
//         <div className="grid grid-cols-2 gap-3">
//           <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3">
//             <GraduationCap className="w-4 h-4 mt-1 text-primary shrink-0" />
//             <div>
//               <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">Level</p>
//               <p className="text-sm font-medium">{course.educationLevel[locale]}</p>
//             </div>
//           </div>
//           <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3">
//             <Layers className="w-4 h-4 mt-1 text-primary shrink-0" />
//             <div>
//               <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">Curriculum</p>
//               <p className="text-sm font-medium">{course.curriculum[locale]}</p>
//             </div>
//           </div>
//           <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3 col-span-2">
//             <Calendar className="w-4 h-4 mt-1 text-primary shrink-0" />
//             <div>
//               <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">Created</p>
//               <p className="text-sm font-medium">{formatDate(course.createdAt, locale)}</p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { Edit, Trash2, GraduationCap, Calendar, Layers, Loader2, AlertTriangle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { TutorSubject } from "@/types/tutor/tutor-subject";
import { formatDate } from "@/utils/tutor/formateDate";
import { useDeleteTutorSubject } from "@/hooks/tutor/useDeleteSubject";
import { useCurrentUser } from '@/hooks/auth/use-auth';

export default function CourseCard({ course,
  onEdit,
}: { course: TutorSubject,
  onEdit?: (id: string) => void;
}) {
  const t = useTranslations('courseCard');
  const user = useCurrentUser()
  const locale = useLocale() as "ar" | "en";
  const deleteSubject = useDeleteTutorSubject(user.data?.id);
  const [showConfirm, setShowConfirm] = useState(false);
  const isOwner = user.data?.id === course.tutorId;

  const handleDelete = async () => {
    deleteSubject.mutate(course._id, {
      onSuccess: () => setShowConfirm(false),
      onError: () => setShowConfirm(false),
    });
  };

  return (
    <div className={`bg-card border rounded-2xl p-5 flex flex-col gap-4 relative hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${
      showConfirm ? "border-red-300" : "border-border"
    }`}>

      {/* Actions */}
      {isOwner && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            type="button"
            aria-label={t('editSubject')}
            disabled={showConfirm}
            onClick={() => onEdit?.(course._id)}
            className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-primary/10 transition disabled:opacity-40"
          >
            <Edit className="w-4 h-4 text-primary" />
          </button>
          <button
            type="button"
            aria-label={t('deleteSubject')}
            onClick={() => setShowConfirm(true)}
            disabled={showConfirm || deleteSubject.isPending}
            className="h-8 w-8 rounded-lg border border-red-200 flex items-center justify-center hover:bg-red-50 transition disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      {/* Category */}
      <span className={`self-start text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 transition-all ${
        showConfirm ? "opacity-40 blur-[1px]" : ""
      }`}>
        {course.category[locale]}
      </span>

      {/* Title + Description */}
      <div className={`pr-16 transition-all ${showConfirm ? "opacity-40 blur-[1px]" : ""}`}>
        <h3 className="text-lg font-semibold text-foreground mb-1">{course.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{course.description}</p>
      </div>

      <div className="border-t border-border" />

      {/* Confirmation Panel */}
      {showConfirm ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm font-medium text-red-700">{t('deleteConfirmTitle')}</p>
          </div>
          <p className="text-xs text-red-500">{t('deleteConfirmDescription')}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={deleteSubject.isPending}
              className="flex-1 py-1.5 text-sm rounded-lg border border-border bg-white hover:bg-muted transition disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteSubject.isPending}
              className="flex-1 py-1.5 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {deleteSubject.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : null}
              {t('delete')}
            </button>
          </div>
        </div>
      ) : (
        /* Meta Info */
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3">
            <GraduationCap className="w-4 h-4 mt-1 text-primary shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">{t('level')}</p>
              <p className="text-sm font-medium">{course.educationLevel[locale]}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3">
            <Layers className="w-4 h-4 mt-1 text-primary shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">{t('curriculum')}</p>
              <p className="text-sm font-medium">{course.curriculum[locale]}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3 col-span-2">
            <Calendar className="w-4 h-4 mt-1 text-primary shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">{t('created')}</p>
              <p className="text-sm font-medium">{formatDate(course.createdAt, locale)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}