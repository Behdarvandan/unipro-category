import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Global referans - singleton pattern için
let _supabaseClient: SupabaseClient | null = null;

/**
 * Supabase client'ini lazy initialization ile oluşturur.
 * Bu sayede runtime'da (Vercel'de) gerçek env değişkenlerini okuruz,
 * build-time'da inline edilmiş placeholder değerleri kullanmayız.
 */
function getSupabaseClient(): SupabaseClient {
  // Zaten oluşturulmuşsa, mevcut client'i döndür
  if (_supabaseClient) {
    return _supabaseClient;
  }

  // Runtime'da env değerlerini oku (Next.js bunları inline etse bile,
  // Vercel runtime'da process.env'i düzgün doldurur)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Tarayıcı tarafında (runtime) placeholder kontrolü yap
  if (typeof window !== "undefined") {
    if (!url || url.includes("placeholder")) {
      console.error("Supabase URL:", url);
      throw new Error(
        "❌ NEXT_PUBLIC_SUPABASE_URL runtime değeri eksik veya placeholder içeriyor.\n" +
          "Vercel environment variables düzgün ayarlanmamış olabilir.\n" +
          "Vercel Dashboard → Settings → Environment Variables bölümünden kontrol edin.",
      );
    }
    if (!key || key.includes("placeholder")) {
      console.error("Supabase Key başlangıcı:", key?.substring(0, 20));
      throw new Error(
        "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY runtime değeri eksik veya placeholder içeriyor.\n" +
          "Vercel environment variables düzgün ayarlanmamış olabilir.\n" +
          "Vercel Dashboard → Settings → Environment Variables bölümünden kontrol edin.",
      );
    }
  }

  // Sunucu tarafında (build-time veya SSR) fallback kullan ama sadece tip güvenliği için
  const finalUrl = url || "https://placeholder.supabase.co";
  const finalKey = key || "placeholder-key";

  // Client'i oluştur ve cache'le
  _supabaseClient = createClient(finalUrl, finalKey);

  return _supabaseClient;
}

/**
 * Supabase client export'u - Proxy kullanarak lazy initialization sağlar.
 * Her property erişiminde gerçek client'i runtime'da oluşturur/getirir.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    // Fonksiyonları bind ederek doğru context'i koru
    return typeof value === "function" ? value.bind(client) : value;
  },
});
