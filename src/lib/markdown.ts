/* Tiny, safe markdown → HTML for journal articles. Escapes everything
   first, then applies a deliberately small grammar: paragraphs, headings
   (h1–h6), blockquotes, lists, rules, fenced code, pipe tables, images,
   and inline marks (bold, italic, code, links). Big enough for prose,
   small enough to trust. */

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

    const heading = t.match(/^(#{1,6})\s+(.*)/);
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

    /* Images — a line of ![alt](src) renders as a figure with the alt as
       caption (accessible by construction: caption == alt text). */
    const img = t.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (img) {
      flushPara();
      flushList();
      const [, alt, src] = img;
      const caption = escapeHtml(alt);
      out.push(
        `<figure><img src="${escapeHtml(src)}" alt="${caption}" loading="lazy"/><figcaption>${caption}</figcaption></figure>`,
      );
      continue;
    }

    /* Pipe tables — a header row, a |---| separator, then data rows. */
    if (t.startsWith("|")) {
      flushPara();
      flushList();
      const rows = [t];
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith("|")) {
        i++;
        rows.push(lines[i].trim());
      }
      const isSep = (r: string) =>
        /^\|?[\s:|-]+\|?$/.test(r) && r.includes("-");
      const split = (r: string) =>
        r
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((c) => c.trim());
      if (rows.length >= 2 && isSep(rows[1])) {
        const head = split(rows[0]);
        const body = rows.slice(2).map(split);
        out.push(
          "<table><thead><tr>" +
            head.map((c) => `<th>${inline(c)}</th>`).join("") +
            "</tr></thead>" +
            (body.length
              ? "<tbody>" +
                body
                  .map(
                    (r) =>
                      "<tr>" +
                      r.map((c) => `<td>${inline(c)}</td>`).join("") +
                      "</tr>",
                  )
                  .join("") +
                "</tbody>"
              : "") +
            "</table>",
        );
      } else {
        // Not a real table (no separator row) — fall back to prose.
        para += rows.join(" ") + " ";
      }
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
      // Optional language tag after the fence — rendered as a data-lang
      // attribute so the reader can badge the block and offer copy.
      const lang = t.replace(/^```/, "").trim();
      let code = "";
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        code += lines[i] + "\n";
        i++;
      }
      const langAttr = lang ? ` data-lang="${escapeHtml(lang)}"` : "";
      out.push(`<pre${langAttr}><code>${escapeHtml(code.trim())}</code></pre>`);
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
