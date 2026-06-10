"use client";

import { useState, useEffect, useRef } from "react"; // ✅ useRef eklendi (dışarı tıklama kontrolü için)
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// 🎨 Kategori renk ve ikon sistemi
const CATEGORY_COLORS: {
  [key: number]: { bg: string; text: string; border: string; icon: string };
} = {
  4: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: "🛡️",
  },
  5: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    icon: "✨",
  },
  6: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    icon: "🔒",
  },
  7: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    icon: "🌟",
  },
};

// ⚡ Veritabanından gelen BİREBİR aynı tipler
type SearchResult = {
  id: string;
  model_name: string;
  product_id: number;
  product_name: string;
  box_code: string;
  category_id: number;
  category_name: string;
};

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // ✅ UX İYİLEŞTİRME: Dışarı tıklama kontrolü için ref
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 🚀 PERFORMANS: 300ms Debounce - Kullanıcı yazmayı bitirdikten sonra arama yapar
    const timer = setTimeout(() => {
      const cleanedTerm = searchTerm.trim();

      // ✅ GÜVENLİK: Boş veya sadece boşluk karakteri kontrolü
      if (cleanedTerm.length === 0) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      // ✅ GÜVENLİK: Minimum uzunluk kontrolü (spam koruması)
      if (cleanedTerm.length < 2) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      // ✅ GÜVENLİK: Maksimum uzunluk kontrolü (DoS koruması)
      if (cleanedTerm.length > 100) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      fetchResults();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ✅ UX İYİLEŞTİRME: Dışarı tıklama olayını dinle
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Eğer tıklanan yer searchBarRef dışındaysa sonuçları kapat
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        setResults([]); // Sonuçları temizle
        setHasSearched(false); // Arama durumunu sıfırla
      }
    };

    // mousedown event listener ekle
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup: Bileşen unmount olduğunda listener'ı kaldır
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // Boş dependency array - sadece mount/unmount'ta çalışır

  const fetchResults = async () => {
    // ✅ GÜVENLİK: Zaten yükleme yapılıyorsa yeni sorgu başlatma (race condition koruması)
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const query = searchTerm.trim();

      // ✅ GÜVENLİK: Boş/undefined/sadece boşluk kontrolü
      if (!query || query.length === 0) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      // ✅ GÜVENLİK: SQL Injection koruması - Tehlikeli karakterleri temizle
      // PostgREST zaten parametrize sorgu kullanır ama ekstra güvenlik katmanı
      const sanitizedQuery = query
        .replace(/[;'"\\]/g, "") // Tehlikeli karakterleri kaldır
        .substring(0, 100); // Maksimum 100 karakter

      // ✅ GÜVENLİK: Sanitize sonrası boşluk kontrolü
      if (!sanitizedQuery || sanitizedQuery.length === 0) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      // 🔧 DÜZELTME: İki ayrı sorgu atıyoruz (PostgREST PGRST100 hatası önleme)
      // ❌ SORUN: Tek .or() içinde hem ana tablo hem foreign tablo aranamaz
      // ✅ ÇÖZÜM: products ve product_models için ayrı sorgular + JavaScript birleştirme

      // 📦 SORGU 1: products tablosunda ürün adı VE kutu kodu araması
      // 🎯 Çift tırnak kullanımı önemli: "%${sanitizedQuery}%" formatı
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          box_code,
          category_id,
          categories!inner (
            id,
            name
          ),
          product_models (
            id,
            model_name,
            product_id
          )
        `,
        )
        .or(
          `name.ilike."%${sanitizedQuery}%",box_code.ilike."%${sanitizedQuery}%"`,
        ) // ✅ Sanitized query kullan
        .limit(50);

      if (productsError) throw productsError;

      // 📱 SORGU 2: product_models tablosunda model adı araması
      const { data: modelsData, error: modelsError } = await supabase
        .from("product_models")
        .select(
          `
          id,
          model_name,
          product_id,
          products!inner (
            id,
            name,
            box_code,
            category_id,
            categories!inner (
              id,
              name
            )
          )
        `,
        )
        .or(`model_name.ilike."%${sanitizedQuery}%"`) // ✅ Sanitized query kullan
        .limit(50);

      if (modelsError) throw modelsError;

      // 🔄 Products sonuçlarını düzleştir (flatten) - Her ürünün her modeli için ayrı satır
      const flattenedProductsResults: SearchResult[] = (
        productsData || []
      ).flatMap((product: any) =>
        (product.product_models || []).map((model: any) => ({
          id: model.id,
          model_name: model.model_name,
          product_id: product.id,
          product_name: product.name,
          box_code: product.box_code,
          category_id: product.category_id,
          category_name: product.categories.name,
        })),
      );

      // 🔄 Models sonuçlarını düzleştir (flatten)
      const flattenedModelsResults: SearchResult[] = (modelsData || []).map(
        (item: any) => ({
          id: item.id,
          model_name: item.model_name,
          product_id: item.products.id,
          product_name: item.products.name,
          box_code: item.products.box_code,
          category_id: item.products.category_id,
          category_name: item.products.categories.name,
        }),
      );

      // 🔀 İki sorguyu JavaScript seviyesinde birleştir
      const combinedResults = [
        ...flattenedProductsResults,
        ...flattenedModelsResults,
      ];

      // 🎯 Tekrar edenleri temizle (aynı model_id + product_id kombinasyonu)
      const uniqueResults = combinedResults.filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (t) => t.id === item.id && t.product_id === item.product_id,
          ),
      );

      // 📊 Alfabetik sıralama
      uniqueResults.sort((a, b) => a.model_name.localeCompare(b.model_name));

      // 🎯 İlk 50 sonuçla sınırla (DoS koruması)
      setResults(uniqueResults.slice(0, 50));
    } catch (error) {
      // ❌ HATA YÖNETİMİ: Kullanıcıya detaylı hata gösterme (güvenlik)
      console.error("Arama hatası:", error);
      setResults([]);

      // Hata durumunda kullanıcıya bilgi ver (production'da detay gösterme)
      if (process.env.NODE_ENV === "development") {
        console.error("Arama hatası detayı:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Kategori rengini al (default: mavi)
  const getCategoryColor = (categoryId: number) => {
    return CATEGORY_COLORS[categoryId] || CATEGORY_COLORS[4];
  };

  return (
    <div ref={searchBarRef} className="relative w-full max-w-2xl mx-auto">
      {" "}
      {/* ✅ ref eklendi */}
      {/* 🔍 Arama Kutusu */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            // ✅ GÜVENLİK: Maksimum karakter sınırı (input seviyesinde)
            const newValue = e.target.value.substring(0, 100);
            setSearchTerm(newValue);
          }}
          placeholder="Model arayın... (Örn: iPhone 15, Samsung S24, Xiaomi 14)"
          maxLength={100}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          className="w-full px-5 py-4 pl-12 text-lg bg-white border-2 border-blue-600 rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 placeholder-slate-400"
        />
        <svg
          className="absolute left-4 top-4 h-6 w-6 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      {/* 📋 Arama Sonuçları Dropdown - Şık ve Modern */}
      {hasSearched && searchTerm.length >= 2 && (
        <div className="absolute w-full mt-3 bg-white border-2 border-gray-100 rounded-2xl shadow-2xl z-50 max-h-[32rem] overflow-y-auto overflow-x-hidden backdrop-blur-sm">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500 font-medium">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 border-4 border-blue-400 border-b-transparent rounded-full animate-spin animate-reverse"></div>
                  </div>
                </div>
                <p className="text-lg font-semibold text-slate-700">
                  10.000+ Model Taranıyor...
                </p>
                <p className="text-sm text-slate-400">Lütfen bekleyin</p>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="py-1">
              {/* Sonuç Sayısı */}
              <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-slate-200">
                <p className="text-sm font-semibold text-slate-700">
                  <span className="text-blue-600 text-lg">
                    {results.length}
                  </span>{" "}
                  sonuç bulundu
                  {results.length === 50 && (
                    <span className="ml-2 text-xs text-orange-600 font-medium">
                      (İlk 50 sonuç gösteriliyor)
                    </span>
                  )}
                </p>
              </div>

              {/* 🎯 SONUÇ KARTLARI - Kurumsal ve Şık */}
              {results.map((item, index) => {
                const categoryColor = getCategoryColor(item.category_id);
                return (
                  <Link
                    key={`${item.id}-${index}`}
                    href={`/category/${item.category_id}`}
                    className="block border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-200 last:border-0 group"
                  >
                    <div className="p-4 flex items-center justify-between gap-4">
                      {/* Sol Taraf: Model ve Ürün Bilgisi */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-700 transition-colors truncate">
                            {item.model_name}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-600 truncate mb-2">
                          {item.product_name}
                        </p>

                        {/* Kategori Badge */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold ${categoryColor.bg} ${categoryColor.text} border ${categoryColor.border} rounded-md`}
                          >
                            <span className="text-sm">
                              {categoryColor.icon}
                            </span>
                            <span className="truncate max-w-[200px]">
                              {item.category_name}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Sağ Taraf: Kutu Kodu Badge */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                          Uyumlu Kutu
                        </span>
                        <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-xl font-mono font-bold shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200 text-sm">
                          {item.box_code}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <div className="text-6xl mb-4 animate-bounce">📵</div>
              <p className="text-slate-900 font-bold text-xl mb-2">
                "{searchTerm}" modeli bulunamadı
              </p>
              <p className="text-slate-500 text-sm max-w-md">
                Lütfen model adını, ürün adını veya kutu kodunu kontrol edip
                tekrar deneyin.
              </p>
              <div className="mt-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  💡 İpucu: "Samsung A51", "iPhone 13" veya model kodu ile
                  arayabilirsiniz
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
