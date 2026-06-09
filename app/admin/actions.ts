"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

/**
 * Yeni ürün ekleme fonksiyonu
 * @param productData - Eklenecek ürün verileri
 */
export async function addProduct(productData: any) {
  try {
    console.log("addProduct çağrıldı:", productData);

    // TODO: Supabase'e ürün ekleme işlemi buraya gelecek
    // const { data, error } = await supabase
    //   .from('products')
    //   .insert([productData]);

    // if (error) throw error;

    // Cache'i temizle
    // revalidatePath('/admin/products');

    return { success: true, message: "Ürün başarıyla eklendi (placeholder)" };
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
  try {
    console.log("updateProduct çağrıldı:", { productId, productData });

    // TODO: Supabase'de ürün güncelleme işlemi buraya gelecek
    // const { data, error } = await supabase
    //   .from('products')
    //   .update(productData)
    //   .eq('id', productId);

    // if (error) throw error;

    // Cache'i temizle
    // revalidatePath('/admin/products');
    // revalidatePath(`/products/${productId}`);

    return {
      success: true,
      message: "Ürün başarıyla güncellendi (placeholder)",
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
  try {
    console.log("deleteProduct çağrıldı:", productId);

    // TODO: Supabase'den ürün silme işlemi buraya gelecek
    // const { error } = await supabase
    //   .from('products')
    //   .delete()
    //   .eq('id', productId);

    // if (error) throw error;

    // Cache'i temizle
    // revalidatePath('/admin/products');

    return { success: true, message: "Ürün başarıyla silindi (placeholder)" };
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
  try {
    console.log("addCategory çağrıldı:", categoryData);

    const { data, error } = await supabase
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
  try {
    console.log("updateCategory çağrıldı:", { categoryId, categoryData });

    const { data, error } = await supabase
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
  try {
    console.log("deleteCategory çağrıldı:", categoryId);

    const { error } = await supabase
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
