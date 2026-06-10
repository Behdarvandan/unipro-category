"use server";

import { supabaseAdmin } from "@/lib/supabase-admin"; // Admin client kullan (RLS bypass)
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

/**
 * Admin oturum kontrolü - Tüm admin işlemlerinden önce çağrılmalı
 * Cookie'den admin_session kontrolü yapar
 */
async function checkAdminSession() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  if (!adminSession || adminSession.value !== "authenticated") {
    throw new Error("Yetkisiz erişim. Admin girişi gerekli.");
  }
}

/**
 * Yeni ürün ekleme fonksiyonu
 * @param productData - Eklenecek ürün verileri
 */
export async function addProduct(productData: any) {
  await checkAdminSession(); // Güvenlik: Admin oturum kontrolü

  try {
    console.log("addProduct çağrıldı:", productData);

    const { data, error } = await supabaseAdmin // Admin client (RLS bypass)
      .from("products")
      .insert([productData])
      .select();

    if (error) throw error;

    // Cache'i temizle
    revalidatePath("/admin/products");

    return { success: true, message: "Ürün başarıyla eklendi", data };
  } catch (error) {
    console.error("addProduct hatası:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Bilinmeyen hata",
    };
  }
}

/**
 * Mevcut ürünü güncelleme fonksiyonu
 * @param productId - Güncellenecek ürünün ID'si
 * @param productData - Güncellenecek ürün verileri
 */
export async function updateProduct(productId: string, productData: any) {
  await checkAdminSession(); // Güvenlik: Admin oturum kontrolü

  try {
    console.log("updateProduct çağrıldı:", { productId, productData });

    const { data, error } = await supabaseAdmin // Admin client (RLS bypass)
      .from("products")
      .update(productData)
      .eq("id", productId)
      .select();

    if (error) throw error;

    // Cache'i temizle
    revalidatePath("/admin/products");
    revalidatePath(`/products/${productId}`);

    return {
      success: true,
      message: "Ürün başarıyla güncellendi",
      data,
    };
  } catch (error) {
    console.error("updateProduct hatası:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Bilinmeyen hata",
    };
  }
}

/**
 * Ürün silme fonksiyonu
 * @param productId - Silinecek ürünün ID'si
 */
export async function deleteProduct(productId: string) {
  await checkAdminSession(); // Güvenlik: Admin oturum kontrolü

  try {
    console.log("deleteProduct çağrıldı:", productId);

    const { error } = await supabaseAdmin // Admin client (RLS bypass)
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) throw error;

    // Cache'i temizle
    revalidatePath("/admin/products");

    return { success: true, message: "Ürün başarıyla silindi" };
  } catch (error) {
    console.error("deleteProduct hatası:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Bilinmeyen hata",
    };
  }
}

// =====================================================
// KATEGORİ CRUD FONKSİYONLARI
// =====================================================

/**
 * Yeni kategori ekleme fonksiyonu
 * @param categoryData - Eklenecek kategori verileri (name, prefix)
 */
export async function addCategory(categoryData: {
  name: string;
  prefix: string;
}) {
  await checkAdminSession(); // Güvenlik: Admin oturum kontrolü

  try {
    console.log("addCategory çağrıldı:", categoryData);

    const { data, error } = await supabaseAdmin // Admin client (RLS bypass)
      .from("categories")
      .insert([categoryData])
      .select();

    if (error) throw error;

    // Cache'i temizle
    revalidatePath("/admin/categories");

    return { success: true, message: "Kategori başarıyla eklendi", data };
  } catch (error) {
    console.error("addCategory hatası:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Bilinmeyen hata",
    };
  }
}

/**
 * Mevcut kategoriyi güncelleme fonksiyonu
 * @param categoryId - Güncellenecek kategorinin ID'si
 * @param categoryData - Güncellenecek kategori verileri
 */
export async function updateCategory(
  categoryId: number,
  categoryData: { name: string; prefix: string },
) {
  await checkAdminSession(); // Güvenlik: Admin oturum kontrolü

  try {
    console.log("updateCategory çağrıldı:", { categoryId, categoryData });

    const { data, error } = await supabaseAdmin // Admin client (RLS bypass)
      .from("categories")
      .update(categoryData)
      .eq("id", categoryId)
      .select();

    if (error) throw error;

    // Cache'i temizle
    revalidatePath("/admin/categories");

    return { success: true, message: "Kategori başarıyla güncellendi", data };
  } catch (error) {
    console.error("updateCategory hatası:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Bilinmeyen hata",
    };
  }
}

/**
 * Kategori silme fonksiyonu
 * @param categoryId - Silinecek kategorinin ID'si
 */
export async function deleteCategory(categoryId: number) {
  await checkAdminSession(); // Güvenlik: Admin oturum kontrolü

  try {
    console.log("deleteCategory çağrıldı:", categoryId);

    const { error } = await supabaseAdmin // Admin client (RLS bypass)
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) throw error;

    // Cache'i temizle
    revalidatePath("/admin/categories");

    return { success: true, message: "Kategori başarıyla silindi" };
  } catch (error) {
    console.error("deleteCategory hatası:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Bilinmeyen hata",
    };
  }
}
