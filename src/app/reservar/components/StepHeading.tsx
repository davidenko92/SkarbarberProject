import type { ReactNode } from "react";

interface StepHeadingProps {
  eyebrow: string;
  title: ReactNode;
  meta?: string;
}

export function StepHeading({ eyebrow, title, meta }: StepHeadingProps) {
  return (
    <header className="step-heading">
      <span className="step-heading__eyebrow">{eyebrow}</span>
      <h1 className="step-heading__title">{title}</h1>
      <div className="step-heading__rule" />
      {meta && <p className="step-heading__meta">{meta}</p>}
    </header>
  );
}
