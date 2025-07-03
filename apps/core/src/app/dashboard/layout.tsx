// dashboard/layout.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // Secondary check - middleware should have caught this
  if (!userId) {
    redirect("/");
  }

  return <div className="dashboard-layout">{children}</div>;
}
