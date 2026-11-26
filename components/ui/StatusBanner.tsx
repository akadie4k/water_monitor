import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { IconName } from "@/lib/icons";

export type StatusTone = "progress" | "success" | "error" | "info";

export interface StatusBannerProps {
  tone: StatusTone;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const TONE: Record<StatusTone, string> = {
  progress: "border-primary/30 bg-primary/8 text-ink",
  success: "border-good/30 bg-good/8 text-ink",
  error: "border-bad/35 bg-bad/8 text-ink",
  info: "border-border bg-surface text-body",
};

const TONE_ICON: Record<Exclude<StatusTone, "progress">, IconName> = {
  success: "success",
  error: "error",
  info: "info",
};

const ICON_COLOR: Record<Exclude<StatusTone, "progress">, string> = {
  success: "text-good",
  error: "text-bad",
  info: "text-muted",
};

export default function StatusBanner({ tone, message, onDismiss, className }: StatusBannerProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-lg border px-4 py-2.5 text-sm", TONE[tone], className)}
    >
      {tone === "progress" ? (
        <Icon name="refresh" spin className="mt-[3px] text-primary" />
      ) : (
        <Icon name={TONE_ICON[tone]} className={cn("mt-[3px]", ICON_COLOR[tone])} />
      )}
      <p className="min-w-0 flex-1 break-words">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="ปิดข้อความ"
          className="-my-2 -mr-2 grid size-11 shrink-0 place-items-center rounded-md text-muted hover:text-ink sm:size-8"
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  );
}
