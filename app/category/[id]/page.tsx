import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const revalidate = 1800;

export default async function CategoryPage(props: any) {
  const resolvedParams = await props.params;
  const rawId = resolvedParams?.id;

  if (!rawId) return notFound();
  const categoryId = parseInt(rawId, 10);
  if (isNaN(categoryId)) return notFound();

  // Nokta atışı sorgu: asla yıldız (*) veya 'created_at' içermez!
  const { data: categoryData, error } = await supabase
    .from("categories")
    .select("id, name, prefix, products(id, name, box_code, product_code)")
    .eq("id", categoryId)
    .maybeSingle();

  if (error || !categoryData) {
    console.error("Veritabanı hatası:", error);
    return notFound();
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {categoryData.name}
        </h1>
        {categoryData.prefix && (
          <p className="text-sm text-gray-400 mt-1">
            Önek: {categoryData.prefix}
          </p>
        )}
      </header>
      <div className="text-sm text-gray-600 mb-4">
        Toplam Ürün: {categoryData.products?.length || 0}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categoryData.products?.map((product: any) => (
          <div
            key={product.id}
            className="border rounded-xl p-4 bg-white shadow-sm"
          >
            <h3 className="font-bold text-gray-900">{product.name}</h3>
            <p className="text-xs text-gray-500 mt-1">
              Kutu Kodu: {product.box_code}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
