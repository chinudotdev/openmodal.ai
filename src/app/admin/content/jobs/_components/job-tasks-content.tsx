import { getAdminJobById, getAllCapabilitiesForSelect } from "@/actions/admin-content";
import { JobFormStep2 } from "./job-form-step2";

export async function JobTasksContent({ params }: { params: Promise<{ id: string }>;}) {
    const { id } = await params;
    const [jobData, capabilities] = await Promise.all([
      getAdminJobById(id),
      getAllCapabilitiesForSelect(),
    ]);
  
    return (
      <JobFormStep2
        jobId={id}
        initialJobData={jobData}
        initialCapabilities={capabilities}
      />
    );
  }