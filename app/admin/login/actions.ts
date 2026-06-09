"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const password = formData.get("password") as string;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!password) {
    return { error: "Şifre gereklidir" };
  }

  // Şifreyi kontrol et
  if (password !== adminPassword) {
    return { error: "Hatalı Şifre" };
  }

  // Başarılı giriş - Cookie'yi set et
  const cookieStore = await cookies();
  cookieStore.set("admin_session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 gün
    path: "/",
  });

  // Admin paneline yönlendir
  redirect("/admin");
}
