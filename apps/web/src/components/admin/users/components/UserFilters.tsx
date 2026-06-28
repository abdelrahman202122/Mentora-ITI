
"use client";

import { SearchInput, Dropdown } from "../../shared";

// import { Dropdown, SearchInput } from "@/components/shared";

interface UserFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  role: string;
  onRoleChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
}

export function UserFilters({
  query,
  onQueryChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center">
      <SearchInput
        value={query}
        onChange={onQueryChange}
        placeholder="Filter by name, email or ID..."
        className="flex-1"
      />
      <div className="grid grid-cols-2 gap-3 sm:w-auto sm:grid-cols-2">
        <Dropdown
          label="All Roles"
          options={["Tutor", "Student", "Admin"]}
          value={role}
          onChange={onRoleChange}
        />
        <Dropdown
          label="Any Status"
          options={["Active", "Pending", "Suspended"]}
          value={status}
          onChange={onStatusChange}
        />
      </div>
    </div>
  );
}
