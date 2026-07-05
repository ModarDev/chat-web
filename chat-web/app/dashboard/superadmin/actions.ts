"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { setLoginBackgroundUrl } from "@/lib/app-settings";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ROLES: Role[] = ["USER", "ADMIN", "SUPERADMIN"];

export async function updateUserRoleAction(formData: FormData) {
  await requireRole(["SUPERADMIN"]);

  const userId = String(formData.get("userId") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim() as Role;

  if (!userId || !ROLES.includes(role)) {
    redirect("/dashboard/superadmin?error=ข้อมูลสิทธิ์ไม่ถูกต้อง");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  redirect("/dashboard/superadmin?success=อัปเดตสิทธิ์เรียบร้อยแล้ว");
}

function getSafeImageExtension(mimeType: string) {
  if (mimeType === "image/jpeg") {
    return "jpg";
  }

  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  return null;
}

function parseBackgroundUrl(rawValue: string) {
  const value = rawValue.trim();

  if (!value) {
    return null;
  }

  if (value.startsWith("/")) {
    return value;
  }

  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    return null;
  }

  if (!(parsed.protocol === "http:" || parsed.protocol === "https:")) {
    return null;
  }

  return value;
}

export async function updateLoginBackgroundAction(formData: FormData) {
  await requireRole(["SUPERADMIN"]);

  const backgroundUrlInput = String(formData.get("backgroundUrl") ?? "");
  const parsedUrl = parseBackgroundUrl(backgroundUrlInput);
  const file = formData.get("backgroundFile");

  if (!parsedUrl && !(file instanceof File && file.size > 0)) {
    redirect("/dashboard/superadmin?error=กรุณาใส่ URL รูปภาพ หรืออัปโหลดรูปภาพ");
  }

  if (parsedUrl) {
    await setLoginBackgroundUrl(parsedUrl);
    revalidatePath("/login");
    redirect("/dashboard/superadmin?success=อัปเดตพื้นหลังล็อกอินเรียบร้อยแล้ว");
  }

  if (!(file instanceof File) || file.size === 0) {
    redirect("/dashboard/superadmin?error=ไม่พบไฟล์รูปภาพ");
  }

  if (file.size > 8 * 1024 * 1024) {
    redirect("/dashboard/superadmin?error=ไฟล์ใหญ่เกิน 8MB");
  }

  const ext = getSafeImageExtension(file.type);

  if (!ext) {
    redirect("/dashboard/superadmin?error=รองรับเฉพาะไฟล์ JPG, PNG, WEBP");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `login-background-${Date.now()}.${ext}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const targetPath = path.join(uploadsDir, fileName);

  await mkdir(uploadsDir, { recursive: true });
  await writeFile(targetPath, buffer);

  await setLoginBackgroundUrl(`/uploads/${fileName}`);
  revalidatePath("/login");

  redirect("/dashboard/superadmin?success=อัปโหลดและอัปเดตพื้นหลังล็อกอินเรียบร้อยแล้ว");
}
