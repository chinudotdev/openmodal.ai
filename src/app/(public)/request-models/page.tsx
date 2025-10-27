import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request Models | OpenModal",
  description:
    "Request new AI models to be added to OpenModal. Submit your model suggestions and help expand our comprehensive AI model catalog.",
  keywords: [
    "request models",
    "AI models",
    "model submission",
    "OpenModal",
    "AI catalog",
    "model requests",
  ],
  openGraph: {
    title: "Request Models | OpenModal",
    description:
      "Request new AI models to be added to OpenModal. Submit your model suggestions and help expand our comprehensive AI model catalog.",
    type: "website",
    url: "/request-models",
    siteName: "OpenModal",
    images: [
      {
        url: "/api/og?type=landing",
        width: 1200,
        height: 630,
        alt: "Request Models | OpenModal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Request Models | OpenModal",
    description:
      "Request new AI models to be added to OpenModal. Submit your model suggestions and help expand our comprehensive AI model catalog.",
    images: ["/api/og?type=landing"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RequestModelsPage() {
  return (
    <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Request Models Coming Soon
          </h1>
        </div>

        {/* <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            What You'll Be Able to Do
          </h2>
          <div className="grid gap-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">
                  Submit Model Requests:
                </strong>{" "}
                Suggest new AI models to be added to our catalog
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Track Status:</strong>{" "}
                Monitor the progress of your model requests
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Community Voting:</strong>{" "}
                Vote on model requests from other users
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">
                  Detailed Information:
                </strong>{" "}
                Provide comprehensive model details and documentation links
              </p>
            </div>
          </div>
        </div> */}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/models">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Models
            </Link>
          </Button>
          {/* <Button variant="outline" size="lg" disabled>
            <Clock className="w-4 h-4 mr-2" />
            Request Model
          </Button> */}
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          Help us expand our AI model catalog by suggesting new models.
        </p>
      </div>
    </div>
  );
}
