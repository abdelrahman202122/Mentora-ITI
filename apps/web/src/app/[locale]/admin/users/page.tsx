"use client";

import { useState } from "react";
import { Plus, Download } from "lucide-react";
import { AddUserModal } from "@/components/admin/users/components/AddUserModal";
import type { AddUserFormState } from "@/components/admin/users/components/AddUserModal";
import { UserDrawer } from "@/components/admin/users/components/UserDrawer";
import { EditUserDrawer } from "@/components/admin/users/components/EditUserDrawer";
import type { EditUserFormState } from "@/components/admin/users/components/EditUserDrawer";
import { StatusChangeModal } from "@/components/admin/users/components/StatusChangeModal";
import { UserFilters } from "@/components/admin/users/components/UserFilters";
import { UserTable } from "@/components/admin/users/components/UserTable";
import { PER_PAGE, TOTAL_USERS, USERS } from "@/mocks/mock-data";
import type { User, Role, Status } from "@/types/admin";
import { PageHeader, TablePagination } from "@/components/admin/shared";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(() => USERS);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [addUserOpen, setAddUserOpen] = useState(false);

  // 🎯 Unified status-change modal state
  // We track BOTH the user AND the target status (Active / Pending / Suspended)
  const [statusChangeUser, setStatusChangeUser] = useState<User | null>(null);
  const [targetStatus, setTargetStatus] = useState<Status | null>(null);

  const filtered = users.filter((u) => {
    const matchesQuery =
      !query ||
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.id.toLowerCase().includes(query.toLowerCase());
    const matchesRole = !role || u.role === role;
    const matchesStatus = !status || u.status === status;
    return matchesQuery && matchesRole && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(TOTAL_USERS / PER_PAGE));

  /* ═══════════════════════════════════════════════════════════════
     STATUS CHANGE HANDLERS
     ═══════════════════════════════════════════════════════════════ */

  // 1) User clicks "Suspend Account" inside the drawer
  const handleSuspendClick = (u: User) => {
    setStatusChangeUser(u);
    setTargetStatus("Suspended");
    setSelectedUser(null); // close the drawer
  };

  // 2) User clicks "Restore Account" inside the drawer
  const handleRestoreClick = (u: User) => {
    setStatusChangeUser(u);
    setTargetStatus("Active");
    setSelectedUser(null); // close the drawer
  };

  // 3) User confirms in the StatusChangeModal — this runs for BOTH
  //    suspend and restore (and any other status change)
  const handleConfirmStatusChange = (
    u: User,
    newStatus: Status,
    reason: string,
  ) => {
    // TODO: wire to your API
    // fetch(`/api/admin/users/${u.id}/status`, {
    //   method: "PATCH",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ status: newStatus, reason }),
    // })
    console.log(`Change user ${u.id} status to ${newStatus}. Reason:`, reason);

    // Optimistically update local state so the table reflects the change
    const updated: User = { ...u, status: newStatus };
    setUsers((prev) => prev.map((row) => (row.id === u.id ? updated : row)));

    // Close the modal
    setStatusChangeUser(null);
    setTargetStatus(null);
  };

  /* ═══════════════════════════════════════════════════════════════
     OTHER HANDLERS (unchanged)
     ═══════════════════════════════════════════════════════════════ */

  const handleAuditLogs = (u: User) => {
    console.log("Audit logs for user:", u.id);
  };

  const handleSaveEdit = (u: User, form: EditUserFormState) => {
    const updated: User = {
      ...u,
      name: form.name.trim() || u.name,
      roleLabel: form.roleLabel.trim() || undefined,
      email: form.email.trim() || u.email,
    };
    setUsers((prev) => prev.map((row) => (row.id === u.id ? updated : row)));
    setSelectedUser((prev) => (prev && prev.id === u.id ? updated : prev));
    console.log("Save user:", u.id, {
      name: updated.name,
      roleLabel: updated.roleLabel,
      email: updated.email,
    });
    setEditingUser(null);
  };

  const handleCreateUser = (form: AddUserFormState) => {
    const newUser: User = {
      id: `USR-${String(users.length + 1).padStart(4, "0")}`,
      name: form.fullName.trim(),
      email: form.email.trim(),
      role: form.role as Role,
      status: form.status as Status,
      regDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      totalSessions: 0,
      avgRating: undefined,
      lastActivity: undefined,
      avatarUrl: undefined,
      roleLabel: undefined,
      reviews: [],
    };
    setUsers((prev) => [newUser, ...prev]);
    console.log("Create user:", {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
    });
    setAddUserOpen(false);
  };

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <PageHeader
          title="User Management"
          description="Monitor, manage, and audit all platform participants."
          actions={
            <>
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => setAddUserOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Add User
              </button>
            </>
          }
        />

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <UserFilters
            query={query}
            onQueryChange={setQuery}
            role={role}
            onRoleChange={setRole}
            status={status}
            onStatusChange={setStatus}
          />
          <UserTable
            users={filtered}
            onView={setSelectedUser}
            onEdit={setEditingUser}
          />
          <TablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            showingText={`Showing 1-${Math.min(PER_PAGE, TOTAL_USERS)} of ${TOTAL_USERS.toLocaleString()} users`}
          />
        </div>
      </div>

      {/* ---------- Add User modal ---------- */}
      <AddUserModal
        open={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        onCreate={handleCreateUser}
      />

      {/* ---------- User detail drawer ----------
          NOTE: Now passes BOTH onSuspend AND onRestore.
          The drawer decides which button to show based on user.status. */}
      <UserDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onSuspend={handleSuspendClick}
        onRestore={handleRestoreClick}
        onAuditLogs={handleAuditLogs}
      />

      {/* ---------- Edit user drawer ---------- */}
      <EditUserDrawer
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveEdit}
      />

      {/* ---------- Unified status change modal ----------
          Handles suspend, restore, and any future status change. */}
      <StatusChangeModal
        user={statusChangeUser}
        targetStatus={targetStatus}
        onClose={() => {
          setStatusChangeUser(null);
          setTargetStatus(null);
        }}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
}
