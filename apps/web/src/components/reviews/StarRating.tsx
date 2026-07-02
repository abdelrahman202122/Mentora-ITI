import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStarType } from "@/utils/reviews/reviews";

type StarRatingProps = {
  rating: number;
  size?: number;
  className?: string;
  iconClassName?: string;
};

export function StarRating({
  rating,
  size = 16,
  className,
  iconClassName,
}: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)} aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const type = getStarType(rating, index);

        if (type === "half") {
          return (
            <span key={index} className="relative inline-flex" style={{ width: size, height: size }}>
              <Star
                aria-hidden="true"
                size={size}
                className={cn("text-yellow-400", iconClassName)}
              />
              <span className="absolute inset-y-0 start-0 overflow-hidden" style={{ width: size / 2 }}>
                <Star
                  aria-hidden="true"
                  size={size}
                  className={cn("fill-yellow-400 text-yellow-400", iconClassName)}
                />
              </span>
            </span>
          );
        }

        return (
          <Star
            key={index}
            aria-hidden="true"
            size={size}
            className={cn(
              "text-yellow-400",
              type === "full" && "fill-yellow-400",
              iconClassName,
            )}
          />
        );
      })}
    </div>
  );
}
