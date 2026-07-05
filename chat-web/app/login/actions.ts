"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { createUserSession, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redisFeatures } from "@/lib/redis-features";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=กรุณากรอกอีเมลและรหัสผ่าน");
  }

  const limiter = await redisFeatures.rateLimit(`login:${email}`, 60, 10);

  if (!limiter.allowed) {
    redirect("/login?error=พยายามบ่อยเกินไป กรุณาลองใหม่ในอีกสักครู่");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    redirect("/login?error=ไม่พบบัญชีผู้ใช้งาน");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    redirect("/login?error=อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  }

  await createUserSession(user.id);
  redirect("/dashboard");
}

export async function redirectIfAuthenticated() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }
}
