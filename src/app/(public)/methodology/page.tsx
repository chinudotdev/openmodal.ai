import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Methodology - OpenModal",
  description: "Learn about how we track and measure AI capabilities and AGI progress.",
};

export default function MethodologyPage() {
  return (
    <ComingSoon
      title="Methodology"
      description="Learn about how we track and measure AI capabilities and AGI progress. Coming soon."
      icon={BookOpen}
    />
  );
}

