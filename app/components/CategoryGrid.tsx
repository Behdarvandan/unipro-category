"use client";

import { useState, useMemo } from "react";

type ProductModel = {
  id: string;
  model_name: string;
  sort_order: number;
  is_new: boolean;
};

type Product = {
  id: number;
  name: string;
  box_code: string;
  box_code_note: string;
  capacity: string;
  product_code: string;
  specs: any;
  product_models: ProductModel[];
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
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header & Search */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">
            Kategoriler
          </h1>

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
              className="block w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
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
            <p className="text-slate-600 font-medium">
              {searchQuery
                ? `${filteredCategories.length} sonuç bulundu`
                : `Toplam ${categories.length} kategori`}
            </p>
            {searchQuery && (
              <span className="text-sm text-slate-700 bg-white px-3 py-1 rounded-full font-medium shadow-sm">
                &quot;{searchQuery}&quot; için arama yapılıyor
              </span>
            )}
          </div>
        </div>

        {/* Grid Layout */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-4">
              <svg
                className="w-8 h-8 text-slate-400"
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
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Sonuç bulunamadı
            </h3>
            <p className="text-slate-600">
              &quot;{searchQuery}&quot; için eşleşen kategori veya ürün
              bulunamadı
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1"
              >
                {/* Category Card */}
                <div className="p-6">
                  {/* Category Header with Color Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-slate-800 leading-tight mb-2">
                        {category.name}
                      </h2>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wide"
                          style={{
                            backgroundColor: `${category.color}15`,
                            color: category.color || "#007bff",
                          }}
                        >
                          {category.prefix || `Cat ${category.id}`}
                        </span>
                      </div>
                    </div>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color || "#007bff" }}
                      />
                    </div>
                  </div>

                  {/* Product count */}
                  <div className="border-t border-slate-100 pt-4 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 font-medium">
                        Ürün Sayısı
                      </span>
                      <span className="text-sm font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg">
                        {category.products?.length || 0}
                      </span>
                    </div>
                  </div>

                  {/* Products preview (first 2 with details) */}
                  {category.products && category.products.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Ürün Örnekleri
                      </p>
                      <div className="space-y-2">
                        {category.products.slice(0, 2).map((product) => (
                          <div
                            key={product.id}
                            className="bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-slate-200 transition-colors duration-200"
                          >
                            {/* Product Header */}
                            <div className="mb-2">
                              <div className="font-semibold text-sm text-slate-800 truncate mb-1.5">
                                {product.name}
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {product.box_code && (
                                  <span className="text-[10px] text-slate-600 bg-white px-2 py-0.5 rounded-md font-medium">
                                    📦 {product.box_code}
                                  </span>
                                )}
                                {product.product_code && (
                                  <span className="text-[10px] text-slate-600 bg-white px-2 py-0.5 rounded-md font-medium">
                                    🔖 {product.product_code}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Product Models */}
                            {product.product_models &&
                              product.product_models.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-200">
                                  <div className="text-[10px] text-slate-500 font-medium mb-1.5">
                                    Uyumlu Modeller (
                                    {product.product_models.length})
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {product.product_models
                                      .slice(0, 5)
                                      .map((model) => (
                                        <span
                                          key={model.id}
                                          className="inline-flex items-center gap-1 text-[9px] bg-white text-slate-700 px-2 py-0.5 rounded-md font-medium border border-slate-200"
                                        >
                                          {model.is_new && (
                                            <span className="text-amber-500">
                                              ✨
                                            </span>
                                          )}
                                          {model.model_name}
                                        </span>
                                      ))}
                                    {product.product_models.length > 5 && (
                                      <span className="text-[9px] text-slate-400 px-2 py-0.5 font-medium">
                                        +{product.product_models.length - 5}{" "}
                                        daha
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                      {category.products.length > 2 && (
                        <p className="text-xs text-slate-400 font-medium mt-3">
                          +{category.products.length - 2} ürün daha...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
