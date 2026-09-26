import EditCategoryForm from "@/components/edit-category-form";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditCategoryForm categoryId={id} />;
}
