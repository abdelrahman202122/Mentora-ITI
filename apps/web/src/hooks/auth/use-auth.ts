"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getCurrentUser,
  login,
  logout,
  register,
} from "@/services/auth/auth-service";
import type { ApiClientError } from "@/lib/axios";
import type {
  AuthUser,
  LoginInput,
  RegisterInput,
} from "@/types/auth/auth-types";

export const authKeys = {
  all: ["auth"] as const,
  currentUser: ["auth", "current-user"] as const,
};

export function useCurrentUser() {
  return useQuery<AuthUser | null, ApiClientError>({
    queryKey: authKeys.currentUser,
    queryFn: getCurrentUser,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<AuthUser, ApiClientError, LoginInput>({
    mutationFn: login,
    onSuccess: async (user) => {
      queryClient.setQueryData(authKeys.currentUser, user);
      await queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation<AuthUser, ApiClientError, RegisterInput>({
    mutationFn: register,
    onSuccess: async (user) => {
      queryClient.setQueryData(authKeys.currentUser, user);
      await queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiClientError>({
    mutationFn: logout,
    onSettled: async () => {
      queryClient.setQueryData(authKeys.currentUser, null);
      await queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
    },
  });
}
