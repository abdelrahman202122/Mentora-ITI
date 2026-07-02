export type UserRole = "learner" | "tutor" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  role?: UserRole;
  roles?: UserRole[];
  avatar?: string;
  isEmailVerified?: boolean;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
};

export type ForgotPasswordInput = {
  email: string;
};

export type ResetPasswordInput = {
  token: string;
  newPassword: string;
};

export type ApiSuccess<T> = {
  success: true;
  message?: string;
  data: T;
};

export type ApiMessageSuccess = {
  success: true;
  message?: string;
};
