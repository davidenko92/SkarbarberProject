"use client";

import { Plus } from "lucide-react";

interface FabPlusProps {
  onClick?: () => void;
  ariaLabel?: string;
}

export function FabPlus({ onClick, ariaLabel = "Nueva cita" }: FabPlusProps) {
  return (
    <div
      className="fixed right-5 z-40"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 84px)" }}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className="fab-gold shimmer-cta"
      >
        <Plus className="h-6 w-6" strokeWidth={2.25} />
      </button>
    </div>
  );
}
