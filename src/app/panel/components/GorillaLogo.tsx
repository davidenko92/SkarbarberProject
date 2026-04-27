import Image from "next/image";

interface GorillaLogoProps {
  size?: number;
}

export function GorillaLogo({ size = 72 }: GorillaLogoProps) {
  const inner = Math.round(size * 0.78);
  return (
    <span
      className="skar-logo-frame shrink-0"
      style={{ width: size, height: size }}
    >
      <span
        className="relative block overflow-hidden rounded-full"
        style={{ width: inner, height: inner }}
      >
        <Image
          src="/gorila-logotipo 2.jpeg"
          alt="Skar Barber"
          fill
          sizes={`${inner}px`}
          priority
          className="skar-logo-img object-cover scale-[2.1]"
          style={{ objectPosition: "62% 68%" }}
        />
      </span>
    </span>
  );
}
