import api, { ApiClientError } from "@/lib/axios";
import type {
  ApiMessageSuccess,
  ApiSuccess,
  AuthUser,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/types/auth/auth-types";

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await api.get<ApiSuccess<AuthUser>>("/users/me");
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

export async function login(input: LoginInput): Promise<AuthUser> {
  const response = await api.post<ApiSuccess<AuthUser>>("/users/login", input);
  return response.data.data;
}

export async function register(input: RegisterInput): Promise<AuthUser> {
  const response = await api.post<ApiSuccess<AuthUser>>("/users/register", input);
  return response.data.data;
}

export async function forgotPassword(
  input: ForgotPasswordInput
): Promise<string> {
  const response = await api.post<ApiMessageSuccess>(
    "/users/forgot-password",
    input
  );

  return response.data.message ?? "";
}

export async function resetPassword(
  input: ResetPasswordInput
): Promise<string> {
  const response = await api.post<ApiMessageSuccess>(
    "/users/reset-password",
    input
  );

  return response.data.message ?? "";
}

export async function logout(): Promise<void> {
  await api.post("/users/logout");
}
