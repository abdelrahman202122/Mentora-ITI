
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  listUsers,
  createUser as apiCreateUser,
  updateUser as apiUpdateUser,
  changeUserStatus as apiChangeStatus,
  type ListUsersParams,
  type CreateUserPayload,
  type UpdateUserPayload,
  type ChangeStatusPayload,
} from "@/lib/api/admin-users";
import type { User, Status, Role } from "@/types/admin";

interface UseAdminUsersOptions {
  perPage?: number;
  searchDebounceMs?: number;
}

export function useAdminUsers({
  perPage = 10,
  searchDebounceMs = 350,
}: UseAdminUsersOptions = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [status, setStatus] = useState<Status | "">("");

  // ✅ Tracks create/update/status-change operations (NOT list fetching)
  const [mutating, setMutating] = useState(false);

  // ── Debounce search input ─────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, searchDebounceMs);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, searchDebounceMs]);

  // ── Reset to page 1 whenever filters change ──────────────────────
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [debouncedSearch, role, status]);

  // ── Fetch list ────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: ListUsersParams = {
        page,
        perPage,
        search: debouncedSearch || undefined,
        role: role || undefined,
        status: status || undefined,
      };
      const result = await listUsers(params);
      setUsers(result.data);
      setTotalPages(result.meta.totalPages);
      setTotalItems(result.meta.totalItems);
    } catch (err) {
      // ✅ Distinguish network errors from auth errors
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load users");
      }
      setUsers([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, debouncedSearch, role, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  // ── Create user ───────────────────────────────────────────────────
  const createUser = useCallback(
    async (payload: CreateUserPayload): Promise<User> => {
      setMutating(true);
      try {
        const created = await apiCreateUser(payload);
        // Prepend to list + bump total
        setUsers((prev) => [created, ...prev]);
        setTotalItems((prev) => prev + 1);
        return created;
      } finally {
        setMutating(false);
      }
    },
    [],
  );

  // ── Update user ───────────────────────────────────────────────────
  const updateUser = useCallback(
    async (userId: string, payload: UpdateUserPayload): Promise<User> => {
      setMutating(true);
      try {
        const updated = await apiUpdateUser(userId, payload);
        setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
        return updated;
      } finally {
        setMutating(false);
      }
    },
    [],
  );

  // ── Change status ─────────────────────────────────────────────────
  const changeStatus = useCallback(
    async (userId: string, payload: ChangeStatusPayload): Promise<void> => {
      setMutating(true);
      try {
        await apiChangeStatus(userId, payload);
        // ✅ Optimistically update the row's status
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, status: payload.status } : u,
          ),
        );
      } finally {
        setMutating(false);
      }
    },
    [],
  );

  return {
    // data
    users,
    loading,
    error,
    mutating,
    // pagination
    page,
    totalPages,
    totalItems,
    setPage,
    // filters
    search,
    setSearch,
    role,
    setRole,
    status,
    setStatus,
    // mutations
    createUser,
    updateUser,
    changeStatus,
    // misc
    refetch: fetchUsers,
    setUsers,
  };
}

