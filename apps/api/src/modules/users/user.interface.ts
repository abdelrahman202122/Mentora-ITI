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
 * User interface
 */

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;

  role: UserRole;

  isEmailVerified: boolean;
  isActive: boolean;

  avatar?: string;

  // Relation to Tutor profile (only if role = tutor)
  tutorProfile?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthPayload {
  userId: string;
  role: string;
}

export interface IRefreshToken extends Document {
  token:     string;
  userId:    Types.ObjectId;
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
    role: UserRole;
  };
}
