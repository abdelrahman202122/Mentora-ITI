import jwt, { type SignOptions } from 'jsonwebtoken';
import {
  type UserRole,
} from '../modules/users/user.interface.js';
import {
  getPrimaryRole,
  normalizeRoles,
} from '../modules/users/role.utils.js';

export const generateAccessToken = (
  userId: string,
  rolesOrRole: UserRole[] | UserRole | string,
): string => {
  const options: SignOptions = {
    expiresIn: '15m',
  };
  const roles = normalizeRoles({
    roles: Array.isArray(rolesOrRole) ? rolesOrRole : undefined,
    role: Array.isArray(rolesOrRole) ? undefined : rolesOrRole,
  });

  return jwt.sign(
    { userId, role: getPrimaryRole(roles), roles },
    process.env.JWT_ACCESS_SECRET!,
    options
  );
};

export const generateRefreshToken = (
  userId: string
): string => {
  const options: SignOptions = {
    expiresIn: '7d',
  };

  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET!,
    options
  );
};

export const verifyAccessToken = (
  token: string
) => {
  return jwt.verify(
    token,
    process.env.JWT_ACCESS_SECRET!
  );
};

export const verifyRefreshToken = (
  token: string
) => {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET!
  );
};
