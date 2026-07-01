
"use client";

import { Pencil, Eye } from "lucide-react";
// import { Avatar, EmptyState } from "@/components/shared";
// import { roleBadgeClasses, statusBadgeClasses } from "@/utils/badge-styles";
import type { User } from "@/types/admin";
import { Avatar, EmptyState } from "../../shared";
import { roleBadgeClasses, statusBadgeClasses } from "@/utils/admin/badge-styles";

interface UserTableProps {
  users: User[];
  onView: (user: User) => void;
  onEdit: (user: User) => void;
}

export function UserTable({ users, onView, onEdit }: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Role</th>
            <th className="px-4 py-3 font-semibold text-gray-700">
              Reg. Date
            </th>
            <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.id}
              className="border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/60"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={u.name} seed={u.id} avatarUrl={u.avatarUrl ?? undefined} size="sm" />
                  <span className="font-medium text-gray-900">{u.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-500">{u.email}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeClasses[u.role]}`}
                >
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500">{u.regDate}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClasses[u.status]}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      u.status === "Active"
                        ? "bg-emerald-500"
                        : u.status === "Pending"
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                  />
                  {u.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    aria-label={`Edit ${u.name}`}
                    onClick={() => onEdit(u)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`View ${u.name}`}
                    onClick={() => onView(u)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <EmptyState message="No users match the current filters." colSpan={6} />
          )}
        </tbody>
      </table>
    </div>
  );
}
