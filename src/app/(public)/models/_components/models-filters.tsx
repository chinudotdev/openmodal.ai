"use client";

import { useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ModalityFilters from "@/app/(public)/modality-filters";

export default function ModelsFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse URL parameters
  const inputParam = searchParams.get("input") || "";
  const outputParam = searchParams.get("output") || "";

  // Parse modality filters
  const inputModalities = {
    text: inputParam.includes("text"),
    image: inputParam.includes("image"),
    audio: inputParam.includes("audio"),
    video: inputParam.includes("video"),
  };

  const outputModalities = {
    text: outputParam.includes("text"),
    image: outputParam.includes("image"),
    audio: outputParam.includes("audio"),
    video: outputParam.includes("video"),
  };

  // Update URL parameters
  const updateFilters = useCallback(
    (newInput: string, newOutput: string) => {
      const params = new URLSearchParams(searchParams);
      if (newInput) params.set("input", newInput);
      else params.delete("input");
      if (newOutput) params.set("output", newOutput);
      else params.delete("output");
      router.push(`/models?${params.toString()}`);
    },
    [searchParams, router],
  );

  const resetFilters = useCallback(() => {
    router.push("/models");
  }, [router]);

  // Handle modality filter changes
  const handleInputModalityChange = useCallback(
    (modality: keyof typeof inputModalities) => {
      const currentInputs = inputParam.split(",").filter(Boolean);
      const isActive = currentInputs.includes(modality);
      const newInputs = isActive
        ? currentInputs.filter((m) => m !== modality)
        : [...currentInputs, modality];
      updateFilters(newInputs.join(","), outputParam);
    },
    [inputParam, outputParam, updateFilters],
  );

  const handleOutputModalityChange = useCallback(
    (modality: keyof typeof outputModalities) => {
      const currentOutputs = outputParam.split(",").filter(Boolean);
      const isActive = currentOutputs.includes(modality);
      const newOutputs = isActive
        ? currentOutputs.filter((m) => m !== modality)
        : [...currentOutputs, modality];
      updateFilters(inputParam, newOutputs.join(","));
    },
    [outputParam, inputParam, updateFilters],
  );

  return (
    <div className="space-y-6">
      {/* Modality Filters */}
      <ModalityFilters
        inputModalities={inputModalities}
        outputModalities={outputModalities}
        onInputChange={handleInputModalityChange}
        onOutputChange={handleOutputModalityChange}
      />

      {/* Reset Filters Button */}
      <div className="pt-4 border-t border-border">
        <button
          type="button"
          onClick={resetFilters}
          className="w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted/50 transition-colors"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
}
