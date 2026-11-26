import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  /** ภาพประกอบเล็กๆ ด้านบน (ตกแต่งเท่านั้น) */
  illustration?: ReactNode;
  className?: string;
}

export default function EmptyState({ title, description, action, illustration, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-start gap-2 px-4 py-6 sm:px-5", className)}>
      {illustration && <div className="-mt-1 mb-1">{illustration}</div>}
      <p className="font-display text-base font-medium text-ink">{title}</p>
      {description && <p className="max-w-prose text-sm text-muted">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
