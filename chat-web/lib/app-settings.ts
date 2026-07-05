import { prisma } from "@/lib/prisma";

export const LOGIN_BACKGROUND_KEY = "login.background.image";

export async function getLoginBackgroundUrl() {
  try {
    const setting = await prisma.appSetting.findUnique({
      where: { key: LOGIN_BACKGROUND_KEY },
      select: { value: true },
    });

    return setting?.value ?? null;
  } catch {
    // Keep login page available when migration for AppSetting is not applied yet.
    return null;
  }
}

export async function setLoginBackgroundUrl(url: string) {
  try {
    await prisma.appSetting.upsert({
      where: { key: LOGIN_BACKGROUND_KEY },
      update: { value: url },
      create: {
        key: LOGIN_BACKGROUND_KEY,
        value: url,
      },
    });

    return true;
  } catch {
    return false;
  }
}
