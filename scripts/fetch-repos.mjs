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

import { execFileSync } from "node:child_process";
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
  let text;
  try {
    text = readFileSync(CURATION, "utf8");
  } catch (e) {
    /* 文件本来就不存在 —— 没有精选数据可用，属正常情况。 */
    if (e.code === "ENOENT") return {};
    console.warn(`[fetch-repos] 读取 curation.json 失败（${e.message}）—— 中止。`);
    return null;
  }
  /* 存在却解析不出来是另一回事。一个语法错误若被当成“没有精选”，
     featured / tag / thumb / blurb 会整体从写入的数据里消失，精选区随之
     变空，而 CI 会把这份残缺结果提交进仓库 —— 宁可失败也不静默降级，
     与上面 0 仓库那条守卫同一立场。 */
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    console.warn(`[fetch-repos] curation.json 不是合法 JSON（${e.message}）—— 中止。`);
    return null;
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    console.warn("[fetch-repos] curation.json 顶层必须是对象 —— 中止。");
    return null;
  }
  return parsed;
}

function normalizeRepos(raw) {
  return raw
    .filter(
      (r) =>
        r &&
        typeof r.name === "string" &&
        typeof r.nameWithOwner === "string",
    )
    .map((r) => ({
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
    execFileSync("gh", ["--version"], { stdio: "ignore" });
  } catch {
    console.warn("[fetch-repos] gh CLI 不可用 —— 保留旧数据。");
    return null;
  }
  /* execFileSync 不经 shell：GH_OWNER 里的空格/元字符不会被展开，
     命令行注入与转义问题一并消除。 */
  try {
    const out = execFileSync(
      "gh",
      [
        "repo",
        "list",
        OWNER,
        "--limit",
        "100",
        "--json",
        FIELDS,
        "--visibility",
        "public",
      ],
      {
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
      },
    );
    const parsed = JSON.parse(out.trim() || "[]");
    if (!Array.isArray(parsed)) throw new Error("gh 输出不是数组");
    return parsed;
  } catch (e) {
    console.warn(
      `[fetch-repos] gh 拉取失败（${String(e.message).split("\n")[0]}）——保留旧数据。`,
    );
    return null;
  }
}

function main() {
  const raw = tryGh();
  if (!raw) process.exit(1);
  /* gh 成功但返回 0 个仓库 —— token 权限丢失、账号改名、API 异常时的
     典型症状。照单全收会把 repos.json 清空，/projects 子站随之失明；
     这里宁可失败也不静默覆盖（不写入，旧数据原样保留）。 */
  if (raw.length === 0) {
    console.warn(
      "[fetch-repos] GitHub 返回 0 个仓库 —— 疑似异常，保留旧数据，不写入。",
    );
    process.exit(1);
  }

  const curation = loadCuration();
  /* null = 精选文件坏了。不写入，旧 repos.json 原样保留。 */
  if (!curation) process.exit(1);
  const repos = normalizeRepos(raw).map((r) => {
    const c = curation[r.name];
    if (!c) return r;
    // blurb 支持双语对象 { en, zh }，也兼容旧版纯字符串（当作中文）
    const b = c.blurb;
    const blurbEn = typeof b === "object" ? b.en : "";
    const blurbZh =
      typeof b === "object" ? b.zh : typeof b === "string" ? b : "";
    return {
      ...r,
      featured: !!c.featured,
      tag: c.tag || "",
      thumb: c.thumb || "",
      blurbEn,
      blurbZh,
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
    `[fetch-repos] ✓ 已同步 ${repos.length} 个公开仓库 → src/projects/data/repos.json (${new Date(data._meta.fetchedAt).toLocaleString("zh-CN")})`,
  );
}

main();
