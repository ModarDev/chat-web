"use server";

import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";

import { createUserSession, getCurrentUser, getDefaultDashboardPath } from "@/lib/auth";
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
  redirect(getDefaultDashboardPath(user.role));
}

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    redirect("/register?error=กรุณากรอกข้อมูลให้ครบ");
  }

  if (password.length < 8) {
    redirect("/register?error=รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
  }

  const existed = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existed) {
    redirect("/register?error=อีเมลนี้มีผู้ใช้งานแล้ว");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "USER" as Role,
    },
  });

  await createUserSession(user.id);
  redirect("/dashboard/user");
}

export async function redirectIfAuthenticated() {
  const user = await getCurrentUser();

  if (user) {
    redirect(getDefaultDashboardPath(user.role));
  }
}
