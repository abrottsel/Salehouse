import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/site-admin-auth";
import { LayoutDashboard, Inbox, LogOut } from "lucide-react";
import LogoutButton from "./_LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await isAuthenticated();
  if (!auth) redirect("/admin/login");

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-black text-gray-900 text-sm tracking-tight"
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white text-xs">
              З+
            </span>
            <span className="hidden sm:inline">ЗемПлюс — Админка</span>
            <span className="sm:hidden">Админка</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 h-9 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Дашборд</span>
            </Link>
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 h-9 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition"
            >
              <Inbox className="w-4 h-4" />
              <span>Лиды</span>
            </Link>
          </nav>
          <div className="ml-auto">
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
