"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Calendar, Users, Scissors, Settings } from "lucide-react";

const items = [
  { href: "/panel", icon: Calendar, label: "Agenda", exact: true },
  { href: "/panel/clientes", icon: Users, label: "Clientes" },
  { href: "/panel/servicios", icon: Scissors, label: "Servicios" },
  { href: "/panel/metricas", icon: BarChart3, label: "Stats" },
  { href: "/panel/config", icon: Settings, label: "Config" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="panel-surface fixed inset-x-0 bottom-0 z-30 border-t"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 py-2">
        {items.map(({ href, icon: Icon, label, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="relative flex flex-col items-center justify-center gap-1 py-1 transition-colors"
              >
                {isActive ? (
                  <span className="nav-tab-active-chip">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2.1} />
                  </span>
                ) : (
                  <span className="flex h-[38px] w-[38px] items-center justify-center">
                    <Icon
                      className="h-5 w-5 text-white/45 transition-colors"
                      strokeWidth={1.6}
                    />
                  </span>
                )}
                <span
                  className={`text-[10px] font-medium tracking-[0.18em] uppercase transition-colors ${
                    isActive ? "text-gold" : "text-white/45"
                  }`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
