import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserReports } from "@/actions/reports";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { MyReportsList } from "./my-reports-list";

export async function MyReportsContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?callbackURL=/my-reports");
  }

  const reports = await getUserReports(session.user.id, true);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Reports</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all your reports, including drafts
        </p>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center">
              You haven't created any reports yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <MyReportsList reports={reports} />
      )}
    </div>
  );
}
