import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

async function main() {
  const superadminName = process.env.SUPERADMIN_NAME ?? "superadmin";
  const superadminEmail = process.env.SUPERADMIN_EMAIL ?? "superadmin@chat.local";
  const superadminPassword = process.env.SUPERADMIN_PASSWORD ?? "SuperAdmin@1234";

  const superadminPasswordHash = await bcrypt.hash(superadminPassword, 12);

  await prisma.user.upsert({
    where: { email: superadminEmail },
    update: {
      name: superadminName,
      passwordHash: superadminPasswordHash,
      role: "SUPERADMIN",
    },
    create: {
      name: superadminName,
      email: superadminEmail,
      passwordHash: superadminPasswordHash,
      role: "SUPERADMIN",
    },
  });

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminName = process.env.SEED_ADMIN_NAME ?? "admin";

  if (adminEmail && adminPassword) {
    const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        name: adminName,
        passwordHash: adminPasswordHash,
        role: "ADMIN",
      },
      create: {
        name: adminName,
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: "ADMIN",
      },
    });
  }

  console.log(`Seeded superadmin: ${superadminEmail}`);
  console.log(`Superadmin username: ${superadminName}`);
  console.log(`Superadmin password: ${superadminPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
