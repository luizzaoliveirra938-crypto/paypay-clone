export function yen(n: number): string {
  const abs = Math.abs(Math.round(n));
  return `${n < 0 ? "-" : ""}¥${abs.toLocaleString("ja-JP")}`;
}

export function pts(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

export function compactDate(iso: string, lang: "ja" | "en" = "ja"): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const today = lang === "en" ? "Today" : "今日";
  const yesterday = lang === "en" ? "Yesterday" : "昨日";
  if (sameDay) return `${today} ${hh}:${mm}`;
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  const isYest =
    d.getFullYear() === yest.getFullYear() &&
    d.getMonth() === yest.getMonth() &&
    d.getDate() === yest.getDate();
  if (isYest) return `${yesterday} ${hh}:${mm}`;
  return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
}

export function fullDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(
    d.getHours(),
  ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function payCode(seed: number): string {
  const n = (seed % 9000000000000) + 1000000000000;
  return String(n);
}

export function ticketNo(at = new Date()): string {
  const y = String(at.getFullYear()).slice(2);
  const m = String(at.getMonth() + 1).padStart(2, "0");
  const d = String(at.getDate()).padStart(2, "0");
  const n = String(Math.floor(10000 + Math.random() * 90000));
  return `PP${y}${m}${d}-${n}`;
}

export function chatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
