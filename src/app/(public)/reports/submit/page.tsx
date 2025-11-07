import { ReportTypeSelector } from "./_components/report-type-selector";

export default async function SubmitReportPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Submit New Report</h1>
        <p className="text-muted-foreground">
          Help track AI's impact on jobs and careers by sharing real-world
          automation reports
        </p>
      </div>
      <ReportTypeSelector />
    </div>
  );
}
