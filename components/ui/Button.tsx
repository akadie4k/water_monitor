import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** แสดงวงหมุนและปิดปุ่มกันกดซ้ำ */
  loading?: boolean;
  icon?: ReactNode;
}

const VARIANT: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover active:bg-primary-hover disabled:bg-primary/55",
  secondary: "bg-surface text-ink ring-1 ring-inset ring-border hover:bg-white hover:ring-primary/40 disabled:text-muted",
  ghost: "bg-transparent text-ink hover:bg-ink/5 disabled:text-muted",
};

const SIZE: Record<Size, string> = {
  sm: "min-h-11 px-3 text-sm sm:min-h-8",
  md: "min-h-11 px-4 text-[15px] sm:min-h-10",
};

export default function Button({
  variant = "primary", size = "md", loading = false, icon, disabled, className, children, type = "button", ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap",
        "motion-safe:transition-colors disabled:cursor-not-allowed",
        VARIANT[variant], SIZE[size], className,
      )}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="size-4 shrink-0 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin"
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
