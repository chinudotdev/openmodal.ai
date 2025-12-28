import { IndustryForm } from "./industry-form";

export async function IndustriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <IndustryForm industryId={id} />
    </div>
  );
}
