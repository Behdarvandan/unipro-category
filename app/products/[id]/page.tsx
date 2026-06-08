import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

// Her zaman güncel veriyi çek
export const revalidate = 0;

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

type Category = {
  id: number;
  name: string;
  color: string;
  prefix: string | null;
};

type ProductWithCategory = Product & {
  categories: Category;
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // URL'den gelen id parametresini al (Next.js 15'te params bir Promise)
  const { id: productId } = await params;

  // Supabase'den ürün detaylarını ve ilişkili bilgileri çek
  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      *,
      categories (
        id,
        name,
        color,
        prefix
      ),
      product_models (
        id,
        model_name,
        sort_order,
        is_new
      )
    `,
    )
    .eq("id", productId)
    .single();

  // Hata veya ürün bulunamadıysa 404 sayfasına yönlendir
  if (error || !product) {
    notFound();
  }

  const typedProduct = product as ProductWithCategory;
  const category = typedProduct.categories;

  // Modelleri sort_order'a göre sırala
  const sortedModels =
    typedProduct.product_models?.sort((a, b) => a.sort_order - b.sort_order) ||
    [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Geri Dön Butonu */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200 group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>

        {/* Ürün Detay Kartı */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          {/* Header - Kategori Bilgisi */}
          {category && (
            <div
              className="px-8 py-6 border-b border-slate-100"
              style={{
                backgroundColor: `${category.color}08`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <div
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Kategori</p>
                  <h3 className="text-xl font-bold text-slate-900">
                    {category.name}
                  </h3>
                </div>
                {category.prefix && (
                  <span
                    className="ml-auto px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${category.color}15`,
                      color: category.color,
                    }}
                  >
                    {category.prefix}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Ürün Ana Bilgileri */}
          <div className="px-8 py-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 leading-tight">
              {typedProduct.name}
            </h1>

            {/* Bilgi Kartları */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {/* Box Code */}
              {typedProduct.box_code && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200/50">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📦</div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                        Stok Kodu
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {typedProduct.box_code}
                      </p>
                      {typedProduct.box_code_note && (
                        <p className="text-sm text-slate-600 mt-1">
                          {typedProduct.box_code_note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Product Code */}
              {typedProduct.product_code && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-5 border border-purple-200/50">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🔖</div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
                        Ürün Kodu
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {typedProduct.product_code}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Capacity */}
              {typedProduct.capacity && (
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200/50">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">💾</div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
                        Kapasite
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {typedProduct.capacity}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ID */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-5 border border-slate-200/50">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🆔</div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                      Ürün ID
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      #{typedProduct.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Specs (Özellikler) */}
            {typedProduct.specs &&
              Object.keys(typedProduct.specs).length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">⚙️</span>
                    Özellikler
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(typedProduct.specs).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-white rounded-xl p-4 border border-slate-200"
                      >
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                          {key}
                        </p>
                        <p className="text-sm font-medium text-slate-900">
                          {String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Uyumlu Modeller */}
            {sortedModels.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📱</span>
                  Uyumlu Modeller
                  <span className="ml-2 text-sm font-semibold bg-amber-200 text-amber-800 px-3 py-1 rounded-full">
                    {sortedModels.length} adet
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sortedModels.map((model, index) => (
                    <div
                      key={model.id}
                      className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-400">
                              #{index + 1}
                            </span>
                            {model.is_new && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                ✨ YENİ
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-slate-900">
                            {model.model_name}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Model yoksa bilgilendirme */}
            {sortedModels.length === 0 && (
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 text-center">
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
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Model Bilgisi Yok
                </h3>
                <p className="text-slate-600">
                  Bu ürün için henüz uyumlu model bilgisi eklenmemiş.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Alt Bilgilendirme */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Ürün bilgilerinde güncelleme gerekiyorsa lütfen yönetici ile
            iletişime geçin.
          </p>
        </div>
      </div>
    </div>
  );
}
