/**
 * อ่านสีจาก design token ใน app/globals.css (@theme static) สำหรับไลบรารีที่ต้องการค่าสีเป็นสตริง
 * เช่น ECharts และ paint ของ MapLibre — เรียกฝั่ง browser เท่านั้น
 */
export type ThemeColor =
  | "primary" | "primary-hover" | "primary-soft"
  | "ink" | "body" | "muted"
  | "bg" | "surface" | "border" | "border-soft"
  | "accent" | "accent-strong" | "accent-soft"
  | "good" | "warn" | "warn-strong" | "bad"
  | "series-1" | "series-2" | "series-3";

export function themeColor(name: ThemeColor): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim();
}
