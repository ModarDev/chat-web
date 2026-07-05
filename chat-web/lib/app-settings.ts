import { prisma } from "@/lib/prisma";

export const LOGIN_BACKGROUND_KEY = "login.background.image";

export async function getLoginBackgroundUrl() {
  const setting = await prisma.appSetting.findUnique({
    where: { key: LOGIN_BACKGROUND_KEY },
    select: { value: true },
  });

  return setting?.value ?? null;
}

export async function setLoginBackgroundUrl(url: string) {
  await prisma.appSetting.upsert({
    where: { key: LOGIN_BACKGROUND_KEY },
    update: { value: url },
    create: {
      key: LOGIN_BACKGROUND_KEY,
      value: url,
    },
  });
}
