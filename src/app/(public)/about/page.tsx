import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { Info } from "lucide-react";

export const metadata: Metadata = {
  title: "About - OpenModal",
  description: "Learn about OpenModal and our mission to track AGI progress.",
};

export default function AboutPage() {
  return (
    <ComingSoon
      title="About"
      description="Learn about OpenModal and our mission to track AGI progress. Coming soon."
      icon={Info}
    />
  );
}

