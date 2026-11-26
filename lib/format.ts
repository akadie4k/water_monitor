const TZ = "Asia/Bangkok";

const dtf = new Intl.DateTimeFormat("th-TH", {
  timeZone: TZ, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
});
const tf = new Intl.DateTimeFormat("th-TH", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const df = new Intl.DateTimeFormat("th-TH", { timeZone: TZ, day: "numeric", month: "short", year: "2-digit" });

/** ค่าเวลาจาก backend: "2026-11-26T15:50:00+07:00" หรือ "2026-11-16T10:40" (เวลาไทยไม่มี offset) */
export function toDate(s: string): Date {
  return /[zZ]|[+-]\d\d:?\d\d$/.test(s) ? new Date(s) : new Date(s + "+07:00");
}

export const fmtDateTime = (s: string) => dtf.format(toDate(s));
export const fmtTime = (s: string) => tf.format(toDate(s));
export const fmtDate = (s: string) => df.format(toDate(s));

export function ago(s: string, now = Date.now()): string {
  const sec = Math.max(0, Math.round((now - toDate(s).getTime()) / 1000));
  if (sec < 60) return "เมื่อสักครู่";
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} ชม. ที่แล้ว`;
  return `${Math.round(h / 24)} วันที่แล้ว`;
}
