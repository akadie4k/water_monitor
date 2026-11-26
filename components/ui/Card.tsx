import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface CardProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
  as?: "section" | "aside" | "div";
  labelledBy?: string;
}

export default function Card({
  title, description, actions, className, bodyClassName, children, as: Tag = "section", labelledBy,
}: CardProps) {
  return (
    <Tag
      aria-labelledby={labelledBy}
      className={cn("flex min-w-0 flex-col rounded-xl border border-border bg-surface", className)}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-border-soft px-4 py-3 sm:px-5">
          <div className="min-w-0">
            {title && (
              <h2 id={labelledBy} className="text-base sm:text-[17px]">
                {title}
              </h2>
            )}
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn("min-h-0 flex-1", bodyClassName)}>{children}</div>
    </Tag>
  );
}
