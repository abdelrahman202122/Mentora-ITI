import { UserRole, type AuthPayload } from './user.interface.js';

type RoleLike = {
  role?: UserRole | string | null;
  roles?: Array<UserRole | string> | null;
};

const rolePriority: UserRole[] = [
  UserRole.ADMIN,
  UserRole.TUTOR,
  UserRole.LEARNER,
];

function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === 'string' &&
    Object.values(UserRole).includes(value as UserRole)
  );
}

function rolesFromLegacyRole(role: unknown): UserRole[] {
  if (!isUserRole(role)) {
    return [UserRole.LEARNER];
  }

  if (role === UserRole.TUTOR) {
    return [UserRole.LEARNER, UserRole.TUTOR];
  }

  return [role];
}

export function normalizeRoles(value: RoleLike | AuthPayload | null | undefined): UserRole[] {
  const rawRoles = Array.isArray(value?.roles) ? value.roles : [];
  const roles = rawRoles.filter(isUserRole);

  if (roles.length === 0) {
    roles.push(...rolesFromLegacyRole(value?.role));
  }

  return Array.from(new Set(roles));
}

export function getPrimaryRole(roles: Array<UserRole | string>): UserRole {
  const normalizedRoles = normalizeRoles({ roles });
  return (
    rolePriority.find((role) => normalizedRoles.includes(role)) ??
    UserRole.LEARNER
  );
}

export function hasRole(
  value: RoleLike | AuthPayload | null | undefined,
  role: UserRole | string,
): boolean {
  return normalizeRoles(value).includes(role as UserRole);
}

export function hasAnyRole(
  value: RoleLike | AuthPayload | null | undefined,
  roles: Array<UserRole | string>,
): boolean {
  const normalizedRoles = normalizeRoles(value);
  return roles.some((role) => normalizedRoles.includes(role as UserRole));
}
