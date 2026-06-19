import {  Edit, Trash2 } from "lucide-react";

export default function CourseCard({
  title,
  rate,
  tag,
  idPrefix,
}: {
  title: string;
  rate: string;
  tag: string;
  idPrefix: string;
}) {
  const titleId = `${idPrefix}-course-title`;
  const rateId = `${idPrefix}-hourly-rate`;
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
        <div>
          <label
            htmlFor={rateId}
            className="text-xs text-muted-foreground uppercase font-bold"
          >
            Hourly Rate
          </label>
          <div className="flex items-center gap-1 text-primary font-bold text-xl">
            <span>$</span>
            <input
              id={rateId}
              defaultValue={rate}
              className="w-14 bg-transparent outline-none"
            />
            <span className="text-sm text-muted-foreground">/hr</span>
          </div>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-muted border text-muted-foreground">
          {tag}
        </span>
      </div>
    </div>
  );
}