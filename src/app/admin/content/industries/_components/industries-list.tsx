"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  deleteIndustry,
  getAdminIndustries,
  type IndustryFilters,
} from "@/actions/admin-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "../../_components/status-badge";

export function IndustriesList() {
  const [filters, setFilters] = useState<IndustryFilters>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-industries", filters, page],
    queryFn: () => getAdminIndustries(filters, limit, page * limit),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteIndustry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-industries"] });
      toast.success("Industry deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete industry");
    },
  });

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search }));
    setPage(0);
  };

  const handleDelete = async (industryId: string) => {
    if (confirm("Are you sure you want to delete this industry?")) {
      deleteMutation.mutate(industryId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Industries</h1>
          <p className="text-muted-foreground mt-1">
            Manage industry categories and classifications
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/content/industries/new">
            <Plus className="h-4 w-4 mr-2" />
            Add New Industry
          </Link>
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search industries..."
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
        <Select
          onValueChange={(value) => {
            setFilters((prev) => ({
              ...prev,
              status:
                value === "all" ? undefined : (value as "active" | "hidden"),
            }));
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">
        Total: {data?.total ?? 0} industries | Showing {page * limit + 1}-
        {Math.min((page + 1) * limit, data?.total ?? 0)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.industries.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-muted-foreground">
            No industries found
          </div>
        ) : (
          data?.industries.map((industry) => (
            <Card key={industry.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {industry.icon && (
                          <span className="text-2xl">{industry.icon}</span>
                        )}
                        <h3 className="text-lg font-semibold">
                          {industry.name}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {industry.shortDescription || "No description"}
                      </p>
                    </div>
                    <StatusBadge status={industry.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Jobs</p>
                      <p className="font-medium">{industry.jobCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Order</p>
                      <p className="font-medium">{industry.displayOrder}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      ID: {industry.slug}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/admin/content/industries/${industry.id}/edit`}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(industry.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
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
