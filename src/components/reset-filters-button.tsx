"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ResetFiltersButtonProps {
  baseUrl: string; // e.g., "/models" or "/providers"
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export default function ResetFiltersButton({
  baseUrl,
  variant = "outline",
  size = "sm",
  className = "",
  children = "Reset Filters",
}: ResetFiltersButtonProps) {
  const router = useRouter();

  const handleReset = () => {
    router.push(baseUrl);
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleReset}
    >
      {children}
    </Button>
  );
}
