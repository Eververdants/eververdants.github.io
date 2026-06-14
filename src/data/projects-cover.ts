/**
 * 编辑杂志版式 — 每个项目的"主色条 / 装饰色 / 背景渐变"映射
 *
 * 用法：COVER_PALETTE[i % COVER_PALETTE.length]
 * 保持暖中性 + 强调色的克制搭配，避免紫色渐变等通用 AI 美学。
 */

export interface CoverAccent {
  /** 项目主色条 / 装饰色（用于色条、tag、CTA hover） */
  accent: string;
  /** 弱化版的同色调（用于 tag 背景、渐变末端） */
  soft: string;
  /** 背景渐变起色（warm 系，保持画面低饱和） */
  wash: string;
}

export const COVER_PALETTE: CoverAccent[] = [
  // 森林绿 — 主色，呼应网站整体调性
  { accent: '#2d6a4f', soft: 'rgba(45,106,79,0.12)', wash: 'rgba(45,106,79,0.04)' },
  // 琥珀
  { accent: '#d97706', soft: 'rgba(217,119,6,0.12)', wash: 'rgba(217,119,6,0.04)' },
  // 砖红
  { accent: '#b45309', soft: 'rgba(180,83,9,0.12)', wash: 'rgba(180,83,9,0.04)' },
  // 深青
  { accent: '#0f766e', soft: 'rgba(15,118,110,0.12)', wash: 'rgba(15,118,110,0.04)' },
  // 玫瑰
  { accent: '#be185d', soft: 'rgba(190,24,93,0.12)', wash: 'rgba(190,24,93,0.04)' },
  // 钢蓝
  { accent: '#1e3a8a', soft: 'rgba(30,58,138,0.12)', wash: 'rgba(30,58,138,0.04)' },
];

export const getCoverAccent = (index: number): CoverAccent =>
  COVER_PALETTE[index % COVER_PALETTE.length];
