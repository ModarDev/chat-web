import { logoutAction } from "@/app/dashboard/actions";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-end">
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700"
            >
              ออกจากระบบ
            </button>
          </form>
        </header>

        <section className="rounded-2xl border border-blue-100 bg-white p-8 shadow-md shadow-blue-100/60">
          <p className="mb-2 text-sm font-semibold tracking-[0.16em] text-blue-700">DASHBOARD</p>
          <h1 className="mb-3 text-3xl font-semibold text-slate-900">Welcome, {user.name}</h1>
          <p className="text-slate-600">
            นี่คือหน้า Landing ของแดชบอร์ดระบบ คุณสามารถต่อยอดสถิติ ฟีเจอร์แชต และการจัดการไฟล์ได้จากหน้านี้
          </p>
        </section>
      </div>
    </main>
  );
}
