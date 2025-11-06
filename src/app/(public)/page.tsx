import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpenModal - AI Model Directory & Discovery Platform",
  description:
    "Discover and explore AI models from top providers. Find the perfect model for your project with our comprehensive directory of text, image, audio, and video AI models.",
  keywords: [
    "AI models",
    "artificial intelligence",
    "machine learning",
    "model directory",
    "AI discovery",
    "text models",
    "image models",
    "audio models",
    "video models",
    "open source AI",
  ],
  openGraph: {
    title: "OpenModal - AI Model Directory & Discovery Platform",
    description:
      "Discover and explore AI models from top providers. Find the perfect model for your project with our comprehensive directory of text, image, audio, and video AI models.",
    type: "website",
    url: "/",
    siteName: "OpenModal",
    images: [
      {
        url: "/api/og?type=landing",
        width: 1200,
        height: 630,
        alt: "OpenModal - AI Model Directory & Discovery Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenModal - AI Model Directory & Discovery Platform",
    description:
      "Discover and explore AI models from top providers. Find the perfect model for your project.",
    images: ["/api/og?type=landing"],
  },
};

export default async function Home() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
            Discover AI Models
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>
        </div>
      </section>
    </main>
  );
}
