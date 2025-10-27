import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Eye,
  Image,
  Type,
  Video,
  Volume2,
  ArrowRight,
  Search,
  Users,
  Database,
} from "lucide-react";
import Link from "next/link";
import { getPlatformStats } from "@/actions/stats";
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
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenModal - AI Model Directory & Discovery Platform",
    description:
      "Discover and explore AI models from top providers. Find the perfect model for your project.",
  },
};

const modalityIcons = {
  text: Type,
  image: Image,
  audio: Volume2,
  video: Video,
};

export default async function Home() {
  const stats = await getPlatformStats();

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
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed">
            Explore {stats.totalModels}+ AI models from {stats.totalProviders}+
            providers. Find the perfect model for text, image, audio, and video
            tasks.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">
                {stats.totalModels.toLocaleString()}
              </div>
              <div className="text-muted-foreground">AI Models</div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">
                {stats.totalProviders.toLocaleString()}
              </div>
              <div className="text-muted-foreground">Providers</div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">
                {stats.totalModalities.toLocaleString()}
              </div>
              <div className="text-muted-foreground">Modalities</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/models">
                Explore Models
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
            >
              <Link href="/providers">
                View Providers
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Separator className="my-16" />

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools to discover, compare, and choose the right AI
            models for your projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Comprehensive Directory */}
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mx-auto mb-6">
              <Database className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Comprehensive Directory
            </h3>
            <p className="text-muted-foreground">
              Browse {stats.totalModels}+ models from leading AI providers with
              detailed descriptions and capabilities.
            </p>
          </div>

          {/* Multimodal Support */}
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mx-auto mb-6">
              <Eye className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Multimodal Support
            </h3>
            <p className="text-muted-foreground">
              Find models for text, image, audio, and video processing. Support
              for all major AI modalities.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mx-auto mb-6">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Smart Discovery
            </h3>
            <p className="text-muted-foreground">
              Powerful search and filtering tools to quickly find models that
              match your specific requirements.
            </p>
          </div>

          {/* Provider Info */}
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mx-auto mb-6">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Provider Details
            </h3>
            <p className="text-muted-foreground">
              Learn about AI providers, their models, and capabilities. Make
              informed decisions about your AI stack.
            </p>
          </div>
        </div>
      </section>

      <Separator className="my-16" />

      {/* Modality Types Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Supported Modalities
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore AI models across different input and output modalities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.modalityTypes.map((modality) => {
            const IconComponent =
              modalityIcons[modality.name as keyof typeof modalityIcons] ||
              Brain;
            return (
              <div
                key={`${modality.name}-${modality.type}`}
                className="bg-card border rounded-lg p-6 text-center"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 capitalize">
                  {modality.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 capitalize">
                  {modality.type}
                </p>
                <div className="text-2xl font-bold text-primary">
                  {modality.count}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
