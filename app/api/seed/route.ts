import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 1. TÜM JSON DOSYALARINI İÇERİ AKTARIYORUZ
import samsungData from "@/data/samsung.json";
import appleData from "@/data/apple.json";
import huwaiData from "@/data/huwai.json";
import oppoData from "@/data/oppo.json";
import xiaomiData from "@/data/xiaomi.json";
import homepageData from "@/data/homepage.json";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Asıl işlemi yapacak ana fonksiyon
async function seedDatabase() {
  try {
    // 2. TÜM MARKALARIN VE ANASAYFANIN ÜRÜNLERİNİ TEK BİR DİZİDE BİRLEŞTİRİYORUZ
    const allProducts = [
      ...(samsungData.products || []),
      ...(appleData.products || []),
      ...(huwaiData.products || []),
      ...(oppoData.products || []),
      ...(xiaomiData.products || []),
      ...(homepageData.products || []),
    ];

    console.log(`Toplam ${allProducts.length} ana ürün/kutu işleniyor...`);

    // --- KATEGORİLERİ YÜKLEME ---
    const categoryMap = new Map();

    // Önce homepage.json içindeki orijinal kategorileri ekliyoruz
    if (homepageData.categories) {
      homepageData.categories.forEach((c: any) => {
        categoryMap.set(c.id, {
          id: c.id,
          name: c.name,
          color: c.color || "#007bff",
          prefix: c.prefix || null,
        });
      });
    }

    // Sonra ürünlerin içinden eksik kategori kalmış mı diye kontrol ediyoruz
    allProducts.forEach((p) => {
      if (!categoryMap.has(p.categoryId)) {
        categoryMap.set(p.categoryId, {
          id: p.categoryId,
          name: p.category_name,
          color: p.color || "#007bff",
          prefix: null,
        });
      }
    });

    const categoriesToInsert = Array.from(categoryMap.values());
    const { error: catError } = await supabase
      .from("categories")
      .upsert(categoriesToInsert, { onConflict: "id" });

    if (catError) throw new Error(`Kategori Hatası: ${catError.message}`);

    // --- ANA ÜRÜNLERİ (KUTULARI) YÜKLEME ---
    const productsToInsert = allProducts.map((p) => ({
      id: p.id,
      category_id: p.categoryId,
      name: p.name,
      box_code: p.boxCode,
      box_code_note: p.boxCodeNote,
      capacity: p.capacity,
      product_code: p.productCode,
      specs: {},
    }));

    const { error: prodError } = await supabase
      .from("products")
      .upsert(productsToInsert, { onConflict: "id" });

    if (prodError) throw new Error(`Ürün Hatası: ${prodError.message}`);

    // --- TELEFON MODELLERİNİ (ARAMA HEDEFLERİNİ) YÜKLEME ---
    let modelsToInsert: any[] = [];
    allProducts.forEach((p) => {
      // DİKKAT: DEFANSİF PROGRAMLAMA BURADA - Sadece geçerli bir dizi (Array) ise döngüye gir!
      if (p.mobiles && Array.isArray(p.mobiles) && p.mobiles.length > 0) {
        p.mobiles.forEach((m: any) => {
          modelsToInsert.push({
            id: m.mid,
            product_id: p.id,
            model_name: m.model,
            sort_order: m.sort || 0,
            is_new: m.isNew || false,
          });
        });
      }
    });

    console.log(
      `Toplam ${modelsToInsert.length} alt telefon modeli veri tabanına yazılıyor...`,
    );

    // BATCH INSERT (1000'erli paketler halinde atıyoruz ki sistem kilitlenmesin)
    const BATCH_SIZE = 1000;
    for (let i = 0; i < modelsToInsert.length; i += BATCH_SIZE) {
      const batch = modelsToInsert.slice(i, i + BATCH_SIZE);
      const { error: modelError } = await supabase
        .from("product_models")
        .upsert(batch, { onConflict: "id" });

      if (modelError)
        throw new Error(
          `Model Yükleme Hatası (Batch ${i}): ${modelError.message}`,
        );
    }

    return NextResponse.json({
      success: true,
      message: "Veri tabanı başarıyla tohumlandı!",
      stats: {
        categories: categoriesToInsert.length,
        products: productsToInsert.length,
        models: modelsToInsert.length,
      },
    });
  } catch (error: any) {
    console.error("Seed Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// 405 Hatasını önlemek için hem tarayıcıdan (GET) hem POST'tan tetiklenebilir yapıyoruz.
export async function GET() {
  return await seedDatabase();
}

export async function POST() {
  return await seedDatabase();
}
