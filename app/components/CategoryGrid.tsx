"use client";

import { useState, useMemo } from "react";

type Product = {
  id: number;
  name: string;
  box_code: string;
  capacity: string;
  product_code: string;
};

type Category = {
  id: number;
  name: string;
  color: string;
  prefix: string | null;
  products: Product[];
};

type CategoryGridProps = {
  categories: Category[];
};

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrelenmiş kategorileri hesapla
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories;
    }

    const query = searchQuery.toLowerCase();

    return categories
      .map((category) => {
        // Kategori adında arama
        const categoryMatches = category.name.toLowerCase().includes(query);

        // Ürün adlarında arama
        const matchingProducts = category.products?.filter(
          (product) =>
            product.name.toLowerCase().includes(query) ||
            product.box_code?.toLowerCase().includes(query),
        );

        // Kategori adı eşleşiyorsa tüm ürünleri göster
        if (categoryMatches) {
          return category;
        }

        // Ürün eşleşmesi varsa sadece eşleşen ürünleri göster
        if (matchingProducts && matchingProducts.length > 0) {
          return {
            ...category,
            products: matchingProducts,
          };
        }

        return null;
      })
      .filter((category): category is Category => category !== null);
  }, [categories, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header & Search */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Kategoriler</h1>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
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
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kategori veya ürün ara..."
              className="block w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
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
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            )}
          </div>

          {/* Results info */}
          <div className="mt-4 flex items-center gap-4">
            <p className="text-gray-600">
              {searchQuery
                ? `${filteredCategories.length} sonuç bulundu`
                : `Toplam ${categories.length} kategori`}
            </p>
            {searchQuery && (
              <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
                &quot;{searchQuery}&quot; için arama yapılıyor
              </span>
            )}
          </div>
        </div>

        {/* Grid Layout */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sonuç bulunamadı
            </h3>
            <p className="text-gray-600">
              &quot;{searchQuery}&quot; için eşleşen kategori veya ürün
              bulunamadı
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
                style={{
                  borderLeft: `6px solid ${category.color || "#007bff"}`,
                }}
              >
                {/* Category Card */}
                <div className="p-6">
                  {/* Color indicator dot */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: category.color || "#007bff" }}
                    />
                    <h2 className="text-lg font-semibold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h2>
                  </div>

                  {/* Category info badges */}
                  <div className="flex items-center gap-2 mt-4 mb-4">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      ID: {category.id}
                    </span>
                    {category.prefix && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {category.prefix}
                      </span>
                    )}
                  </div>

                  {/* Product count */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Ürün Sayısı:
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {category.products?.length || 0}
                      </span>
                    </div>
                  </div>

                  {/* Products preview (first 3) */}
                  {category.products && category.products.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Ürün Örnekleri:
                      </p>
                      <div className="space-y-1.5">
                        {category.products.slice(0, 3).map((product) => (
                          <div
                            key={product.id}
                            className="text-xs text-gray-700 bg-gray-50 px-3 py-2 rounded-md"
                          >
                            <div className="font-medium truncate">
                              {product.name}
                            </div>
                            {product.box_code && (
                              <div className="text-gray-500 text-[10px] mt-0.5">
                                {product.box_code}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {category.products.length > 3 && (
                        <p className="text-xs text-gray-400 italic mt-2">
                          +{category.products.length - 3} ürün daha...
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Colored footer accent */}
                <div
                  className="h-1 w-full"
                  style={{
                    background: `linear-gradient(90deg, ${category.color || "#007bff"}, transparent)`,
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
