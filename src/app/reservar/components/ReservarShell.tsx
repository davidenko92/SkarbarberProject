import Image from "next/image";
import type { ReactNode } from "react";
import { SilkBackground } from "@/components/silk-background-animation";
import { BackButton } from "./BackButton";
import { ProgressBar } from "./ProgressBar";

interface ReservarShellProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
  onBack?: () => void;
  showHeader?: boolean;
}

export function ReservarShell({
  children,
  step,
  totalSteps,
  onBack,
  showHeader = true,
}: ReservarShellProps) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden">
      <SilkBackground />

      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-6">
        {showHeader && (
          <header className="mb-10">
            <div className="grid grid-cols-[40px_1fr_40px] items-center gap-4">
              {onBack ? <BackButton onClick={onBack} /> : <span />}
              <div className="flex justify-center">
                <div className="h-20 w-auto">
                  <Image
                    src="/icono-transparente.png"
                    alt="Skarbarber"
                    width={160}
                    height={80}
                    priority
                    className="h-full w-auto object-contain drop-shadow-[0_0_20px_rgba(196,164,98,0.4)]"
                  />
                </div>
              </div>
              <span />
            </div>
            <div className="mt-5">
              <ProgressBar current={step} total={totalSteps} />
            </div>
          </header>
        )}
        <div className="flex flex-1 flex-col">{children}</div>
      </main>
    </div>
  );
}
