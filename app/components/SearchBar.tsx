"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// Client-side Supabase istemcisi
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 🎯 DOĞRULANMIŞ TİP TANIMI: RPC fonksiyonumuzun döndürdüğü gerçek şema ile %100 uyumlu
interface SearchResult {
  model_id: string;
  model_name: string;
  product_id: number;
  box_code: string;
  category_id: number;
}

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklandığında dropdown'u kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ⚡ Race Condition (Yarış Durumu) ve Debounce Çözümü
  useEffect(() => {
    // İstek iptal kontrolcüsü (Race Condition önleyici)
    let isCurrentRequest = true;

    if (searchTerm.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // 300ms Debounce geciktirmesi [cite: 26]
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Doğrudan GIN indeksli RPC fonksiyonunu tetikliyoruz [cite: 176, 281]
        const { data, error } = await supabase.rpc("search_phone_models", {
          search_term: searchTerm.trim(),
        });

        // Eğer bu süreçte kullanıcı yeni bir harfe bastıysa, eski isteğin sonucunu state'e yazma!
        if (!isCurrentRequest) return;

        if (error) {
          console.error("Arama hatası:", error);
          setResults([]);
        } else {
          setResults(data || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Beklenmeyen hata:", err);
        setResults([]);
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }, 300);

    // Temizleme fonksiyonu: Yeni harfe basıldığında hem timer'ı iptal eder
    // hem de havada kalan eski isteğin geçersiz olduğunu işaretler.
    return () => {
      isCurrentRequest = false;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  return (
    <div ref={searchContainerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Arama Input Alanı */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Model ara... (örn: iPhone 15, Galaxy S24)"
          className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm bg-white text-gray-900"
        />

        {/* Sağ Taraf: Loading veya Temizleme Butonu */}
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
          ) : searchTerm.length > 0 ? (
            <button
              onClick={() => {
                setSearchTerm("");
                setResults([]);
                setIsOpen(false);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* Dropdown Sonuç Listesi */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-96 overflow-y-auto duration-200">
          <div className="p-2">
            <div className="text-xs text-gray-400 px-3 py-2 font-medium tracking-wider uppercase">
              Uyumlu Modeller ({results.length} Sonuç)
            </div>
            {results.map((result) => (
              <a
                key={result.model_id}
                href={`/category/${result.category_id}?product=${result.product_id}`}
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {result.model_name}
                      </span>
                    </div>
                    {/* Veritabanımızdan gelen gerçek box_code alanını basıyoruz */}
                    <div className="text-xs font-mono bg-gray-100 text-gray-600 inline-block px-2 py-0.5 rounded mt-1">
                      Kutu Kodu: {result.box_code}
                    </div>
                  </div>
                  <div className="text-xs text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    İncele →
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Sonuç Bulunamadı Arayüzü */}
      {isOpen &&
        !isLoading &&
        searchTerm.length > 0 &&
        results.length === 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-6 text-center">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">
                &quot;{searchTerm}&quot;
              </span>{" "}
              için uyumlu ürün kutusu bulunamadı.
            </p>
          </div>
        )}
    </div>
  );
}
