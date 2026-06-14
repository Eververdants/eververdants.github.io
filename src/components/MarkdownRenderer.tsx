import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

const renderInlineLinks = (text: string): React.ReactNode[] => {
  const parts = text.split(URL_REGEX);
  return parts.map((part, index) => {
    if (part.match(URL_REGEX)) {
      return (
        <a
          key={`url-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
        >
          {part}
        </a>
      );
    }
    return <React.Fragment key={`txt-${index}`}>{part}</React.Fragment>;
  });
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const blocks: React.ReactNode[] = [];
  const lines = content.split('\n');
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      i += 1;
      continue;
    }

    if (line.startsWith('```')) {
      i += 1;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push(
        <pre key={`code-${key++}`}>
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={`h3-${key++}`}>{line.replace('### ', '')}</h3>
      );
      i += 1;
      continue;
    }

    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={`h2-${key++}`}>{line.replace('## ', '')}</h2>
      );
      i += 1;
      continue;
    }

    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().replace(/^- /, ''));
        i += 1;
      }

      blocks.push(
        <ul key={`ul-${key++}`}>
          {items.map((item, idx) => (
            <li key={`li-${idx}`}>{renderInlineLinks(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    const paragraph: string[] = [line];
    i += 1;
    while (i < lines.length) {
      const current = lines[i].trim();
      if (!current || current.startsWith('## ') || current.startsWith('### ') || current.startsWith('- ') || current.startsWith('```')) {
        break;
      }
      paragraph.push(current);
      i += 1;
    }

    blocks.push(
      <p key={`p-${key++}`}>
        {renderInlineLinks(paragraph.join(' '))}
      </p>
    );
  }

  return (
    <div className="prose-article">
      {blocks}
    </div>
  );
};

export default MarkdownRenderer;
