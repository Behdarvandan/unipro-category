import { supabase } from "@/lib/supabase";
import CategoryGrid from "./components/CategoryGrid";
import SearchBar from "./components/SearchBar";

// ⚡ MİMARİ DOKUNUŞ: Sayfayı her istekte sıfırdan oluşturmak yerine,
// Arka planda saatte bir (3600 saniye) önbelleğe (Cache) alıyoruz.
// Katalog güncellendiğinde Supabase şemasını yormamış oluruz.
export const revalidate = 3600;

export default async function HomePage() {
  // 🎯 OPTİMİZASYON: Sadece anasayfada göstereceğimiz hafif Kategori verisini çekiyoruz.
  // Altındaki ürünleri ve binlerce modeli buraya yükleyerek RAM'i şişirmiyoruz!
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, prefix")
    .order("id", { ascending: true });

  // Hata yönetimi katmanı
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <h1 className="text-2xl font-bold text-red-800 mb-2">
              Sistem Hatası
            </h1>
            <p className="text-red-700">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Üst Sabit Arama Bölümü */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              📱 Unipro Katalog & Model Arama
            </h1>
            {/* Optimize ettiğimiz akıllı arama barı */}
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Kategoriler Listesi */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Ürün Grupları</h2>
          <p className="text-sm text-gray-500 mt-1">
            Lütfen incelemek istediğiniz Unipro serisini seçin.
          </p>
        </div>
        <CategoryGrid categories={categories || []} />
      </main>
    </div>
  );
}
