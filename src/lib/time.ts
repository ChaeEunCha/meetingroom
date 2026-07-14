export const SLOT_START = 9 * 60;
export const SLOT_END = 18 * 60;
export const SLOT_STEP = 30;
export const SLOT_COUNT = (SLOT_END - SLOT_START) / SLOT_STEP;

export const SLOTS: number[] = Array.from(
  { length: SLOT_COUNT },
  (_, i) => SLOT_START + i * SLOT_STEP
);

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function minutesToSlotIndex(minutes: number): number {
  return Math.round((minutes - SLOT_START) / SLOT_STEP);
}

export function clampToBusinessHours(minutes: number): number {
  return Math.min(Math.max(minutes, SLOT_START), SLOT_END);
}

export function todayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const d = now.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const ny = date.getFullYear();
  const nm = (date.getMonth() + 1).toString().padStart(2, "0");
  const nd = date.getDate().toString().padStart(2, "0");
  return `${ny}-${nm}-${nd}`;
}

export function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  return `${y}년 ${m}월 ${d}일 (${weekday})`;
}
