import { Copy, Linkedin, Share2, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CopyLinkButton } from "./copy-link-button";

export async function ReportActions({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;

  if (!reportId) {
    return null;
  }

  const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/reports/${reportId}`;

  return (
    <>
      <Separator />
      <div className="space-y-3">
        <p className="text-sm font-medium text-center">
          Share your contribution:
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          <CopyLinkButton reportId={reportId} />
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex items-center gap-2"
          >
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                "I just submitted a report on OpenModal!",
              )}&url=${encodeURIComponent(reportUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex items-center gap-2"
          >
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(reportUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </a>
          </Button>
        </div>
      </div>
    </>
  );
}
