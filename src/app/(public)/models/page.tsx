import ModelsClient from "@/app/(public)/models/_components/models-client";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "AI Models | OpenModal",
  description:
    "Discover and explore 553+ AI models from leading providers. Compare capabilities, pricing, and performance across text, vision, and multimodal models.",
  keywords: [
    "AI models",
    "machine learning",
    "LLM",
    "GPT",
    "Claude",
    "Gemini",
    "AI providers",
    "model comparison",
  ],
  openGraph: {
    title: "AI Models | OpenModal",
    description:
      "Discover and explore 553+ AI models from leading providers. Compare capabilities, pricing, and performance across text, vision, and multimodal models.",
    type: "website",
    url: "/models",
    siteName: "OpenModal",
    images: [
      {
        url: "/api/og?type=models",
        width: 1200,
        height: 630,
        alt: "AI Models | OpenModal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Models | OpenModal",
    description:
      "Discover and explore 553+ AI models from leading providers. Compare capabilities, pricing, and performance across text, vision, and multimodal models.",
    images: ["/api/og?type=models"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ModelsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ModelsClient />
    </Suspense>
  );
}
