/* Tiny, safe markdown → HTML for journal articles. Escapes everything
   first, then applies a deliberately small grammar: paragraphs, headings,
   blockquotes, lists, rules, fenced code, and inline marks (bold, italic,
   code, links). Big enough for prose, small enough to trust. */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* Inline marks run on already-escaped text, so interpolated matches are
   safe (raw <, >, &, " were neutralized above). */
function inline(text: string): string {
  return text
    .replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
    )
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

export function renderMarkdown(src: string): string {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let para = "";
  let list: string | null = null;

  const flushPara = () => {
    if (para.trim()) out.push(`<p>${inline(para.trim())}</p>`);
    para = "";
  };
  const flushList = () => {
    if (list) {
      out.push(`<ul>${list}</ul>`);
      list = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    // A blank line closes the open paragraph/list (soft-wrapped lines are
    // non-empty and keep accumulating).
    if (!t) {
      flushPara();
      flushList();
      continue;
    }

    const heading = t.match(/^(#{1,3})\s+(.*)/);
    if (heading) {
      flushPara();
      flushList();
      const lv = heading[1].length;
      // Slug the heading into an anchor id (ASCII + CJK) for the TOC.
      const id = heading[2]
        .toLowerCase()
        .replace(/[^a-z0-9一-龥]+/g, "-")
        .replace(/(^-|-$)/g, "");
      out.push(`<h${lv} id="${id}">${inline(heading[2])}</h${lv}>`);
      continue;
    }

    const quote = t.match(/^>\s?(.*)/);
    if (quote) {
      flushPara();
      flushList();
      // Consecutive > lines merge into one blockquote.
      let qtext = quote[1];
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith(">")) {
        i++;
        qtext += " " + lines[i].trim().replace(/^>\s?/, "");
      }
      out.push(`<blockquote><p>${inline(qtext)}</p></blockquote>`);
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(t)) {
      flushPara();
      flushList();
      out.push("<hr/>");
      continue;
    }

    if (/^```/.test(t)) {
      flushPara();
      flushList();
      let code = "";
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        code += lines[i] + "\n";
        i++;
      }
      out.push(`<pre><code>${escapeHtml(code.trim())}</code></pre>`);
      continue;
    }

    const item = t.match(/^[-*]\s+(.*)/) || t.match(/^\d+\.\s+(.*)/);
    if (item) {
      flushPara();
      list = (list ?? "") + `<li>${inline(item[1])}</li>`;
      continue;
    }

    flushList();
    para += lines[i] + " ";
  }
  flushPara();
  flushList();
  return out.join("\n");
}
