// Imports texts from inbox/*.txt into content/<collection>/<slug>.md.
//
// Format (see inbox/sample.txt):
//   === collection | slug | English title | Hindi title ===
//   @description: ...        (optional, before the text)
//   @descriptionHi: ...      (optional)
//   @order: 10               (optional)
//   @tags: a, b              (optional)
//   <Hindi text>
//   :::english
//   <English text, optional>
//
// Rules:
// - Lines starting with "# " (hash, space) are comments and are never published.
// - Files whose name starts with "sample" are ignored.
// - An entry with no Hindi text left (only comments) is skipped and reported.
// - The collection folder must already exist under content/.
import { readdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const INBOX = path.join(ROOT, 'inbox');
const CONTENT = path.join(ROOT, 'content');
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEADER = /^===\s*(.+?)\s*===\s*$/;
const META = /^@(\w+):\s*(.*)$/;

const quote = (value) => JSON.stringify(String(value ?? ''));

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function parseFile(text) {
  const entries = [];
  let current = null;
  let inMeta = false;

  for (const raw of text.split(/\r?\n/)) {
    const header = raw.match(HEADER);
    if (header) {
      const [collection = '', slug = '', title = '', hindiTitle = ''] = header[1].split('|').map((part) => part.trim());
      current = { collection, slug, title, hindiTitle, meta: {}, body: [] };
      entries.push(current);
      inMeta = true;
      continue;
    }
    if (!current) continue;
    if (/^# /.test(raw)) continue; // comment line

    const meta = raw.match(META);
    if (inMeta && meta) {
      current.meta[meta[1]] = meta[2].trim();
      continue;
    }
    if (raw.trim() !== '') inMeta = false;
    current.body.push(raw);
  }
  return entries;
}

function splitBody(lines) {
  const index = lines.findIndex((line) => line.trim() === ':::english');
  const hindi = (index === -1 ? lines : lines.slice(0, index)).join('\n').trim();
  const english = index === -1 ? '' : lines.slice(index + 1).join('\n').trim();
  return { hindi, english };
}

async function main() {
  const names = (await readdir(INBOX)).filter((name) => name.endsWith('.txt') && !name.startsWith('sample'));
  let published = 0;
  const skipped = [];

  for (const name of names) {
    const entries = parseFile(await readFile(path.join(INBOX, name), 'utf8'));
    for (const entry of entries) {
      const where = name + ' → ' + entry.slug;
      if (!SLUG.test(entry.slug)) {
        skipped.push(where + ' (slug must be lowercase letters, digits and hyphens)');
        continue;
      }
      if (!(await exists(path.join(CONTENT, entry.collection)))) {
        skipped.push(where + ' (no collection folder "' + entry.collection + '")');
        continue;
      }
      const { hindi, english } = splitBody(entry.body);
      if (!hindi || hindi.includes('ADD HINDI TEXT')) {
        skipped.push(where + ' (no Hindi text yet)');
        continue;
      }

      const tags = (entry.meta.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean);
      const frontmatter = [
        '---',
        'title: ' + quote(entry.title),
        ...(entry.hindiTitle ? ['hindiTitle: ' + quote(entry.hindiTitle)] : []),
        'description: ' + quote(entry.meta.description || ''),
        'descriptionHi: ' + quote(entry.meta.descriptionHi || ''),
        'order: ' + (Number(entry.meta.order) || 9999),
        'tags: [' + tags.join(', ') + ']',
        '---',
        '',
      ];
      const body = hindi + (english ? '\n\n:::english\n' + english : '');
      await writeFile(path.join(CONTENT, entry.collection, entry.slug + '.md'), frontmatter.join('\n') + '\n' + body + '\n');
      published++;
      console.log('published  ' + entry.collection + '/' + entry.slug + (english ? '  (with English)' : ''));
    }
  }

  for (const line of skipped) console.log('skipped    ' + line);
  console.log('[import-inbox] published ' + published + ', skipped ' + skipped.length);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
