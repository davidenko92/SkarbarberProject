import Image from "next/image";
import { LogOut } from "lucide-react";

export function PanelHeader() {
  return (
    <header
      className="panel-surface sticky top-0 z-30 border-b"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-black ring-1 ring-gold/40 shadow-[0_0_32px_rgba(196,164,98,0.55)]">
            <Image
              src="/gorila-logotipo 2.jpeg"
              alt="Skar Barber"
              fill
              sizes="64px"
              priority
              className="object-cover scale-[2.1]"
              style={{ objectPosition: "62% 68%" }}
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-[20px] font-medium tracking-tight text-white">
              Skar <em className="not-italic text-gold">Barber</em>
            </span>
            <span className="mt-1.5 text-[10px] uppercase tracking-[0.34em] text-gold/75">
              Panel
            </span>
          </div>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            aria-label="Cerrar sesión"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/55 transition-colors hover:border-gold/40 hover:text-gold"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </form>
      </div>
    </header>
  );
}
