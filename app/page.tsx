import { supabase } from "@/lib/supabase";
import Link from "next/link";

// Next.js'e bu sayfanın her zaman güncel veriyi çekmesi gerektiğini söylüyoruz (SSR)
export const revalidate = 0;

export default async function HomePage() {
  // Buluttaki Supabase'den tüm kategorileri id sırasına göre çekiyoruz
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="rounded-xl bg-red-50 p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-red-600">
            Veriler yüklenirken bir hata oluştu.
          </p>
          <p className="mt-1 text-xs text-red-500">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        {/* Üst Başlık ve Logo Alanı */}
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          UNIPRO
        </h1>
        <p className="mt-3 text-base text-gray-600">
          Kurumsal Ürün Kataloğu ve Uyumluluk Listesi
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Lütfen incelemek istediğiniz markayı seçin.
        </p>

        {/* Kategorilerin Listelendiği Kart Alanı */}
        <div className="mt-10 grid grid-cols-1 gap-4">
          {categories?.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="group relative flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm border border-gray-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            >
              <div className="flex items-center space-x-4">
                {/* Şık Klasör/Kategori İkonu Görünümü */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-base font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </span>
              </div>

              {/* Sağ Ok İkonu */}
              <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                <svg
                  className="h-5 w-5 transform transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Alt Bilgi */}
        <footer className="mt-16 text-center text-xs text-gray-400">
          &copy; 2026 UNIPRO Catalog. Tüm hakları saklıdır.
        </footer>
      </div>
    </main>
  );
}
