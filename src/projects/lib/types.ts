/** 仓库条目（由 scripts/fetch-repos.mjs 从 gh 数据生成） */
export interface Repo {
  name: string;
  fullName: string;
  url: string;
  homepage: string;
  description: string;
  language: string;
  topics: string[];
  stars: number;
  forks: number;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  archived: boolean;
  fork: boolean;
  private: boolean;
  featured?: boolean;
  tag?: string;
  thumb?: string;
  /** 人工精选双语描述（en / zh），由 scripts/curation.json 合并而来 */
  blurbEn?: string;
  blurbZh?: string;
}

export interface Dataset {
  _meta: {
    owner: string;
    source: string;
    fetchedAt: string;
    count: number;
  };
  repos: Repo[];
}
