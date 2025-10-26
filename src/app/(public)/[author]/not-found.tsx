import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Search } from "lucide-react";

export default function AuthorNotFound() {
  return (
    <div className="bg-background pt-16">
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
              Author Not Found
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              The author you're looking for doesn't exist in our database yet.
              Don't worry though - you can help us add them!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button asChild size="lg">
                <Link href="/request-models">
                  <Plus className="w-4 h-4 mr-2" />
                  Request New Author & Models
                </Link>
              </Button>

              <Button variant="outline" asChild size="lg">
                <Link href="/authors">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Browse All Authors
                </Link>
              </Button>
            </div>

            {/* Additional Info */}
            <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="font-semibold text-foreground mb-2">
                Want to add a new author?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you know of an AI provider or model author that's not listed
                here, you can request them to be added to our platform.
              </p>
              <div className="text-xs text-muted-foreground">
                <p className="mb-1">• Include the author's name and website</p>
                <p className="mb-1">• List their available models</p>
                <p>• Provide any relevant documentation or links</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
