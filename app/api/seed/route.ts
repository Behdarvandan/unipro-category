import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Yerel JSON dosyalarımızı projeye dahil ediyoruz
import homepageData from "@/data/homepage.json";
import appleData from "@/data/apple.json";
import samsungData from "@/data/samsung.json";
import huaweiData from "@/data/huwai.json";
import redmiData from "@/data/xiaomi.json";
import oppoData from "@/data/oppo.json";

// Supabase istemcisini çevresel değişkenlerle ayağa kaldırıyoruz
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    // 1. Tüm veri kaynaklarını tek bir havuzda birleştiriyoruz
    const allCategories = [...(homepageData.categories || [])];
    const allRawProducts = [
      ...(homepageData.products || []),
      ...(appleData.products || []),
      ...(samsungData.products || []),
      ...(huaweiData.products || []),
      ...(redmiData.products || []),
      ...(oppoData.products || []),
    ];

    // 2. Kategorileri Veri Tabanına Yüklüyoruz
    if (allCategories.length > 0) {
      const { error: catError } = await supabase
        .from("categories")
        .upsert(allCategories, { onConflict: "id" });
      if (catError) throw catError;
    }

    // 3. Ürünleri/Modelleri haritalandırıp veri tabanına uygun hale getiriyoruz
    const formattedProducts = allRawProducts.map((p: any) => ({
      id: Number(p.id),
      name: p.name,
      box_code: p.boxCode || null,
      box_code_note: p.boxCodeNote || null,
      capacity: p.capacity || null,
      product_code: p.productCode || null,
      specs: {}, // İleride eklenebilecek teknik detaylar için boş JSONB
    }));

    // Aynı ID'ye sahip mükerrer verileri eliyoruz
    const uniqueProducts = Array.from(
      new Map(formattedProducts.map((item) => [item.id, item])).values(),
    );

    // 4. Ürünleri Veri Tabanına Toplu Olarak Basıyoruz (Bulk Insert/Upsert)
    if (uniqueProducts.length > 0) {
      const { error: prodError } = await supabase
        .from("products")
        .upsert(uniqueProducts, { onConflict: "id" });
      if (prodError) throw prodError;
    }

    return NextResponse.json({
      success: true,
      message: `Database seeded successfully!! ${allCategories.length} category and ${uniqueProducts.length} products inserted/updated.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
