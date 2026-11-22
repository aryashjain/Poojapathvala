// Tiny, dependency-free Markdown support for TextBase.
// Covers what the library needs: frontmatter, headings, paragraphs (with line
// breaks preserved for poetry), lists, quotes, rules, bold/italic, code, links.

export function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: source };

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (pair) data[pair[1]] = parseValue(pair[2].trim());
  }
  return { data, body: source.slice(match[0].length) };
}

// Values are strings, or lists written as [a, "b"].
function parseValue(raw) {
  if (/^\[.*\]$/.test(raw)) {
    return raw
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim().replace(/^(["'])(.*)\1$/, '$2'))
      .filter(Boolean);
  }
  return raw.replace(/^(["'])(.*)\1$/, '$2');
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inline(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noopener">$1</a>');
}

const HR = /^\s*([-*_])(\s*\1){2,}\s*$/;
const HEADING = /^(#{1,6})\s+(.*)$/;
const QUOTE = /^>\s?/;
const BULLET = /^\s*[-*+]\s+/;
const NUMBERED = /^\s*\d+\.\s+/;

function isBlockStart(line) {
  return HEADING.test(line) || HR.test(line) || QUOTE.test(line) || BULLET.test(line) || NUMBERED.test(line);
}

// Lines inside one block are joined with <br> so poem stanzas keep their shape.
function lines(buffer) {
  return buffer.map(inline).join('<br>\n');
}

export function renderMarkdown(source) {
  const input = source.replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let i = 0;

  while (i < input.length) {
    const line = input[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      // The page already has an <h1>, so document headings start at <h2>.
      const level = Math.min(heading[1].length + 1, 6);
      out.push('<h' + level + '>' + inline(heading[2]) + '</h' + level + '>');
      i++;
      continue;
    }

    if (HR.test(line)) {
      out.push('<hr>');
      i++;
      continue;
    }

    if (QUOTE.test(line)) {
      const buffer = [];
      while (i < input.length && QUOTE.test(input[i])) {
        buffer.push(input[i].replace(QUOTE, ''));
        i++;
      }
      out.push('<blockquote><p>' + lines(buffer) + '</p></blockquote>');
      continue;
    }

    if (BULLET.test(line) || NUMBERED.test(line)) {
      const ordered = NUMBERED.test(line);
      const pattern = ordered ? NUMBERED : BULLET;
      const items = [];
      while (i < input.length && pattern.test(input[i])) {
        items.push(input[i].replace(pattern, ''));
        i++;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push('<' + tag + '>' + items.map((item) => '<li>' + inline(item) + '</li>').join('') + '</' + tag + '>');
      continue;
    }

    const buffer = [];
    while (i < input.length && input[i].trim() && !isBlockStart(input[i])) {
      buffer.push(input[i]);
      i++;
    }
    out.push('<p>' + lines(buffer) + '</p>');
  }

  return out.join('\n');
}
