import Link from "next/link";
import { Calendar, Users, Scissors, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const navItems = [
    { href: "/", icon: Calendar, label: "Agenda" },
    { href: "/clientes", icon: Users, label: "Clientes" },
    { href: "/servicios", icon: Scissors, label: "Servicios" },
    { href: "/config", icon: Settings, label: "Config" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">Skarbarber</h1>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </form>
      </header>

      {/* Main content */}
      <main className="pb-20 md:pb-4">{children}</main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-1 text-zinc-400 hover:text-white transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Sidebar (desktop) - hidden on mobile */}
      {/* TODO: implement desktop sidebar if needed */}
    </div>
  );
}
