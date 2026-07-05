import { redirect } from "next/navigation";

import { getCurrentUser, getDefaultDashboardPath } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect(getDefaultDashboardPath(user.role));
  }

  redirect("/login");
}
