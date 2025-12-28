"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllUsers, type UserFilters } from "@/actions/admin-users";
import { UserCard } from "./user-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function UserList() {
  const [filters, setFilters] = useState<UserFilters>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const limit = 50;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", filters, page],
    queryFn: () => getAllUsers(filters, limit, page * limit),
  });

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search }));
    setPage(0);
  };

  const handleRoleFilter = (role: string) => {
    setFilters((prev) => ({ ...prev, role: role === "all" ? undefined : role }));
    setPage(0);
  };

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status === "all" ? undefined : (status as "active" | "banned"),
    }));
    setPage(0);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
        <Select onValueChange={handleRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="observer">Observer</SelectItem>
            <SelectItem value="contributor">Contributor</SelectItem>
            <SelectItem value="trusted">Trusted</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">
        Total: {data?.total ?? 0} users | Showing {page * limit + 1}-
        {Math.min((page + 1) * limit, data?.total ?? 0)}
      </div>

      <div className="space-y-4">
        {data?.users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      {data && data.total > limit && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page + 1} of {Math.ceil(data.total / limit)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={(page + 1) * limit >= data.total}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

