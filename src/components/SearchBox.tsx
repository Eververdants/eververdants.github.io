import { useEffect, useRef, useState } from 'react';

interface PagefindResult {
  data(): Promise<{ meta: { title: string }; url: string; excerpt: string }>;
}

interface PagefindClient {
  init(): Promise<void>;
  search(query: string): Promise<{ results: PagefindResult[] }>;
}

export default function SearchBox({ lang, placeholder }: { lang: 'zh' | 'en'; placeholder: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<{ title: string; url: string; excerpt: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      try {
        // pagefind.js 由 pagefind CLI 在 build 后生成到站点根目录，运行期才存在；
        // 用变量 specifier + @vite-ignore 避免 Vite 在构建期尝试打包该运行时 URL
        const pagefindUrl = '/pagefind/pagefind.js';
        const pagefind: PagefindClient = await import(/* @vite-ignore */ pagefindUrl);
        await pagefind.init();
        const search = await pagefind.search(query);
        const items = search.results.slice(0, 15);
        const data = await Promise.all(items.map((r) => r.data()));
        if (cancelled) return;
        setResults(
          data
            .filter((d) => d.url.startsWith(`/${lang}/`))
            .map((d) => ({ title: d.meta.title, url: d.url, excerpt: d.excerpt }))
        );
      } catch {
        if (!cancelled) setResults([]);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [query, lang]);

  return (
    <div className="relative font-mono text-xs">
      <input
        ref={inputRef}
        type="search"
        name="pagefind-search"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="w-36 border border-line bg-transparent px-2 py-1 text-plum placeholder:text-plum/60 focus:border-cinnabar focus:outline-none"
      />
      {open && results.length > 0 && (
        <ul className="absolute right-0 top-full mt-2 w-80 border border-line bg-paper shadow-lg">
          {results.map((r) => (
            <li key={r.url}>
              <a href={r.url} className="block px-4 py-3 hover:bg-paper-2">
                <span className="block text-ink">{r.title}</span>
                <span className="block text-xs text-plum line-clamp-2" dangerouslySetInnerHTML={{ __html: r.excerpt }} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
