
const SUBJECT_STYLES: Record<string, string> = {
  MATH: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
  PHYSICS: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
  CHEMISTRY: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  BIOLOGY: "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200",
  ENGLISH: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  HISTORY: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
  CS: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
};

const DEFAULT_SUBJECT_STYLE = "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200";

export function SubjectChip({ subject }: { subject: string }) {
  const normalized = subject.toUpperCase();
  const style = SUBJECT_STYLES[normalized] ?? DEFAULT_SUBJECT_STYLE;
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${style}`}>
      {normalized}
    </span>
  );
}
