export type StarType = "full" | "half" | "empty";

export function getStarType(rating: number, index: number): StarType {
  const diff = rating - index; // index is 0-based star position
  if (diff >= 1) return "full";
  if (diff >= 0.5) return "half";
  return "empty";
}