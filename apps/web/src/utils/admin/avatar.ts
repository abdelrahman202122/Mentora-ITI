
const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-600",
  "bg-rose-100 text-rose-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
  "bg-sky-100 text-sky-600",
  "bg-purple-100 text-purple-600",
  "bg-teal-100 text-teal-600",
  "bg-pink-100 text-pink-600",
];

/**
 * Generates initials from a full name.
 * Strips common academic prefixes like "Dr." and "Prof."
 */
export function avatarInitials(name: string): string {
  return name
    .replace(/^(Dr\.|Prof\.)\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Deterministic color class based on a seed string (e.g. user ID).
 */
export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
