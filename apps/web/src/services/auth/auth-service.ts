import api, { ApiClientError } from "@/lib/axios";
import type {
  ApiSuccess,
  AuthUser,
  LoginInput,
  RegisterInput,
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

export async function logout(): Promise<void> {
  await api.post("/users/logout");
}
