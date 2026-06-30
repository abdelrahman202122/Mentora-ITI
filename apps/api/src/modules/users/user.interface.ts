
/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { Document, Types } from 'mongoose';

/**
 * User roles in the system
 */
export enum UserRole {
  LEARNER = 'learner',
  TUTOR = 'tutor',
  ADMIN = 'admin',
}

/**
 * ✅ NEW: Admin status values
 * Tracks the 3 possible account states for admin management
 */
export type AdminStatus = 'Active' | 'Pending' | 'Suspended';

/**
 * User interface
 */
export interface IUser extends Document {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;

  role: UserRole;

  isEmailVerified: boolean;
  isActive: boolean;

  avatar?: string | null;
  tutorProfile?: Types.ObjectId;
  adminStatus: AdminStatus;
  roleLabel?: string | null;

  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface AuthPayload {
  userId: string;
  role: UserRole;
}

export interface IRefreshToken extends Document {
  token: string;
  userId: Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;

  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string | null;
    role: UserRole;
  };
}

export interface UserProfileDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isEmailVerified: boolean;
  phoneNumber: string | null;
  adminStatus: AdminStatus;
  roleLabel?: string | null;
  tutorProfile?: unknown;
}

