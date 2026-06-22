import {  Edit, Trash2 } from "lucide-react";

export default function CourseCard({
  title,
  tag,
  idPrefix,
}: {
  title: string;
  tag: string;
  idPrefix: string;
}) {
  const titleId = `${idPrefix}-course-title`;
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4 group relative">

      {/* Actions */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
         <button aria-label="Edit course" className="p-2 rounded-full bg-background border hover:text-primary">
          <Edit className="w-4 h-4" />
        </button>
        <button aria-label="Delete course" className="p-2 rounded-full bg-background border hover:text-red-500">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div>
        <label
          htmlFor={titleId}
          className="text-xs text-muted-foreground uppercase font-bold"
        >
          Course Title
        </label>

        <input
          id={titleId}
          defaultValue={title}
          className="w-full text-lg font-bold bg-transparent outline-none"
        />
      </div>

      <div className="flex justify-between items-end">

        <span className="text-xs px-3 py-1 rounded-full bg-muted border text-muted-foreground">
          {tag}
        </span>
      </div>
    </div>
  );
}