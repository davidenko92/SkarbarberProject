interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 gap-1.5">
        {Array.from({ length: total }).map((_, i) => {
          const done = i < current;
          const isLastDone = i === current - 1;
          return (
            <div
              key={i}
              className={`h-[3px] flex-1 overflow-hidden rounded-full transition-colors duration-500 ${
                done
                  ? "bg-gradient-to-r from-gold-light via-gold to-gold-dark shadow-[0_0_10px_rgba(229,193,113,0.55)]"
                  : "bg-white/12"
              } ${isLastDone ? "ring-[0.5px] ring-gold-light/70" : ""}`}
            />
          );
        })}
      </div>
      <span className="whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.28em] text-gold tabular-nums">
        {String(current).padStart(2, "0")}
        <span className="mx-1 text-gold/40">/</span>
        {String(total).padStart(2, "0")}
      </span>
    </div>
  );
}
