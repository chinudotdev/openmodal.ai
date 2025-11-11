import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkExpertEligibility } from "@/actions/gamification";
import { getExpertApplicationStatus } from "@/actions/expert-application";
import { ExpertApplicationForm } from "./expert-application-form";

export async function ApplyExpertContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?callbackURL=/dashboard/apply-expert");
  }

  // Check if already has application
  const existingApplication = await getExpertApplicationStatus(session.user.id);
  if (existingApplication) {
    redirect("/dashboard/expert-application");
  }

  // Check eligibility
  const eligibility = await checkExpertEligibility(session.user.id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Apply to Become an Expert</h1>
      </div>

      <ExpertApplicationForm eligibility={eligibility} />
    </div>
  );
}

