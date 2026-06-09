import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// JSON dosyalarını okuma
function readJSONFile(filename: string): any {
  try {
    const filePath = path.join(process.cwd(), "data", filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`❌ Dosya okuma hatası (${filename}):`, error);
    return null;
  }
}

// Kategorileri veritabanına yükleme
async function seedCategories() {
  console.log("\n🏷️  Kategoriler yükleniyor...");

  const homepageData = readJSONFile("homepage.json");
  if (!homepageData || !homepageData.categories) {
    console.error("❌ homepage.json dosyasında categories bulunamadı!");
    return false;
  }

  const categories = homepageData.categories.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    prefix: cat.prefix || `CAT${cat.id}`, // prefix yoksa default değer
  }));

  try {
    const { data, error } = await supabase
      .from("categories")
      .upsert(categories, { onConflict: "id" })
      .select();

    if (error) {
      console.error("❌ Kategori yükleme hatası:", error);
      return false;
    }

    console.log(`✅ ${categories.length} kategori başarıyla yüklendi!`);
    return true;
  } catch (error) {
    console.error("❌ Beklenmeyen kategori hatası:", error);
    return false;
  }
}

// Ürünleri ve modellerini veritabanına yükleme
async function seedProducts() {
  console.log("\n📦 Ürünler yükleniyor...");

  const productFiles = [
    "samsung.json",
    "apple.json",
    "xiaomi.json",
    "oppo.json",
    "huwai.json",
  ];

  let totalProducts = 0;
  let totalModels = 0;

  for (const filename of productFiles) {
    console.log(`\n  📄 ${filename} işleniyor...`);

    const fileData = readJSONFile(filename);
    if (!fileData || !fileData.products) {
      console.error(`  ⚠️  ${filename} dosyasında products bulunamadı!`);
      continue;
    }

    const products = fileData.products;
    console.log(`  ℹ️  ${products.length} ürün bulundu`);

    for (const product of products) {
      try {
        // Ürün bilgilerini hazırla
        const productData = {
          id: product.id,
          name: product.name,
          box_code: product.boxCode,
          category_id: product.categoryId,
        };

        // Ürünü veritabanına ekle (upsert)
        const { data: insertedProduct, error: productError } = await supabase
          .from("products")
          .upsert(productData, { onConflict: "id" })
          .select()
          .single();

        if (productError) {
          console.error(
            `  ❌ Ürün ekleme hatası (${product.name}):`,
            productError,
          );
          continue;
        }

        totalProducts++;

        // Modelleri veritabanına ekle
        if (product.mobiles && product.mobiles.length > 0) {
          const models = product.mobiles.map((mobile: any) => ({
            id: mobile.mid,
            model_name: mobile.model,
            product_id: product.id,
            sort_order: mobile.sort || 0,
            is_new: mobile.isNew || false,
          }));

          const { data: insertedModels, error: modelsError } = await supabase
            .from("product_models")
            .upsert(models, { onConflict: "id" })
            .select();

          if (modelsError) {
            console.error(
              `  ❌ Model ekleme hatası (${product.name}):`,
              modelsError,
            );
          } else {
            totalModels += models.length;
          }
        }
      } catch (error) {
        console.error(`  ❌ Beklenmeyen hata (${product.name}):`, error);
      }
    }

    console.log(`  ✅ ${filename} tamamlandı!`);
  }

  console.log(`\n✅ Toplam ${totalProducts} ürün yüklendi!`);
  console.log(`✅ Toplam ${totalModels} model yüklendi!`);
  return true;
}

// Ana seed fonksiyonu
async function main() {
  console.log("🚀 Veri göçü (seed) başlatılıyor...\n");
  console.log("=".repeat(50));

  try {
    // 1. Kategorileri yükle
    const categoriesSuccess = await seedCategories();
    if (!categoriesSuccess) {
      console.error("\n❌ Kategoriler yüklenemedi, işlem durduruluyor.");
      process.exit(1);
    }

    // 2. Ürünleri ve modelleri yükle
    const productsSuccess = await seedProducts();
    if (!productsSuccess) {
      console.error("\n❌ Ürünler yüklenemedi!");
      process.exit(1);
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Veri göçü başarıyla tamamlandı!");
    console.log("=".repeat(50) + "\n");
  } catch (error) {
    console.error("\n💥 Beklenmeyen hata:", error);
    process.exit(1);
  }
}

// Scripti çalıştır
main();
