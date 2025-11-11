import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getExpertApplicationStatus } from "@/actions/expert-application";
import { VotingProgress } from "./voting-progress";
import { ApplicationDetails } from "./application-details";

export async function ExpertApplicationContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?callbackURL=/dashboard/expert-application");
  }

  const application = await getExpertApplicationStatus(session.user.id);

  if (!application) {
    redirect("/dashboard/apply-expert");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Your Expert Application</h1>
        <p className="text-muted-foreground mt-1">
          Status:{" "}
          <span className="font-medium capitalize">{application.status}</span>
        </p>
      </div>

      {application.status === "pending" && (
        <VotingProgress
          application={application}
          voteCounts={application.voteCounts}
        />
      )}

      <ApplicationDetails application={application} />
    </div>
  );
}

