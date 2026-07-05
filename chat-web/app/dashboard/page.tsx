import { redirect } from "next/navigation";

import { getDefaultDashboardPath, requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();
  redirect(getDefaultDashboardPath(user.role));
}
