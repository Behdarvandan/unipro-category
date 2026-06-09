// @ts-nocheck
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
  category_id: number;
  product_models: ProductModel[];
};

type CategoryFiltersProps = {
  allModels: ProductModel[];
  products: Product[];
};

export default function CategoryFilters({
  allModels,
  products,
}: CategoryFiltersProps) {
  const [selectedBrand, setSelectedBrand] = useState<string>("");

  // Dinamik marka listesi oluştur
  const brands = useMemo(() => {
    const brandSet = new Set<string>();

    allModels.forEach((model) => {
      // Model adından ilk kelimeyi ayıkla (Marka)
      // Örn: "SAMSUNG S24" -> "SAMSUNG", "IPHONE 15 PRO" -> "IPHONE"
      const firstWord = model.model_name.trim().split(/\s+/)[0];
      if (firstWord) {
        brandSet.add(firstWord.toUpperCase());
      }
    });

    // Alfabetik sırala
    return Array.from(brandSet).sort();
  }, [allModels]);

  // Filtreleme işlemi
  const handleBrandFilter = (brand: string) => {
    setSelectedBrand(brand);

    // Tüm ürün kartlarını göster
    const productCards = document.querySelectorAll("[data-product-id]");

    if (!brand) {
      // Filtre kaldırıldı - hepsini göster
      productCards.forEach((card) => {
        (card as HTMLElement).style.display = "block";
      });
      return;
    }

    // Her ürün kartını kontrol et
    productCards.forEach((card) => {
      const modelElements = card.querySelectorAll("[data-model-name]");
      let hasMatchingModel = false;

      // Ürünün modellerini tara
      modelElements.forEach((modelEl) => {
        const modelName = modelEl.getAttribute("data-model-name") || "";
        const modelBrand = modelName.trim().split(/\s+/)[0]?.toUpperCase();

        if (modelBrand === brand) {
          hasMatchingModel = true;
        }
      });

      // Eşleşme varsa göster, yoksa gizle
      (card as HTMLElement).style.display = hasMatchingModel ? "block" : "none";
    });
  };

  // Tümünü göster
  const clearFilter = () => {
    handleBrandFilter("");
  };

  return (
    <div className="space-y-4">
      {/* Başlık */}
      <div className="border-b border-gray-200 pb-3">
        <h2 className="font-bold text-gray-900 text-lg">Filtrele</h2>
        <p className="text-xs text-gray-500 mt-1">
          Marka seçerek ürünleri filtreleyin
        </p>
      </div>

      {/* Marka Listesi */}
      <div>
        <h3 className="font-semibold text-gray-700 text-sm mb-3 uppercase tracking-wide">
          Markalar ({brands.length})
        </h3>

        {brands.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Marka bulunamadı</p>
        ) : (
          <div className="space-y-2">
            {/* Tümü Butonu */}
            <button
              onClick={clearFilter}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedBrand === ""
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tümü ({products.length})
            </button>

            {/* Marka Butonları */}
            {brands.map((brand) => {
              // Bu markaya ait kaç ürün var?
              const productCount = products.filter((product) => {
                return product.product_models?.some((model) => {
                  const modelBrand = model.model_name
                    .trim()
                    .split(/\s+/)[0]
                    ?.toUpperCase();
                  return modelBrand === brand;
                });
              }).length;

              return (
                <button
                  key={brand}
                  onClick={() => handleBrandFilter(brand)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedBrand === brand
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span>{brand}</span>
                    <span
                      className={`text-xs ${
                        selectedBrand === brand
                          ? "text-gray-300"
                          : "text-gray-500"
                      }`}
                    >
                      {productCount}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Aktif Filtre Bilgisi */}
      {selectedBrand && (
        <div className="pt-3 border-t border-gray-200">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-600 font-semibold mb-1">
              Aktif Filtre:
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-blue-900">
                {selectedBrand}
              </span>
              <button
                onClick={clearFilter}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
              >
                Temizle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
