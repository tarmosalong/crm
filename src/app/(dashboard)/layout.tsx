import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-auto">
        <div className="h-full p-6">{children}</div>
      </main>
      <Toaster />
    </div>
  );
}

