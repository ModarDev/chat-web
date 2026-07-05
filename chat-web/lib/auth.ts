import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { redisFeatures } from "@/lib/redis-features";

const SESSION_COOKIE = "chat_web_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

function createSessionId() {
  return crypto.randomUUID();
}

export async function createUserSession(userId: string) {
  const sessionId = createSessionId();
  await redisFeatures.setSession(sessionId, userId, SESSION_TTL_SECONDS);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionId) {
    return null;
  }

  const userId = await redisFeatures.getSessionUserId(sessionId);

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    return null;
  }

  await redisFeatures.setPresence(user.id);

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionId) {
    await redisFeatures.deleteSession(sessionId);
  }

  cookieStore.delete(SESSION_COOKIE);
}
