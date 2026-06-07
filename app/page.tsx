import { supabase } from "@/lib/supabase";
import CategoryGrid from "./components/CategoryGrid";

// Her zaman güncel veriyi çek
export const revalidate = 0;

export default async function HomePage() {
  // Supabase'den kategorileri ve ilişkili ürünleri çek (Server-side)
  const { data: categories, error } = await supabase
    .from("categories")
    .select(
      `
      *,
      products (
        id,
        name,
        box_code,
        capacity,
        product_code
      )
    `,
    )
    .order("id", { ascending: true });

  // Hata varsa göster
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <h1 className="text-2xl font-bold text-red-800 mb-2">Hata</h1>
            <p className="text-red-700">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Client component'e veriyi gönder
  return <CategoryGrid categories={categories || []} />;
}
