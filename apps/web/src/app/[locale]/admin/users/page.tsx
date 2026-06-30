"use client";

import { useState, useCallback } from "react";
import { Plus, Download, Loader2, AlertCircle } from "lucide-react";
import { AddUserModal } from "@/components/admin/users/components/AddUserModal";
import type { AddUserFormState } from "@/components/admin/users/components/AddUserModal";
import { UserDrawer } from "@/components/admin/users/components/UserDrawer";
import { EditUserDrawer } from "@/components/admin/users/components/EditUserDrawer";
import type { EditUserFormState } from "@/components/admin/users/components/EditUserDrawer";
import { StatusChangeModal } from "@/components/admin/users/components/StatusChangeModal";
import { AuditLogsModal } from "@/components/admin/users/components/AuditLogsModal";
import { UserFilters } from "@/components/admin/users/components/UserFilters";
import { UserTable } from "@/components/admin/users/components/UserTable";
import type { User, Status, Role } from "@/types/admin";
import { PageHeader, TablePagination } from "@/components/admin/shared";
import { useAdminUsers } from "@/hooks/admin/use-admin-users";
import { getUserDetail, exportUsersCsv } from "@/lib/api/admin-users";

const PER_PAGE = 10;

export default function UsersPage() {
  const {
    users, loading, error, mutating,
    page, totalPages, totalItems, setPage,
    search: query, setSearch: setQuery,
    role, setRole, status, setStatus,
    createUser, updateUser, changeStatus, setUsers, refetch,
  } = useAdminUsers({ perPage: PER_PAGE });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [statusChangeUser, setStatusChangeUser] = useState<User | null>(null);
  const [targetStatus, setTargetStatus] = useState<Status | null>(null);
  const [auditLogsUser, setAuditLogsUser] = useState<User | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleSuspendClick = (u: User) => {
    setStatusChangeUser(u);
    setTargetStatus("Suspended");
    setSelectedUser(null);
  };

  const handleRestoreClick = (u: User) => {
    setStatusChangeUser(u);
    setTargetStatus("Active");
    setSelectedUser(null);
  };

  const handleConfirmStatusChange = async (u: User, newStatus: Status, reason: string) => {
    try {
      await changeStatus(u.id, { status: newStatus, reason });
      setStatusChangeUser(null);
      setTargetStatus(null);
    } catch (err) {
      console.error("Failed to change user status:", err);
      alert(err instanceof Error ? err.message : "Failed to change user status.");
    }
  };

  const handleViewUser = useCallback(
    async (u: User) => {
      setSelectedUser(u);
      setDetailLoadingId(u.id);
      try {
        const detail = await getUserDetail(u.id);
        setSelectedUser(detail);
        setUsers((prev) => prev.map((row) => (row.id === detail.id ? detail : row)));
      } catch (err) {
        console.error("Failed to load user detail:", err);
      } finally {
        setDetailLoadingId(null);
      }
    },
    [setUsers],
  );

  const handleAuditLogs = (u: User) => {
    setAuditLogsUser(u);
    setSelectedUser(null);
  };

  const handleSaveEdit = async (u: User, form: EditUserFormState) => {
    try {
      const updated = await updateUser(u.id, {
        name: form.name.trim() || undefined,
        email: form.email.trim() || undefined,
        roleLabel: form.roleLabel?.trim() || undefined,
      });
      setSelectedUser((prev) => (prev && prev.id === updated.id ? updated : prev));
      setEditingUser(null);
    } catch (err) {
      console.error("Failed to save user:", err);
      alert(err instanceof Error ? err.message : "Failed to save user.");
    }
  };

  const handleCreateUser = async (form: AddUserFormState) => {
    try {
      await createUser({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        role: form.role as Role,
        status: form.status as Status,
      });
      setAddUserOpen(false);
    } catch (err) {
      console.error("Failed to create user:", err);
      alert(err instanceof Error ? err.message : "Failed to create user.");
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const blob = await exportUsersCsv({
        search: query || undefined,
        role: (role || undefined) as Role | undefined,
        status: (status || undefined) as Status | undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users-export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export CSV:", err);
      alert(err instanceof Error ? err.message : "Failed to export CSV.");
    } finally {
      setExporting(false);
    }
  };

  const start = totalItems === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const end = Math.min(page * PER_PAGE, totalItems);
  const showingText = `Showing ${start}-${end} of ${totalItems.toLocaleString()} users`;

  return (
    <div className="flex flex-col bg-gray-50 min-h-full">
  
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-6 sm:py-8">
        <PageHeader
          title="User Management"
          description="Monitor, manage, and audit all platform participants."
          actions={
            <>
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={exporting || loading}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 sm:px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span className="hidden sm:inline">Export CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setAddUserOpen(true)}
                disabled={mutating}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-3 sm:px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add User</span>
              </button>
            </>
          }
        />

        {error && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
            <button type="button" onClick={refetch} className="text-sm font-medium text-red-700 underline hover:text-red-800">
              Retry
            </button>
          </div>
        )}

        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          )}

          <UserFilters
            query={query}
            onQueryChange={setQuery}
            role={role}
            onRoleChange={(v) => setRole(v as Role | "")}
            status={status}
            onStatusChange={(v) => setStatus(v as Status | "")}
          />
          <UserTable users={users} onView={handleViewUser} onEdit={setEditingUser} />
          <TablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            showingText={showingText}
          />
        </div>
      </div>

      <AddUserModal open={addUserOpen} onClose={() => setAddUserOpen(false)} onCreate={handleCreateUser} />
      <UserDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onSuspend={handleSuspendClick}
        onRestore={handleRestoreClick}
        onAuditLogs={handleAuditLogs}
      />
      <EditUserDrawer user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveEdit} />
      <StatusChangeModal
        user={statusChangeUser}
        targetStatus={targetStatus}
        onClose={() => { setStatusChangeUser(null); setTargetStatus(null); }}
        onConfirm={handleConfirmStatusChange}
        mutating={mutating}
      />
      <AuditLogsModal user={auditLogsUser} onClose={() => setAuditLogsUser(null)} />
    </div>
  );
}