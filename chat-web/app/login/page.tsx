import Link from "next/link";

import { redirectIfAuthenticated, loginAction } from "@/app/login/actions";
import { getLoginBackgroundUrl } from "@/lib/app-settings";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await redirectIfAuthenticated();
  const { error } = await searchParams;
  const loginBackgroundUrl = await getLoginBackgroundUrl();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 px-4">
      {loginBackgroundUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${loginBackgroundUrl})` }}
          aria-hidden="true"
        />
      ) : null}
      <div className="absolute inset-0 bg-slate-900/55" aria-hidden="true" />

      <section className="relative z-10 w-full max-w-md rounded-2xl border border-blue-100 bg-white/95 p-8 shadow-2xl shadow-blue-900/20 backdrop-blur-sm">
        <header className="mb-8 space-y-2 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-blue-700">CHAT WEB</p>
          <h1 className="text-3xl font-semibold text-slate-900">Login</h1>
          <p className="text-sm text-slate-500">ลงชื่อเข้าใช้เพื่อเข้าสู่หน้าแดชบอร์ด</p>
        </header>

        <form action={loginAction} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-xl border border-blue-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="you@example.com"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-xl border border-blue-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="••••••••"
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            เข้าสู่ระบบ
          </button>

          <p className="text-center text-sm text-slate-600">
            ยังไม่มีบัญชี?{" "}
            <Link href="/register" className="font-semibold text-blue-700 hover:text-blue-800">
              สมัครสมาชิก
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
