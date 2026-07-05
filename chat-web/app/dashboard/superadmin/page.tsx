import { logoutAction } from "@/app/dashboard/actions";
import { updateLoginBackgroundAction, updateUserRoleAction } from "@/app/dashboard/superadmin/actions";
import { getLoginBackgroundUrl } from "@/lib/app-settings";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type SuperAdminDashboardProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function SuperAdminDashboardPage({ searchParams }: SuperAdminDashboardProps) {
  const currentUser = await requireRole(["SUPERADMIN"]);
  const { error, success } = await searchParams;
  const loginBackgroundUrl = await getLoginBackgroundUrl();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.16em] text-blue-700">SUPERADMIN DASHBOARD</p>
            <h1 className="text-2xl font-semibold text-slate-900">Welcome, {currentUser.name}</h1>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700"
            >
              ออกจากระบบ
            </button>
          </form>
        </header>

        <section className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-md shadow-blue-100/60">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">ตั้งค่าพื้นหลังหน้า Login</h2>
          <p className="mb-4 text-sm text-slate-600">
            แนะนำรูปขนาด 1920x1080 และระบบจะแสดงแบบเต็มจอ responsive ตามอุปกรณ์ (อัปโหลดลง S3/SeaweedFS)
          </p>
          <p className="mb-4 text-sm text-slate-500">
            เมื่ออัปโหลดไฟล์ ระบบจะใช้ลิงก์ชั่วคราวแบบ signed URL อัตโนมัติ แม้ bucket จะไม่ public
          </p>

          <form action={updateLoginBackgroundAction} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">URL รูปภาพ</span>
              <input
                type="url"
                name="backgroundUrl"
                placeholder="https://cdn.example.com/login-bg.jpg"
                className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">หรืออัปโหลดไฟล์ (JPG, PNG, WEBP)</span>
              <input
                type="file"
                name="backgroundFile"
                accept="image/jpeg,image/png,image/webp"
                className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-blue-700 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-800"
              />
            </label>

            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              บันทึกพื้นหลัง Login
            </button>
          </form>

          {error ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          ) : null}

          {success ? (
            <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {success}
            </p>
          ) : null}

          <p className="mt-4 text-sm text-slate-600">รูปที่ใช้งานปัจจุบัน: {loginBackgroundUrl ?? "ยังไม่ได้ตั้งค่า"}</p>
        </section>

        <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-md shadow-blue-100/60">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">จัดการสิทธิ์ผู้ใช้งาน</h2>

          {error ? (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          ) : null}

          {success ? (
            <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {success}
            </p>
          ) : null}

          <div className="space-y-3">
            {users.map((user) => (
              <form
                key={user.id}
                action={updateUserRoleAction}
                className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-[1fr_auto_auto] md:items-center"
              >
                <div>
                  <p className="font-semibold text-slate-800">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>

                <input type="hidden" name="userId" value={user.id} />

                <select
                  name="role"
                  defaultValue={user.role}
                  className="rounded-lg border border-blue-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPERADMIN">SUPERADMIN</option>
                </select>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  บันทึก
                </button>
              </form>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
