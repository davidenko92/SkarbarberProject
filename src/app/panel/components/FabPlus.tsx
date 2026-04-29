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
        className="fab-disc"
      >
        <Plus className="h-7 w-7" strokeWidth={2.4} />
      </button>
    </div>
  );
}
