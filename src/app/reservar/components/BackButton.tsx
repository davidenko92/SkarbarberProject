interface BackButtonProps {
  onClick: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      type="button"
      aria-label="Volver"
      onClick={onClick}
      className="group flex h-11 w-11 items-center justify-center rounded-full border border-gold/55 bg-black/40 text-gold backdrop-blur-sm shadow-[0_0_12px_rgba(196,164,98,0.15)] transition-all hover:border-gold hover:bg-gold/15 hover:shadow-[0_0_16px_rgba(196,164,98,0.3)]"
    >
      <svg
        className="h-5 w-5 transition-transform group-hover:-translate-x-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M15 19l-7-7 7-7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
        />
      </svg>
    </button>
  );
}
