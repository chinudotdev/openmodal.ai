import { FileText } from "lucide-react";
import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Research - OpenModal",
  description:
    "Explore research papers and publications related to AI capabilities.",
};

export default function ResearchPage() {
  return (
    <ComingSoon
      title="Research"
      description="Explore research papers and publications related to AI capabilities. Coming soon."
      icon={FileText}
    />
  );
}
