import Link from "next/link";

import { registerAction, redirectIfAuthenticated } from "@/app/login/actions";

type RegisterPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  await redirectIfAuthenticated();
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-8 shadow-lg shadow-blue-100/60">
        <header className="mb-8 space-y-2 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-blue-700">CHAT WEB</p>
          <h1 className="text-3xl font-semibold text-slate-900">Register</h1>
          <p className="text-sm text-slate-500">สมัครสมาชิกใหม่และเริ่มใช้งานระบบ</p>
        </header>

        <form action={registerAction} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">ชื่อผู้ใช้งาน</span>
            <input
              type="text"
              name="name"
              required
              className="w-full rounded-xl border border-blue-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Your Name"
            />
          </label>

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
              minLength={8}
              className="w-full rounded-xl border border-blue-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="อย่างน้อย 8 ตัวอักษร"
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            สมัครสมาชิก
          </button>

          <p className="text-center text-sm text-slate-600">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/login" className="font-semibold text-blue-700 hover:text-blue-800">
              เข้าสู่ระบบ
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
