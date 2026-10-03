/* Tiny, safe markdown → HTML for journal articles. Escapes everything
   first, then applies a deliberately small grammar: paragraphs, headings
   (h1–h6), blockquotes, lists, rules, fenced code, pipe tables, images,
   and inline marks (bold, italic, code, links). Big enough for prose,
   small enough to trust. */

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ---- fenced code syntax highlighting ----
   A dependency-free tokenizer that colors code by wrapping tokens in
   semantic spans (.tok-kw/.tok-str/.tok-fn/…), styled by global.css. Safe
   by construction: the raw text is split into tokens and each token is
   escaped individually before wrapping, so no markup can leak through.
   One merged grammar covers the languages the journal actually fences
   (shell, python, plus the C-like family) — a word that is a keyword
   anywhere reads as a keyword everywhere; harmless over-coloring beats
   pulling in a highlighter dependency. */

const HL_WORDS = new Set(
  (
    "if then else elif fi for while do done case esac in return break continue function select " +
    "local readonly export unset set shift trap source eval exec declare typeset alias true false test exit call wait jobs bg fg kill read " +
    "def class async await with try except finally raise assert pass lambda yield global nonlocal del not and or is from import as " +
    "const let var typeof instanceof of new this super static extends get set interface type enum implements public private protected " +
    "namespace declare abstract keyof satisfies infer match"
  ).split(/\s+/),
);

const HL_TYPES = new Set(
  (
    "str int float bool list dict set tuple bytes object number string boolean bigint symbol never unknown any undefined null " +
    "None True False"
  ).split(/\s+/),
);

const HL_BUILTINS = new Set(
  (
    "print len range enumerate zip map filter sorted reversed sum min max abs round open input isinstance issubclass super self " +
    "echo printf cd pwd ls mkdir rmdir cp mv cat grep sed awk curl wget git npm pnpm yarn node python pip pip3 docker docker-compose " +
    "sudo apt apt-get brew chmod chown tar ssh scp find xargs sort uniq wc head tail cut tr tee env touch"
  ).split(/\s+/),
);

const HL_RE =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b(?:0[xX][0-9a-fA-F]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b)|(\$\{?[A-Za-z_][A-Za-z0-9_]*\}?)|([A-Za-z_][A-Za-z0-9_]*)|([^\sA-Za-z0-9_])/g;

function classifyId(word: string, code: string, after: number): string {
  if (HL_WORDS.has(word)) return "kw";
  if (HL_TYPES.has(word)) return "type";
  if (HL_BUILTINS.has(word) || /^\s*\(/.test(code.slice(after))) return "fn";
  return "";
}

export function highlightCode(code: string): string {
  const out: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  HL_RE.lastIndex = 0;
  while ((m = HL_RE.exec(code))) {
    const i = m.index;
    if (i > last) out.push(escapeHtml(code.slice(last, i)));
    const [, com, str, num, shvar, id] = m;
    let cls = "";
    if (com) cls = "com";
    else if (str) cls = "str";
    else if (num) cls = "num";
    else if (shvar) cls = "var";
    else if (id) cls = classifyId(id, code, i + m[0].length);
    out.push(
      cls
        ? `<span class="tok-${cls}">${escapeHtml(m[0])}</span>`
        : escapeHtml(m[0]),
    );
    last = i + m[0].length;
  }
  if (last < code.length) out.push(escapeHtml(code.slice(last)));
  return out.join("");
}

/* Link allowlist. Escaped text can still carry entities (&#58; decodes to
   ":" in the parsed attribute), so denying the literal "javascript:" prefix
   is not enough: a URL is linkable only when the part before the first
   /, ? or # is no scheme at all, or an explicitly safe one. */
function isSafeHref(href: string): boolean {
  const head = href.replace(/[/?#][\s\S]*/, "");
  return !head.includes(":") || /^(https?|mailto):$/i.test(head);
}

/* Inline marks run on already-escaped text, so interpolated matches are
   safe (raw <, >, &, " were neutralized above). */
function inline(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text: string, href: string) =>
      isSafeHref(href)
        ? `<a href="${href}" target="_blank" rel="noreferrer">${text}</a>`
        : text,
    )
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>");
}

export function renderMarkdown(src: string): string {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let para = "";
  let list: string | null = null;
  /* Heading anchors slug per document; two identical headings ("结语")
     would otherwise emit duplicate ids and a TOC jump could only ever
     reach the first. */
  const usedIds = new Set<string>();

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
      const base =
        heading[2]
          .toLowerCase()
          .replace(/[^a-z0-9一-龥]+/g, "-")
          .replace(/(^-|-$)/g, "") || "section";
      let id = base;
      for (let n = 2; usedIds.has(id); n++) id = `${base}-${n}`;
      usedIds.add(id);
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
      /* loading="lazy" keeps an essay's images off the wire until they
         are near the viewport; decoding="async" keeps the decode off the
         main thread so a large photograph arriving mid-read cannot
         stall a frame. A figure has no intrinsic size to declare here,
         so global.css gives the img a reserved block instead — without
         one, every lazy image that lands is a layout shift. */
      out.push(
        `<figure><img src="${escapeHtml(src)}" alt="${caption}" loading="lazy" decoding="async"/><figcaption>${caption}</figcaption></figure>`,
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
      /* Split cells on unescaped pipes only, then restore the literal
         `\|` — a table cell containing a pipe character used to tear the
         row into bogus extra columns. */
      const split = (r: string) =>
        r
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split(/(?<!\\)\|/)
          .map((c) => c.trim().replace(/\\\|/g, "|"));
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
      // Optional language tag after the fence — rendered as a header badge
      // and a data-lang attribute. The block gets a header strip (language
      // left, the React-injected copy button right) over a horizontally
      // scrollable code body; the body is syntax-highlighted with tokens.
      const lang = t.replace(/^```/, "").trim();
      let code = "";
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        code += lines[i] + "\n";
        i++;
      }
      const langAttr = lang ? ` data-lang="${escapeHtml(lang)}"` : "";
      const langBadge = lang
        ? `<span class="code-lang">${escapeHtml(lang)}</span>`
        : "";
      out.push(
        `<pre${langAttr} class="code-block"><span class="code-head">${langBadge}</span><code>${highlightCode(code.trim())}</code></pre>`,
      );
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
