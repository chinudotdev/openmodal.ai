import { Map as MapIcon } from "lucide-react";
import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Map View - OpenModal",
  description: "Visualize AI capabilities and progress on an interactive map.",
};

export default function MapPage() {
  return (
    <ComingSoon
      title="Map View"
      description="Visualize AI capabilities and progress on an interactive map. Coming soon."
      icon={MapIcon}
    />
  );
}
