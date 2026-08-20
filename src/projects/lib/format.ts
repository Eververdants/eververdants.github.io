const MONTHS_ZH = ["1 月", "2 月", "3 月", "4 月", "5 月", "6 月", "7 月", "8 月", "9 月", "10 月", "11 月", "12 月"];

/** 2026-08-20T04:28:34Z → "2026/08/20" */
export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

/** 相对时间：几分钟前 / 3 天前 / 2 个月前 / 2025-10 */
export function timeAgo(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "刚刚";
  if (min < 60) return `${min} 分钟前`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} 小时前`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} 天前`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} 个月前`;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** 星标数：42 / 1.2k / 3.4k */
export function fmtCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

/** 最近更新时间（用于排序） */
export function lastActive(r: { pushedAt: string; updatedAt: string }): number {
  return new Date(r.pushedAt || r.updatedAt).getTime();
}

/** 创建于某月（页脚等场景） */
export function monthLabel(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()} 年 ${MONTHS_ZH[d.getMonth()]}`;
}

/** 转义 HTML，防止仓库描述/名称中的特殊字符破坏结构 */
export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
