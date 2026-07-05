"use server";

import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";

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
