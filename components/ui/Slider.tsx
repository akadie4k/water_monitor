import { useId } from "react";

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** แปลงค่าเป็นข้อความที่แสดงข้างป้าย */
  format?: (value: number) => string;
}

export default function Slider({ label, value, min, max, step = 0.05, onChange, format }: SliderProps) {
  const id = useId();
  const shown = format ? format(value) : String(value);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-[13px]">
        <label htmlFor={id} className="text-muted">
          {label}
        </label>
        <output htmlFor={id} className="font-medium text-ink tabular-nums">
          {shown}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={shown}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-full cursor-pointer accent-primary sm:h-6"
      />
    </div>
  );
}
