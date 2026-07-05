import { prisma } from "@/lib/prisma";
import { getDownloadUrl } from "@/lib/object-storage";

export const LOGIN_BACKGROUND_KEY = "login.background.image";
const S3_KEY_PREFIX = "s3key:";

export function buildStoredS3BackgroundValue(objectKey: string) {
  return `${S3_KEY_PREFIX}${objectKey}`;
}

export async function getLoginBackgroundUrl() {
  try {
    const setting = await prisma.appSetting.findUnique({
      where: { key: LOGIN_BACKGROUND_KEY },
      select: { value: true },
    });

    const value = setting?.value ?? null;

    if (!value) {
      return null;
    }

    if (!value.startsWith(S3_KEY_PREFIX)) {
      return value;
    }

    const objectKey = value.slice(S3_KEY_PREFIX.length);

    if (!objectKey) {
      return null;
    }

    try {
      return await getDownloadUrl(objectKey, 3600);
    } catch {
      return null;
    }
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
