#!/usr/bin/env node
/**
 * fetch-repos.mjs —— 用 gh CLI 拉取 Eververdants 的全部公开仓库，
 * 合并 scripts/curation.json 的手动精选，写入 src/projects/data/repos.json
 * （WORKS INDEX 子站的数据源，随主站一起构建部署）。
 *
 * 用法：
 *   npm run sync          # 仅刷新数据（需本机已 gh auth login）
 *   npm run build         # 先 sync 再构建
 *
 * 设计要点：
 *   - repos.json 会提交进仓库 —— 构建/CI 无需 gh 认证也能成功；
 *   - gh 不可用或拉取失败时保留旧数据并给出警告（不静默清空）；
 *   - 输出含 _meta.fetchedAt，页面页脚会显示“最近同步”。
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src", "projects", "data", "repos.json");
const CURATION = join(ROOT, "scripts", "curation.json");

const OWNER = process.env.GH_OWNER || "Eververdants";

const FIELDS = [
  "name",
  "nameWithOwner",
  "description",
  "primaryLanguage",
  "stargazerCount",
  "forkCount",
  "createdAt",
  "updatedAt",
  "pushedAt",
  "isArchived",
  "isFork",
  "isPrivate",
  "homepageUrl",
  "repositoryTopics",
].join(",");

function loadCuration() {
  try {
    return JSON.parse(readFileSync(CURATION, "utf8"));
  } catch {
    console.warn("[fetch-repos] 未找到 curation.json，仅使用 GitHub 原始数据。");
    return {};
  }
}

function normalizeRepos(raw) {
  return raw.map((r) => ({
    name: r.name,
    fullName: r.nameWithOwner,
    url: `https://github.com/${r.nameWithOwner}`,
    homepage: r.homepageUrl || "",
    description: r.description || "",
    language: r.primaryLanguage?.name ?? "Markdown", // 纯文档仓库无 primaryLanguage
    topics: r.repositoryTopics?.map((t) => t.name) ?? [],
    stars: r.stargazerCount,
    forks: r.forkCount,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    pushedAt: r.pushedAt,
    archived: r.isArchived,
    fork: r.isFork,
    private: r.isPrivate,
  }));
}

function tryGh() {
  try {
    execSync("gh --version", { stdio: "ignore" });
  } catch {
    return null;
  }
  const cmd = `gh repo list ${OWNER} --limit 100 --json ${FIELDS} --visibility public`;
  try {
    const out = execSync(cmd, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    return JSON.parse(out.trim());
  } catch (e) {
    console.warn(`[fetch-repos] gh 拉取失败（${e.message.split("\n")[0]}）——保留旧数据。`);
    return null;
  }
}

function main() {
  const raw = tryGh();
  if (!raw) process.exit(1);

  const curation = loadCuration();
  const repos = normalizeRepos(raw).map((r) => {
    const c = curation[r.name];
    if (!c) return r;
    return {
      ...r,
      featured: !!c.featured,
      tag: c.tag || "",
      thumb: c.thumb || "",
      blurb: c.blurb || r.description,
    };
  });

  const data = {
    _meta: {
      owner: OWNER,
      source: "gh repo list --json",
      fetchedAt: new Date().toISOString(),
      count: repos.length,
    },
    repos,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(data, null, 2) + "\n");
  console.log(
    `[fetch-repos] ✓ 已同步 ${repos.length} 个公开仓库 → src/projects/data/repos.json (${new Date(data._meta.fetchedAt).toLocaleString("zh-CN")})`
  );
}

main();
