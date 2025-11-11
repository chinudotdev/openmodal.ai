import { getReportComments } from "@/actions/comments";
import { ReportCommentSection } from "./comment-section";

interface CommentSectionWrapperProps {
  reportId: string;
}

export async function CommentSectionWrapper({
  reportId,
}: CommentSectionWrapperProps) {
  const comments = await getReportComments(reportId);

  return (
    <ReportCommentSection reportId={reportId} initialComments={comments} />
  );
}
