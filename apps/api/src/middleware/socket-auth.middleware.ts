import { type Socket } from 'socket.io';

import { type AuthPayload, UserRole } from '../modules/users/user.interface.js';
import { verifyAccessToken } from '../utils/JWT.js';

function getCookieValue(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) {
    return undefined;
  }

  for (const cookie of cookieHeader.split(';')) {
    const separatorIndex = cookie.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const cookieName = cookie.slice(0, separatorIndex).trim();

    if (cookieName === name) {
      return decodeURIComponent(cookie.slice(separatorIndex + 1).trim());
    }
  }

  return undefined;
}

function isAuthPayload(value: unknown): value is AuthPayload {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const payload = value as Partial<AuthPayload>;

  return (
    typeof payload.userId === 'string' &&
    Object.values(UserRole).includes(payload.role as UserRole)
  );
}

export function authenticateSocket(
  socket: Socket,
  next: (error?: Error) => void,
) {
  try {
    const token = getCookieValue(
      socket.handshake.headers.cookie,
      'accessToken',
    );

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = verifyAccessToken(token);

    if (!isAuthPayload(decoded)) {
      return next(new Error('Invalid access token'));
    }

    socket.data.user = {
      userId: decoded.userId,
      role: decoded.role,
    } satisfies AuthPayload;

    return next();
  } catch {
    return next(new Error('Invalid or expired access token'));
  }
}

export function getSocketUser(socket: Socket): AuthPayload {
  const user = socket.data.user as AuthPayload | undefined;

  if (!user) {
    throw new Error('Socket is not authenticated');
  }

  return user;
}
