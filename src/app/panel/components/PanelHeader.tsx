import { LogOut } from "lucide-react";
import { GorillaLogo } from "./GorillaLogo";

export function PanelHeader() {
  return (
    <header
      className="panel-surface sticky top-0 z-30 border-b"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-4">
        <div className="flex items-center gap-3.5">
          <GorillaLogo size={72} />
          <div className="flex flex-col leading-none">
            <span className="font-serif text-[28px] font-medium leading-none tracking-tight text-white">
              Skar <em className="italic text-gold">Barber</em>
            </span>
            <span className="mt-2 text-[10.5px] uppercase tracking-[0.42em] text-gold/75">
              Panel
            </span>
          </div>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            aria-label="Cerrar sesión"
            className="dial-arrow shrink-0"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.85} />
          </button>
        </form>
      </div>
    </header>
  );
}
