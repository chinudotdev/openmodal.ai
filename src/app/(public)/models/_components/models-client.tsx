"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeftFromLine,
  ArrowRightToLine,
  Brain,
  Eye,
  FlaskConical,
  Image,
  TestTube,
  Type,
  Video,
  Volume2,
  Copy,
} from "lucide-react";
import ModelsFilters from "./models-filters";
import SearchInput from "@/components/search-input";
import ResetFiltersButton from "@/components/reset-filters-button";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import { getModels } from "@/actions/models";
import type { Model, ModelsResponse } from "@/actions/models/dto";
import Link from "next/link";
import { ConfirmExternalDialogTrigger } from "@/components/confirm-external-dialog";

// Types are now imported from the actions

type ModelStatus = "reasoning" | "experimental" | "preview" | "beta";

const statusIcons: Record<ModelStatus, typeof Brain> = {
  reasoning: Brain,
  experimental: FlaskConical,
  preview: Eye,
  beta: TestTube,
};

const statusColors: Record<ModelStatus, string> = {
  reasoning:
    "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
  experimental:
    "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-300",
  preview:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  beta: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
};

const StatusBadge = ({ status }: { status: ModelStatus }) => {
  const Icon = statusIcons[status];
  return (
    <span
      className={cn(
        "no-select inline-flex items-center gap-1 rounded-full border px-0.5 py-0.5 font-medium text-xs",
        statusColors[status],
      )}
    >
      <Icon className="size-3" />
    </span>
  );
};

const StatusBadges = ({ status }: { status: Model["status"] }) => {
  const activeStatuses: ModelStatus[] = [];

  if (status.reasoning) activeStatuses.push("reasoning");
  if (status.experimental) activeStatuses.push("experimental");
  if (status.preview) activeStatuses.push("preview");

  if (activeStatuses.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {activeStatuses.map((statusType) => (
        <StatusBadge key={statusType} status={statusType} />
      ))}
    </div>
  );
};

const capabilityIconMap = {
  text: Type,
  image: Image,
  audio: Volume2,
  video: Video,
} as const;

type ModelCapability = "text" | "image" | "audio" | "video";

const getCapabilityIcon = (capability: ModelCapability) => {
  return capabilityIconMap[capability];
};

const CapabilityIndicator = ({ modalities }: { modalities: string[] }) => {
  const allCapabilities: ModelCapability[] = [
    "text",
    "image",
    "audio",
    "video",
  ];

  return (
    <div className="no-select flex gap-0.5">
      {allCapabilities.map((capability) => {
        const Icon = getCapabilityIcon(capability);
        const isCapabilityActive = modalities.includes(capability);

        return (
          <div
            className={`flex h-4 w-4 items-center justify-center rounded border ${
              isCapabilityActive
                ? "border-foreground/30 bg-background"
                : "border-muted-foreground/30 bg-muted-foreground/10"
            }`}
            key={capability}
            title={`${capability} ${isCapabilityActive ? "supported" : "not supported"}`}
          >
            <Icon
              className={cn(
                "size-3",
                isCapabilityActive
                  ? "text-foreground"
                  : "text-muted-foreground/50",
              )}
            />
          </div>
        );
      })}
    </div>
  );
};

