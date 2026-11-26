import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "good" | "warn" | "bad" | "neutral" | "primary";

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
  title?: string;
}

const TONE: Record<BadgeTone, string> = {
  good: "bg-good/10 text-good ring-good/25",
  warn: "bg-warn/12 text-warn-strong ring-warn/30",
  bad: "bg-bad/10 text-bad ring-bad/25",
  neutral: "bg-border-soft text-body ring-border",
  primary: "bg-primary-soft text-primary ring-primary/20",
};

export default function Badge({ tone = "neutral", children, className, title }: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums ring-1 ring-inset whitespace-nowrap",
        TONE[tone], className,
      )}
    >
      {children}
    </span>
  );
}
