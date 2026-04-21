interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-[3px] flex-1 rounded-full transition-colors ${
              i < current
                ? "bg-gradient-to-r from-gold to-gold-dark shadow-[0_0_8px_rgba(196,164,98,0.5)]"
                : "bg-white/15"
            }`}
          />
        ))}
      </div>
      <span className="text-[12px] font-semibold tracking-[0.22em] text-gold whitespace-nowrap">
        {String(current).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
    </div>
  );
}
