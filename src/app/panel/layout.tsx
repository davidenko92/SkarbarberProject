import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PanelHeader } from "./components/PanelHeader";
import { BottomNav } from "./components/BottomNav";
import { PWAInstallBridge } from "./components/PWAInstallBridge";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="relative min-h-dvh w-full bg-black text-white">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(196,164,98,0.07) 0%, transparent 45%), radial-gradient(100% 60% at 50% 100%, rgba(154,123,51,0.06) 0%, transparent 55%), #000",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 3px)",
        }}
      />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <PanelHeader />
        <main
          className="mx-auto w-full max-w-md flex-1 px-4 pt-4"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 168px)",
          }}
        >
          {children}
        </main>
        <BottomNav />
        <PWAInstallBridge />
      </div>
    </div>
  );
}
