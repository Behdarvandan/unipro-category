import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const rawId = resolvedParams?.id;
  if (!rawId) return notFound();

  const { data: productData } = await supabase
    .from("products")
    .select("id, name, box_code")
    .eq("id", parseInt(rawId, 10))
    .single();

  if (!productData) return notFound();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">{productData.name}</h1>
    </div>
  );
}
