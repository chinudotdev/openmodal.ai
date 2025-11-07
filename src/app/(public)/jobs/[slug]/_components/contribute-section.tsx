import { AlertTriangle, Edit, FileText, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContributeSectionProps {
  jobId: string;
  slug: string;
}

export function ContributeSection({ jobId, slug }: ContributeSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contribute</CardTitle>
        <p className="text-sm text-muted-foreground">
          Help improve this analysis:
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          asChild
        >
          <Link href={`/contribute?type=deployment&job=${slug}`}>
            <FileText className="h-4 w-4" />
            Submit a deployment report
          </Link>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          asChild
        >
          <Link href={`/contribute?type=barrier&job=${slug}`}>
            <AlertTriangle className="h-4 w-4" />
            Report a barrier
          </Link>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          asChild
        >
          <Link href={`/contribute?type=edit&job=${slug}`}>
            <Edit className="h-4 w-4" />
            Suggest edits
          </Link>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          asChild
        >
          <Link href={`/jobs/${slug}#discussion`}>
            <MessageSquare className="h-4 w-4" />
            Join discussion
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
