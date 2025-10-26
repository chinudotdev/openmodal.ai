import { Button } from "@/components/ui/button";
import { Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Providers | OpenModal",
  description:
    "Connect with 24+ leading AI providers including OpenAI, Anthropic, Google, and Meta. Access enterprise-grade AI services with comprehensive API management.",
  keywords: [
    "AI providers",
    "OpenAI",
    "Anthropic",
    "Google AI",
    "Meta AI",
    "API management",
    "AI services",
    "enterprise AI",
  ],
  openGraph: {
    title: "AI Providers | OpenModal",
    description:
      "Connect with 24+ leading AI providers including OpenAI, Anthropic, Google, and Meta. Access enterprise-grade AI services with comprehensive API management.",
    type: "website",
    url: "/providers",
    siteName: "OpenModal",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Providers | OpenModal",
    description:
      "Connect with 24+ leading AI providers including OpenAI, Anthropic, Google, and Meta. Access enterprise-grade AI services with comprehensive API management.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ProvidersPage() {
  return (
    <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Providers Coming Soon
          </h1>
          {/* <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            We're working hard to bring you access to 24+ leading AI providers 
            including OpenAI, Anthropic, Google, and Meta. Stay tuned for 
            enterprise-grade AI services with comprehensive API management.
          </p> */}
        </div>

        {/* <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            What to Expect
          </h2>
          <div className="grid gap-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">24+ AI Providers:</strong> Access to OpenAI, Anthropic, Google, Meta, and more
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Unified API:</strong> Single interface to manage all your AI provider connections
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Enterprise Features:</strong> Rate limiting, monitoring, and cost optimization
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Model Management:</strong> Easy switching between models and providers
              </p>
            </div>
          </div>
        </div> */}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/models">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Explore Models
            </Link>
          </Button>
          {/* <Button variant="outline" size="lg" disabled>
            Request Early Access
          </Button> */}
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          Follow our updates to be the first to know when providers are
          available.
        </p>
      </div>
    </div>
  );
}
