
// import { avatarInitials, avatarColor } from "@/utils/avatar";

import { avatarColor, avatarInitials } from "@/utils/admin/avatar";

interface AvatarProps {
  name: string;
  seed: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-16 w-16 text-base",
};

export function Avatar({ name, seed, avatarUrl, size = "md" }: AvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }
  return (
    <div
      className={`flex ${sizeClasses[size]} items-center justify-center rounded-full font-semibold ${avatarColor(seed)}`}
    >
      {avatarInitials(name)}
    </div>
  );
}
