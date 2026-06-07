import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// 🛠 SİHİRLİ FONKSİYON: Kirli JSON dosyasını okur, bozuk satır atlamalarını siler ve onarır.
function getCleanedData(fileName: string) {
  try {
    // Projenin ana dizinindeki 'data' klasörüne gider
    const filePath = path.join(process.cwd(), "data", fileName);
    const rawText = fs.readFileSync(filePath, "utf8");

    // Tüm fiziksel \n ve \r (satır atlama) karakterlerini tek bir boşlukla değiştirir.
    // Bu sayede "IPHONE 12\nPRO" metni "IPHONE 12 PRO" olur, JSON asla kırılmaz!
    const cleanedText = rawText.replace(/\r?\n|\r/g, " ");

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error(
      `HATA: ${fileName} dosyası okunamadı veya parse edilemedi!`,
      error,
    );
    return { products: [], categories: [] }; // Kodun çökmemesi için boş döner
  }
}

async function seedDatabase() {
  try {
    // 1. Dosyaları onararak içeri alıyoruz (Artık üstte import kullanmıyoruz!)
    const samsungData = getCleanedData("samsung.json");
    const appleData = getCleanedData("apple.json");
    const huwaiData = getCleanedData("huwai.json");
    const oppoData = getCleanedData("oppo.json");
    const xiaomiData = getCleanedData("xiaomi.json");
    const homepageData = getCleanedData("homepage.json");

    // 2. TÜM MARKALARIN VE ANASAYFANIN ÜRÜNLERİNİ BİRLEŞTİRİYORUZ
    // 2. TÜM MARKALARIN VE ANASAYFANIN ÜRÜNLERİNİ TEK BİR DİZİDE BİRLEŞTİRİYORUZ
    const allProductsArray = [
      ...(samsungData.products || []),
      ...(appleData.products || []),
      ...(huwaiData.products || []),
      ...(oppoData.products || []),
      ...(xiaomiData.products || []),
      ...(homepageData.products || []),
    ];

    // YENİ: Ürünleri tekilleştiriyoruz (ID bazlı)
    const uniqueProductsMap = new Map();
    allProductsArray.forEach((p) => {
      if (p.id) uniqueProductsMap.set(p.id, p);
    });
    const allProducts = Array.from(uniqueProductsMap.values());

    console.log(
      `Toplam ${allProducts.length} tekil ana ürün/kutu işleniyor...`,
    );

    // --- KATEGORİLERİ YÜKLEME ---
    const categoryMap = new Map();

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

    // BATCH INSERT
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
      message: "Veri tabanı defansif yöntemle başarıyla tohumlandı!",
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

export async function GET() {
  return await seedDatabase();
}
export async function POST() {
  return await seedDatabase();
}
