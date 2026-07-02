import type { AuthUser, UserRole } from "@/types/auth/auth-types";

const rolePriority: UserRole[] = ["admin", "tutor", "learner"];

export function getUserRoles(
  user: Pick<AuthUser, "role" | "roles"> | null | undefined,
): UserRole[] {
  const roles = user?.roles?.filter(Boolean) ?? [];

  if (roles.length > 0) {
    return Array.from(new Set(roles));
  }

  if (!user?.role) {
    return [];
  }

  if (user.role === "tutor") {
    return ["learner", "tutor"];
  }

  return [user.role];
}

export function hasRole(
  user: Pick<AuthUser, "role" | "roles"> | null | undefined,
  role: UserRole,
): boolean {
  return getUserRoles(user).includes(role);
}

export function hasAnyRole(
  user: Pick<AuthUser, "role" | "roles"> | null | undefined,
  roles: readonly UserRole[],
): boolean {
  const userRoles = getUserRoles(user);
  return roles.some((role) => userRoles.includes(role));
}

export function getPrimaryRole(
  user: Pick<AuthUser, "role" | "roles"> | null | undefined,
): UserRole {
  const roles = getUserRoles(user);
  return rolePriority.find((role) => roles.includes(role)) ?? "learner";
}
