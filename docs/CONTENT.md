# Adding content

Every collection is a folder under `content/`. Every text is a Markdown file inside it.

```
content/
  hindu/                    → /t/hindu
    topic.md
    hanuman-chalisa.md      → /t/hindu/hanuman-chalisa
    shiv-chalisa.md
  jain/                     → /t/jain
    topic.md
    bhaktamar-stotra.md
    navkar-mantra.md
```

## Feedback

Visitors can send feedback at `/feedback` (linked in the footer). Messages are stored
in the `LIBRARY` KV namespace and listed on `/admin`. Email addresses are only shown to
the admin. The form has a hidden honeypot field, and posts from other sites are rejected.
There is no rate limit yet.

Folder and file names become URLs, so use lowercase letters, digits and hyphens.

## Collection (`topic.md`)

```markdown
---
title: Hindu Religious Texts
titleHi: "हिंदू धार्मिक ग्रंथ"
description: Chalisas, aartis, stotras and mantras from the Hindu tradition.
descriptionHi: "हिंदू परंपरा के चालीसा, आरती, स्तोत्र और मंत्र।"
order: 1
---

Optional intro shown above the list of texts.
```

The site opens in Hindi by default. Visitors switch to English with the header
toggle, which stores their choice in a cookie. Any field with a `...Hi` twin
falls back to the English value when the Hindi one is missing.

## Text (any other `.md` file)

```markdown
---
title: "Hanuman Chalisa"
hindiTitle: "श्री हनुमान चालीसा"
description: "Forty verses in praise of Hanuman."
author: "Goswami Tulsidas"
readingTime: "4 min"
tags: [hanuman, chalisa]
featured: true
order: 1
updatedAt: 2026-11-22
---

## दोहा

श्रीगुरु चरन सरोज रज, निज मनु मुकुरु सुधारि।  
बरनउँ रघुबर बिमल जसु, जो दायकु फल चारि॥

A blank line starts a new stanza. A single line break inside a stanza is kept.
```

| Field        | Required | Notes |
| ------------ | -------- | ----- |
| `title`      | yes      | Shown as the page heading. |
| `hindiTitle` | no       | Shown under the heading in Devanagari. |
| `descriptionHi` | no    | Hindi summary. Shown when the site is in Hindi (the default). |
| `description`| no       | Short summary, used in lists, search and link previews. |
| `author`     | no       | Shown in the byline. |
| `readingTime`| no       | Free text, e.g. `"4 min"`. |
| `tags`       | no       | A list: `[a, b]`. |
| `featured`   | no       | `true` puts the text in the home page "Featured" list. |
| `order`      | no       | Lower numbers first. Without it, texts sort by title. |
| `date` / `updatedAt` | no | `YYYY-MM-DD`. `updatedAt` is accepted as an alias of `date`. |

## Adding texts in the browser

Open `/admin` (linked in the footer). Sign in with the admin password, then:

1. **Create a collection:** title, optional description, order and intro.
2. **Add a text:** pick the collection, then give it a title and paste the Markdown.

Texts added this way are stored in the `LIBRARY` KV namespace, not in the repo.
Files in `content/` still work and are merged with them.

One-time setup for deployment:

```sh
npx wrangler kv namespace create LIBRARY     # paste the printed id into wrangler.toml
npx wrangler secret put ADMIN_PASSWORD       # choose the admin password
```

For local development, put `ADMIN_PASSWORD=...` in `.dev.vars` (git-ignored).

## Building

```sh
npm run dev       # local preview at http://localhost:8787
npm test          # rebuilds content, runs tests
npm run deploy    # rebuilds content and deploys with wrangler
```

The build step writes `src/content.generated.js` from `content/`. That file is
git-ignored; never edit it by hand.
