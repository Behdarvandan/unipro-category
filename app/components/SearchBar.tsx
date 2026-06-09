"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// ⚡ Veritabanından gelen BİREBİR aynı tipler
type SearchResult = {
  id: string;
  model_name: string;
  product_id: number;
  product_name: string;
  box_code: string;
  category_id: number;
};

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Kullanıcı yazmayı bitirdikten 300ms sonra arama yapar (Performans için)
    const timer = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        fetchResults();
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchResults = async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      // ⚡ Yaptığımız o muazzam SQL fonksiyonunu çağırıyoruz
      const { data, error } = await supabase.rpc("search_phone_models", {
        search_query: searchTerm.trim(),
      });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error("Arama hatası:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* 🔍 Arama Kutusu */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Telefon modeli arayın... (Örn: iPhone 15, S24)"
          className="w-full px-5 py-4 pl-12 text-lg bg-white border-2 border-blue-500 rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-gray-800 placeholder-gray-400"
        />
        <svg
          className="absolute left-4 top-4 h-6 w-6 text-blue-500"
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

      {/* 📋 Arama Sonuçları Dropdown */}
      {hasSearched && searchTerm.length >= 2 && (
        <div className="absolute w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto overflow-x-hidden">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500 font-medium">
              <div className="animate-pulse flex flex-col items-center gap-2">
                <div className="h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p>Modeller Taranıyor...</p>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((item, index) => (
                // Sonuç Kartı
                <Link
                  key={`${item.id}-${index}`}
                  href={`/category/${item.category_id}`}
                  className="flex items-center justify-between p-4 hover:bg-blue-50 border-b border-gray-50 transition-colors last:border-0"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-lg">
                      {item.model_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {item.product_name}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                      Uyumlu Kutu
                    </span>
                    <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-lg font-mono font-bold border border-blue-200 shadow-sm">
                      {item.box_code}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <div className="text-4xl mb-3">📵</div>
              <p className="text-gray-900 font-medium text-lg">
                "{searchTerm}" modeli bulunamadı.
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Lütfen marka veya modeli kontrol edip tekrar deneyin.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
