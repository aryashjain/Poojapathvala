# Adding content

Texts are Markdown files in `content/`. The site is built from that folder, and nothing
is stored in KV except reader feedback. To add or change a text, add or edit a file, commit,
and push.

```
content/
  hindu/                    → /t/hindu
    topic.md
    hanuman-chalisa.md      → /t/hindu/hanuman-chalisa
  jain/                     → /t/jain
    topic.md
  aarti/                    → /t/aarti
    topic.md
  pooja/                    → /t/pooja
    topic.md
```

Folder and file names become URLs, so use lowercase letters, digits and hyphens.

## Collection (`topic.md`)

```markdown
---
title: Hindu Religious Texts
titleHi: "हिंदू धार्मिक ग्रंथ"
description: Chalisas, stotras, ashtaks, mantras and devotional texts from the Hindu tradition.
descriptionHi: "चालीसा, स्तोत्र, अष्टक, मंत्र और पूजा-पाठ की रचनाएँ।"
order: 1
---

Optional intro shown above the list of texts.
```

## Text (any other `.md` file)

```markdown
---
title: "Hanuman Chalisa"
hindiTitle: "श्री हनुमान चालीसा"
description: "Forty verses in praise of Hanuman."
descriptionHi: "तुलसीदास रचित हनुमान जी की स्तुति के चालीस छंद।"
author: "Goswami Tulsidas"
readingTime: "4 min"
tags: [hanuman, chalisa]
featured: true
order: 1
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
| `description`| no       | Short summary, used in lists, search and link previews. |
| `descriptionHi` | no    | Hindi summary. Shown when the site is in Hindi (the default). |
| `author`     | no       | Shown in the byline. |
| `readingTime`| no       | Free text, e.g. `"4 min"`. |
| `tags`       | no       | A list: `[a, b]`. Tags are searchable. |
| `featured`   | no       | `true` puts the text in the home page "Featured" list. |
| `order`      | no       | Lower numbers first. Without it, texts sort by title. |
| `date` / `updatedAt` | no | `YYYY-MM-DD`. `updatedAt` is accepted as an alias of `date`. |

The site opens in Hindi by default. Visitors switch to English with the header toggle,
which stores their choice in a cookie. Any field with a `...Hi` twin falls back to the
English value when the Hindi one is missing.

## Feedback and KV

KV (the `LIBRARY` namespace) holds one thing: reader feedback, under a single key
`feedback`, newest first, capped at 500 messages. Visitors send feedback at `/feedback`
(linked in the footer). Messages are listed on `/admin`, where email addresses are visible
to the admin only.

Spam controls: a hidden honeypot field, and posts from other sites are rejected. There is
no rate limit yet.

Free-tier KV limits matter here: saving feedback is one read and one write, and the admin
page is one read. Public pages never touch KV.

## Admin

`/admin` is protected by HTTP Basic auth with the `ADMIN_PASSWORD` secret. It lists feedback
and nothing else. Texts are not managed there.

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
