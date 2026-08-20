/** GitHub 官方语言配色（子集） + 兜底色 */
const GH_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Vue: "#41b883",
  Rust: "#dea584",
  Python: "#3572a5",
  CSS: "#663399",
  HTML: "#e34c26",
  C: "#555555",
  "C++": "#f34b7d",
  CSharp: "#178600",
  Go: "#00add8",
  Java: "#b07219",
  Shell: "#89e051",
  Markdown: "#083fa1",
  JSON: "#292929",
};

const FALLBACK = "#8b949e";

/** 语言 → 圆点颜色；未知语言给中性灰 */
export function langColor(lang: string): string {
  return GH_COLORS[lang] ?? FALLBACK;
}
