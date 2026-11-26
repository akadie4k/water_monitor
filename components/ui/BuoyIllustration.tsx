import { cn } from "@/lib/cn";

/** ภาพประกอบสถานะว่าง: ทุ่นลอยอยู่บนคลื่น (ตกแต่งเท่านั้น) */
export default function BuoyIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 96" aria-hidden="true" className={cn("h-auto w-36", className)}>
      <defs>
        <clipPath id="illo-water">
          <rect x="0" y="0" width="160" height="96" />
        </clipPath>
      </defs>
      {/* ดาวเทียมไกลๆ */}
      <g transform="translate(124 14) rotate(-20)" opacity="0.8">
        <rect x="-3" y="-4" width="6" height="8" rx="1" fill="var(--color-primary)" />
        <rect x="-13" y="-2" width="8" height="4" fill="var(--color-series-2)" />
        <rect x="5" y="-2" width="8" height="4" fill="var(--color-series-2)" />
      </g>
      <path d="M112 26q-6 6-4 14" fill="none" stroke="var(--color-series-2)" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2 4" />

      <g className="illo-bob">
        {/* เสาเสาอากาศ */}
        <path d="M80 18v16" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="80" cy="16" r="3" fill="var(--color-accent)" />
        {/* ตัวทุ่น */}
        <path d="M66 34h28l5 24H61Z" fill="var(--color-accent)" stroke="var(--color-ink)" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M64 44h32l1.5 7h-35Z" fill="#fff" />
        <ellipse cx="80" cy="60" rx="24" ry="5" fill="var(--color-accent-strong)" stroke="var(--color-ink)" strokeWidth="1.6" />
      </g>

      <g clipPath="url(#illo-water)">
        <path
          className="illo-wave"
          d="M-8 62q10-6 20 0t20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0V96H-8Z"
          fill="var(--color-primary-soft)"
        />
        <path
          className="illo-wave"
          style={{ animationDelay: "-2s" }}
          d="M-4 70q10-6 20 0t20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0V96H-4Z"
          fill="color-mix(in srgb, var(--color-series-2) 35%, #fff)"
        />
        <path d="M-4 70q10-6 20 0t20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0" fill="none" stroke="var(--color-primary)" strokeWidth="1.4" opacity="0.5" className="illo-wave" style={{ animationDelay: "-2s" }} />
      </g>
    </svg>
  );
}
