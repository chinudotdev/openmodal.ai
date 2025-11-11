import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact - OpenModal",
  description: "Get in touch with the OpenModal team.",
};

export default function ContactPage() {
  return (
    <ComingSoon
      title="Contact"
      description="Get in touch with the OpenModal team. Coming soon."
      icon={Mail}
    />
  );
}

