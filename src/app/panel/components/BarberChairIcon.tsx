interface BarberChairIconProps {
  className?: string;
  size?: number;
}

export function BarberChairIcon({
  className,
  size = 78,
}: BarberChairIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
        fill="none"
      >
        {/* Posa-cabeza (pequeño rectángulo redondeado arriba) */}
        <rect x="32" y="14" width="16" height="6" rx="2" />
        <line x1="40" y1="20" x2="40" y2="24" />

        {/* Respaldo curvo */}
        <path d="M22 26 C 22 24, 24 22, 28 22 L 52 22 C 56 22, 58 24, 58 26 L 58 40 C 58 42, 56 44, 54 44 L 26 44 C 24 44, 22 42, 22 40 Z" />

        {/* Acolchado interior — líneas decorativas */}
        <line x1="28" y1="29" x2="52" y2="29" opacity="0.55" />
        <line x1="28" y1="34" x2="52" y2="34" opacity="0.45" />
        <line x1="28" y1="39" x2="52" y2="39" opacity="0.35" />

        {/* Brazos */}
        <path d="M16 44 L 16 52 C 16 54, 17.5 55.5, 19.5 55.5 L 24 55.5 L 24 44" />
        <path d="M64 44 L 64 52 C 64 54, 62.5 55.5, 60.5 55.5 L 56 55.5 L 56 44" />

        {/* Asiento */}
        <path d="M22 44 L 58 44 L 58 50 C 58 52, 56 54, 54 54 L 26 54 C 24 54, 22 52, 22 50 Z" />

        {/* Columna central */}
        <line x1="40" y1="54" x2="40" y2="64" />
        <rect x="36" y="56" width="8" height="3" rx="1" opacity="0.7" />

        {/* Base / pedestal */}
        <path d="M28 68 L 52 68 C 54 68, 55 66.5, 55 65 L 55 64 L 25 64 L 25 65 C 25 66.5, 26 68, 28 68 Z" />
        <line x1="30" y1="68" x2="30" y2="71" />
        <line x1="50" y1="68" x2="50" y2="71" />
        <line x1="26" y1="71" x2="54" y2="71" />

        {/* Pedal lateral */}
        <path d="M55 60 L 60 60 L 60 62" opacity="0.6" />
      </g>
    </svg>
  );
}
