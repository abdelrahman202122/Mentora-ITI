
import { Flag, CheckCircle, Star } from "lucide-react";

type Props = {
  name: string;
  rating: number;
  date: string;
  comment: string;
  replied?: boolean;
  avatarUrl?: string;
};

export default function ReviewCard({
  name,
  rating,
  date,
  comment,
  replied,
  avatarUrl
}: Props) {
  return (
    <div className="border border-border bg-card p-6 rounded-xl hover:shadow-sm transition">
      <div className="flex justify-between mb-3">
        <div className="flex">
 {avatarUrl ? (
              <img
                src={avatarUrl}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-background"
                alt={`${name} avatar`}
              />
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold"
                aria-hidden="true"
              >
                {name.charAt(0)}
              </div>
            )}            <div>
            <p className="font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">{date}</p>
            </div>

        </div>

        {replied ? (
          <span className="flex items-center gap-1 text-xs text-primary">
            <CheckCircle size={14} />
            Replied
          </span>
        ) : (
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500">
            <Flag size={14} />
            Flag
          </button>
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            size={16}
            className={
              index < rating
                ? "fill-yellow-400 text-yellow-400"
                : " text-yellow-400"
            }
          />
        ))}
      </div>

      <p className="text-sm text-foreground/80">{comment}</p>
    </div>
  );
}