import { useState } from 'react';

const ALL = '__all__';

export default function TagFilter({ tags, allLabel }: { tags: string[]; allLabel: string }) {
  const [active, setActive] = useState<string>(ALL);

  const apply = (tag: string) => {
    setActive(tag);
    const articles = document.querySelectorAll<HTMLElement>('#post-list article[data-tags]');
    articles.forEach((el) => {
      const matched = tag === ALL || el.dataset.tags?.split(' ').includes(tag);
      el.hidden = !matched;
    });
  };

  return (
    <nav className="flex flex-wrap gap-3 py-6 border-b border-line font-mono text-xs">
      <span className="text-plum">Tags</span>
      <button
        type="button"
        aria-pressed={active === ALL}
        onClick={() => apply(ALL)}
        className={`border px-2 py-0.5 ${active === ALL ? 'border-cinnabar text-cinnabar' : 'border-line text-plum hover:border-cinnabar hover:text-cinnabar'}`}
      >
        {allLabel}
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          aria-pressed={active === tag}
          onClick={() => apply(tag)}
          className={`border px-2 py-0.5 ${active === tag ? 'border-cinnabar text-cinnabar' : 'border-line text-plum hover:border-cinnabar hover:text-cinnabar'}`}
        >
          {tag}
        </button>
      ))}
    </nav>
  );
}
