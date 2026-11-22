# 🪔 	

Poojapathvala.in

**	

Poojapathvala.in** is a fast, clutter-free, SEO-first digital library for sacred religious texts, stotras, chalisas, mantras, and curated poetry. 

Built with a distraction-free, Medium-inspired reading experience, it serves as an all-in-one, shareable home for timeless texts—running completely serverless on **Cloudflare Workers** with zero database overhead.

---

## ✨ Key Features

- **Distraction-Free Reading UI:** Medium-inspired editorial typography with generous whitespace, responsive mobile layout, and crisp Devanagari + Latin font pairing.
- **Topic-First Organization:** Cleanly categorized hubs for **Hindu Religious Texts**, **Jain Religious Texts**, **Poetries by Aryash**, and easily extensible to any new collection.
- **Instant Global Search:** Powered by **Pagefind**—blazing-fast, 100% client-side static search across all titles, verses, Hindi/Devanagari scripts, and Hinglish transliterations.
- **Reader-Friendly Controls:** Adjustable font size (`A-` / `A+`), Light / Sepia / Dark reading modes, and one-click WhatsApp & URL sharing.
- **SEO-First Architecture:** 
  - 100% pre-rendered static HTML (0 KB JS by default).
  - Automatic XML Sitemap, Canonical URLs, and Open Graph (OG) social cards.
  - Built-in JSON-LD structured data (`Article`, `BreadcrumbList`, `WebSite`).
- **Zero Backend, Zero Database:** Git-backed Markdown/MDX content collections deployed globally to **Cloudflare Workers**.

---

## 📚 Content Structure

```text
	

Poojapathvala.in
├── 🕉️ Hindu Religious Texts (/hindu)
│   ├── Hanuman Chalisa (/hindu/hanuman-chalisa)
│   ├── Shiv Chalisa (/hindu/shiv-chalisa)
│   └── ... (Aartis, Stotras, Mantras, Ashtakams)
├── ☸️ Jain Religious Texts (/jain)
│   ├── Bhaktamar Stotra (/jain/bhaktamar-stotra)
│   ├── Navkar Mantra (/jain/navkar-mantra)
│   └── ... (Meri Bhavna, Chhahdhala, Aartis)
└── ✍️ Poetries by Aryash (/poetries-by-aryash)
    └── ... (Original poems & reflections)
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
| :--- | :--- | :--- |
| **Framework** | [Astro](https://astro.build/) | Static HTML output, Content Collections with Zod validation, 100/100 Lighthouse scores |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + Typography | Editorial reading experience, fast styling, easy theme switching |
| **Search** | [Pagefind](https://pagefind.app/) | Static, build-time search index with multilingual (Hindi + English) support |
| **Content** | Markdown / MDX | Version-controlled, portable, zero DB maintenance |
| **Hosting** | [Cloudflare Workers](https://workers.cloudflare.com/) | Edge caching, global low latency, zero cold starts, custom domain SSL |

---

## 📂 Project Directory Structure

```text
Poojapathvala/
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── og-default.png
├── src/
│   ├── components/
│   │   ├── SearchModal.astro      # Global Pagefind search panel
│   │   ├── ReaderControls.astro   # Font size, theme toggle, share buttons
│   │   ├── SEOHead.astro          # Meta tags, OG tags, JSON-LD schema
│   │   └── TopicCard.astro        # Homepage category cards
│   ├── content/
│   │   ├── config.ts              # Zod schema for all documents & topics
│   │   └── texts/
│   │       ├── hindu/
│   │       │   ├── hanuman-chalisa.md
│   │       │   └── shiv-chalisa.md
│   │       ├── jain/
│   │       │   ├── bhaktamar-stotra.md
│   │       │   └── navkar-mantra.md
│   │       └── poetries-by-aryash/
│   │           └── sample-poem.md
│   ├── layouts/
│   │   ├── BaseLayout.astro       # Global shell, header, footer, SEO
│   │   └── ReadingLayout.astro    # Medium-style article layout
│   └── pages/
│       ├── index.astro            # Landing page + Search + Topics
│       ├── [topic]/
│       │   ├── index.astro        # Topic hub listing all texts
│       │   └── [slug].astro       # Individual shareable text page
│       └── 404.astro
├── astro.config.mjs               # Astro, Tailwind & Sitemap config
├── wrangler.jsonc                 # Cloudflare Workers Static Assets config
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** `>= 18.x`
- **Cloudflare Account** & Wrangler CLI (`npm i -g wrangler`)

### 1. Clone & Install
```bash
git clone [https://github.com/](https://github.com/)<your-username>/Poojapathvala.git
cd Poojapathvala
npm install
```

### 2. Local Development
```bash
npm run dev
```
The site will be available at `http://localhost:4321`.

### 3. Build & Generate Search Index
Pagefind indexes the static HTML output after Astro finishes building:
```bash
npm run build
# Runs: astro build && npx pagefind --site dist
```

### 4. Preview Production Build Locally
```bash
npm run preview
```

---

## ☁️ Deploying to Cloudflare Workers

This project uses **Cloudflare Workers Static Assets** for zero-config edge deployment.

### `wrangler.jsonc` Configuration
```jsonc
{
  "name": "Poojapathvala",
  "compatibility_date": "2026-01-01",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  }
}
```

### Deploy via CLI
```bash
npx wrangler login
npm run build
npx wrangler deploy
```

> **Custom Domain:** Map `	

Poojapathvala.in` and `www.	

Poojapathvala.in` directly in the Cloudflare Dashboard under **Workers & Pages → Poojapathvala → Settings → Domains & Routes**.

---

## ✍️ Adding New Texts / Documents

Adding a new prayer, stotra, or poem requires **zero code changes**. Create a `.md` file inside `src/content/texts/<topic-slug>/` using the following frontmatter schema:

```markdown
---
title: "Hanuman Chalisa"
hindiTitle: "श्री हनुमान चालीसा"
topic: "hindu"
topicLabel: "Hindu Religious Texts"
description: "Read the complete Shree Hanuman Chalisa in Hindi (Devanagari) and English with meaning. Clean, ad-free, and easy to share."
author: "Goswami Tulsidas"
language: ["hi", "en"]
tags: ["hanuman", "chalisa", "tulsidas", "bajrangbali", "tuesday"]
readingTime: "4 min"
featured: true
updatedAt: 2026-11-22
---

## दोहा (Doha)

श्रीगुरु चरन सरोज रज, निज मनु मुकुरु सुधारि।  
बरनउँ रघुबर बिमल जसु, जो दायकु फल चारि॥

*Shree Guru Charan Saroj Raj, Nij Man Mukur Sudhari...*

---

## चौपाई (Chaupai)

जय हनुमान ज्ञान गुन सागर।  
जय कपीस तिहुँ लोक उजागर॥
```

Push to `main`, and the new page—complete with search indexing, sitemap entry, and SEO metadata—goes live automatically.

---

## 📈 SEO Checklist

- [x] Semantic URLs (`/topic/document-slug`)
- [x] Multi-script content (Devanagari + Hinglish + English)
- [x] Dynamic `<title>`, `<meta name="description">`, and Canonical tags
- [x] Open Graph & Twitter/WhatsApp card previews
- [x] JSON-LD (`Article` + `BreadcrumbList` + `WebSite`)
- [x] Auto-generated `sitemap-index.xml` & `robots.txt`
- [x] 100/100 Core Web Vitals (Zero-JS static HTML on Cloudflare Edge)

---

## 📄 License

Open-source under the **MIT License**. Sacred texts belong to humanity; original poetries © Aryash Jain.# Poojapathvala
