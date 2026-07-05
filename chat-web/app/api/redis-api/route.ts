import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
  await redis.set("chat-web:redis-test", "ok");

  const value = await redis.get("chat-web:redis-test");

  return NextResponse.json({
    success: true,
    redis: value,
  });
}