export default function ModelsClient() {
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  // Parse URL parameters
  const search = searchParams.get("search") || "";
  const inputParam = searchParams.get("input") || "";
  const outputParam = searchParams.get("output") || "";

  // Infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery<ModelsResponse>({
    queryKey: ["models", { search, input: inputParam, output: outputParam }],
    queryFn: async ({ pageParam }) => {
      const result = await getModels({
        cursor: pageParam as string,
        limit: 5,
        search: search || undefined,
        inputModalities: inputParam
          ? inputParam.split(",").filter(Boolean)
          : undefined,
        outputModalities: outputParam
          ? outputParam.split(",").filter(Boolean)
          : undefined,
      });

      // Check if result is an error
      if ("error" in result) {
        throw new Error(result.error);
      }

      return result;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: "200px",
  });

  // Fetch next page when in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Scroll handler for header animation
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollTop = scrollContainerRef.current.scrollTop;
        setIsScrolled(scrollTop > 5);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Flatten all models from all pages
  const allModels = data?.pages.flatMap((page) => page.data) || [];
  const totalCount = data?.pages[0]?.total || 0;

  if (error) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Error loading models
          </h2>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex">
      <div className="w-64 shrink-0 border-r bg-muted/30 p-6">
        <ModelsFilters />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Sticky Header Section */}
        <div
          className={`sticky top-0 z-50 backdrop-blur-sm transition-all duration-500 ease-in-out  px-4 ${
            isScrolled
              ? "py-3 bg-background/98 shadow-lg"
              : "py-6 bg-background/95 shadow-none"
          }`}
        >
          <div className="max-w-4xl mx-auto">
            {/* Full Header - shown when not scrolled */}
            <div
              className={`transition-all duration-500 ease-in-out transform ${
                isScrolled
                  ? "opacity-0 max-h-0 overflow-hidden -translate-y-2"
                  : "opacity-100 max-h-96 translate-y-0"
              }`}
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground transition-all duration-500 ease-in-out">
                      Models
                    </h1>
                    <span className="text-lg text-muted-foreground transition-all duration-500 ease-in-out delay-75">
                      {totalCount} models
                    </span>
                  </div>
                  <Button
                    asChild
                    className="transition-all duration-500 ease-in-out delay-100"
                  >
                    <Link href="/request-models">Request Model</Link>
                  </Button>
                </div>
              </div>

              {/* Search and Controls */}
              <div className="flex items-center space-x-4">
                <SearchInput
                  placeholder="Filter models"
                  baseUrl="/models"
                  className="flex-1 max-w-md transition-all duration-500 ease-in-out delay-150"
                />

                <ResetFiltersButton
                  baseUrl="/models"
                  className="transition-all duration-500 ease-in-out delay-200"
                />
              </div>
            </div>

            {/* Compact Header - shown when scrolled */}
            <div
              className={`transition-all duration-500 ease-in-out transform delay-100 ${
                isScrolled
                  ? "opacity-100 max-h-20 translate-y-0"
                  : "opacity-0 max-h-0 overflow-hidden translate-y-2"
              }`}
            >
              <div className="flex items-center space-x-4">
                <SearchInput
                  placeholder="Filter models"
                  baseUrl="/models"
                  className="flex-1 max-w-md transition-all duration-500 ease-in-out"
                />
                <ResetFiltersButton
                  baseUrl="/models"
                  className="transition-all duration-500 ease-in-out delay-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          <div className="px-4 py-6">
            <div className="max-w-4xl mx-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading models...</p>
                  </div>
                </div>
              ) : allModels.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No models found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters.
                  </p>
                </div>
              ) : (
                <div className="bg-background">
                  {allModels.map((model, index) =>
                    model.modelUrl ? (
                      <ConfirmExternalDialogTrigger
                        key={model.id}
                        url={model.modelUrl as string}
                        className={`block w-full text-left py-4 ${
                          index < allModels.length - 1
                            ? "border-b border-border"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="select-text font-semibold text-xl hover:underline hover:underline-offset-3 transition-colors">
                              {model.name}
                            </h3>
                            <StatusBadges status={model.status} />
                          </div>
                          <div className="mb-2 flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <div className="flex h-4 w-4 items-center justify-center rounded border border-blue-500/30 bg-blue-500/10">
                                <ArrowRightToLine className="size-3 text-blue-600 dark:text-blue-400" />
                              </div>
                              <CapabilityIndicator
                                modalities={model.inputModalities}
                              />
                            </div>

                            <div className="h-3 w-px bg-foreground/30" />

                            <div className="flex items-center gap-1.5">
                              <div className="flex h-4 w-4 items-center justify-center rounded border border-green-500/30 bg-green-500/10">
                                <ArrowLeftFromLine className="size-3 text-green-600 dark:text-green-400" />
                              </div>
                              <CapabilityIndicator
                                modalities={model.outputModalities}
                              />
                            </div>
                          </div>
                        </div>

                        <p className="mb-1 select-text text-muted-foreground leading-relaxed hover:text-foreground">
                          {model.description}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <p>
                            by{" "}
                            <Link
                              href={`/${model.authorId}`}
                              className="cursor-pointer underline underline-offset-2 transition-colors hover:text-foreground hover:font-normal"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {model.authorId}
                            </Link>
                          </p>
                          <span> | </span>
                          <p>
                            Created{" "}
                            {new Date(model.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </ConfirmExternalDialogTrigger>
                    ) : (
                      <div
                        key={model.id}
                        className={`py-4 ${
                          index < allModels.length - 1
                            ? "border-b border-border"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="select-text font-semibold text-xl hover:underline hover:underline-offset-3 transition-colors">
                              {model.name}
                            </h3>
                            <StatusBadges status={model.status} />
                          </div>
                          <div className="mb-2 flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <div className="flex h-4 w-4 items-center justify-center rounded border border-blue-500/30 bg-blue-500/10">
                                <ArrowRightToLine className="size-3 text-blue-600 dark:text-blue-400" />
                              </div>
                              <CapabilityIndicator
                                modalities={model.inputModalities}
                              />
                            </div>

                            <div className="h-3 w-px bg-foreground/30" />

                            <div className="flex items-center gap-1.5">
                              <div className="flex h-4 w-4 items-center justify-center rounded border border-green-500/30 bg-green-500/10">
                                <ArrowLeftFromLine className="size-3 text-green-600 dark:text-green-400" />
                              </div>
                              <CapabilityIndicator
                                modalities={model.outputModalities}
                              />
                            </div>
                          </div>
                        </div>

                        <p className="mb-1 select-text text-muted-foreground leading-relaxed hover:text-foreground">
                          {model.description}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <p>
                            by{" "}
                            <Link
                              href={`/${model.authorId}`}
                              className="cursor-pointer underline underline-offset-2 transition-colors hover:text-foreground hover:font-normal"
                            >
                              {model.authorId}
                            </Link>
                          </p>
                          <span> | </span>
                          <p>
                            Created{" "}
                            {new Date(model.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}

              {/* Load more trigger */}
              {hasNextPage && (
                <div ref={loadMoreRef} className="mt-8 text-center">
                  {isFetchingNextPage ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                      <span className="text-muted-foreground">
                        Loading more models...
                      </span>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={() => fetchNextPage()}>
                      Load More Models
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
