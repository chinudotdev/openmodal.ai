import { Building2 } from "lucide-react";
import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Organizations - OpenModal",
  description: "Browse organizations working on AI capabilities and research.",
};

export default function OrganizationsPage() {
  return (
    <ComingSoon
      title="Organizations"
      description="Browse organizations working on AI capabilities and research. Coming soon."
      icon={Building2}
    />
  );
}
