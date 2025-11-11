import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { Cpu } from "lucide-react";

export const metadata: Metadata = {
  title: "Technologies - OpenModal",
  description: "Explore AI technologies and capabilities tracked by the community.",
};

export default function TechnologiesPage() {
  return (
    <ComingSoon
      title="Technologies"
      description="Explore AI technologies and capabilities tracked by the community. Coming soon."
      icon={Cpu}
    />
  );
}

