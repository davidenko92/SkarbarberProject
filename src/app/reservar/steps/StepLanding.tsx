import Image from "next/image";
import { GlassCard } from "../components/GlassCard";
import { GoldButton } from "../components/GoldButton";

interface StepLandingProps {
  onStart: () => void;
}

export function StepLanding({ onStart }: StepLandingProps) {
  return (
    <div className="animate-step-in flex min-h-dvh flex-col items-center justify-between gap-5 py-4">
      <GlassCard
        variant="feature"
        className="flex w-full flex-col items-center rounded-[2rem] px-7 pb-9 pt-8 text-center"
      >
        <div className="-mx-2 -mb-2 -mt-4 aspect-[5/4] w-[calc(100%+1rem)]">
          <Image
            src="/icono-transparente.png"
            alt="Skarbarber"
            width={420}
            height={336}
            priority
            className="h-full w-full object-contain drop-shadow-[0_0_50px_rgba(196,164,98,0.5)]"
          />
        </div>

        <span className="eyebrow mb-2">Alcalá de Henares · est. 2019</span>

        <h1 className="brand-display text-[48px] uppercase leading-[0.95] text-white sm:text-[56px]">
          Skar <em>Barber</em>
        </h1>

        <div className="my-4 hairline-short" />

        <p className="text-[14px] font-light tracking-[0.08em] text-white/80">
          Peluquería · Barbería
        </p>
        <p className="mb-6 mt-1 text-[11px] tracking-[0.22em] text-gold/80 uppercase">
          Respeto · Humildad · Familia
        </p>

        <GoldButton onClick={onStart}>Reservar cita</GoldButton>
      </GlassCard>

      <GlassCard variant="solid" className="w-full rounded-[1.75rem] px-7 py-7">
        <div className="grid gap-5 text-sm">
          <InfoRow label="Teléfono">
            <a href="tel:623404772" className="hover:text-gold">
              623 404 772
            </a>
            <span className="mx-2 text-white/30">·</span>
            <a href="tel:914886768" className="hover:text-gold">
              914 886 768
            </a>
          </InfoRow>

          <InfoRow label="Dirección">Alcalá de Henares, Madrid</InfoRow>

          <InfoRow label="Horario">
            <span className="block">Lun–Vie · 10–14h / 16–20h</span>
            <span className="block text-white/70">Sáb · 10–14h</span>
          </InfoRow>

          <div className="hairline mt-1" />

          <a
            href="https://instagram.com/skarbarber"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 pt-1 text-[13px] uppercase tracking-[0.22em] text-gold-light transition-opacity hover:opacity-80"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M17 2h-10c-2.76 0-5 2.24-5 5v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5v-10c0-2.76-2.24-5-5-5z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
              />
              <path
                d="M16 11.37c0 1.99-1.61 3.63-3.59 3.63-1.99 0-3.59-1.64-3.59-3.63s1.6-3.63 3.59-3.63c1.98 0 3.59 1.63 3.59 3.63z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
              />
              <path
                d="M17.5 6.5h.01"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
              />
            </svg>
            @skarbarber
          </a>
        </div>
      </GlassCard>
    </div>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[84px_1fr] items-start gap-4">
      <span className="eyebrow pt-1">{label}</span>
      <div className="text-white/90">{children}</div>
    </div>
  );
}
