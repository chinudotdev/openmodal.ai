import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "API Documentation - OpenModal",
  description: "Access the OpenModal API documentation and integration guides.",
};

export default function ApiDocsPage() {
  return (
    <ComingSoon
      title="API Documentation"
      description="Access the OpenModal API documentation and integration guides. Coming soon."
      icon={BookOpen}
    />
  );
}

