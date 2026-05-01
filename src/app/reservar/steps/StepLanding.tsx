import Image from "next/image";
import { Phone } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { GoldButton } from "../components/GoldButton";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="17.4" cy="6.6" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

interface StepLandingProps {
  onStart: () => void;
}

const TELEFONO_BARBERIA = "623404772";
const INSTAGRAM_URL = "https://instagram.com/skarbarber";

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

        <span className="eyebrow mb-2">Alcalá de Henares · est. 2020</span>

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
          <InfoRow label="Dirección">Alcalá de Henares, Madrid</InfoRow>

          <InfoRow label="Horario">
            <span className="block">Lun–Vie · 10–14h / 16–20h</span>
            <span className="block text-white/70">Sáb · 10–14h</span>
          </InfoRow>

          <div className="hairline mt-1" />

          <div className="grid grid-cols-2 gap-3 pt-1">
            <a
              href={`tel:${TELEFONO_BARBERIA}`}
              className="contact-action contact-action--primary"
            >
              <Phone className="h-[18px] w-[18px]" strokeWidth={1.85} />
              <span>Llamar</span>
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-action"
            >
              <InstagramIcon className="h-[18px] w-[18px]" />
              <span>Instagram</span>
            </a>
          </div>
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
