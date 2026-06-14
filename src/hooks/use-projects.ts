import { useMemo } from 'react';
import { getProjects } from '../data';
import { useLanguage } from '../contexts/LanguageContext';
import { getCoverAccent, CoverAccent } from '../data/projects-cover';
import type { Project } from '../types';

export interface ProjectCardData extends Project {
  /** 编辑版式用的"编号"01 / 06 字符串 */
  number: string;
  /** 卡片主色（accent / soft / wash） */
  cover: CoverAccent;
  /** 项目标题首字母 / 字符（用于占位封面） */
  monogram: string;
}

/**
 * 把 getProjects 的结果加上编辑版式需要的视觉元数据：
 *  - number：左对齐的 "01 / 06" 编号
 *  - cover：主色 + 软色 + 背景色三档
 *  - monogram：项目标题的首字符（fallback 用）
 */
export function useProjects(): ProjectCardData[] {
  const { language } = useLanguage();
  const projects = getProjects(language);

  return useMemo(
    () =>
      projects.map((p, i) => ({
        ...p,
        number: String(i + 1).padStart(2, '0'),
        cover: getCoverAccent(i),
        monogram: p.title.trim().charAt(0).toUpperCase() || '·',
      })),
    [projects]
  );
}
