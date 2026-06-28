import { Star } from "lucide-react";

interface StarsProps {
  value: number;
  size?: string;
}

export function Stars({ value, size = "h-4 w-4" }: StarsProps) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${value} of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${size} ${
            i < value
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </span>
  );
}