# Wiki Viki

An internal, document-first wiki built with SvelteKit, JavaScript, Bun, PostgreSQL, and the OpenAI Responses API.

## Setup

Copy `.env.example` to `.env`, set `DATABASE_URL`, and optionally add an OpenAI API key. Without an API key, DOCX/PDF uploads still become review drafts using their extracted text; semantic governance is marked as skipped.

```bash
bun install
bun run migrate
bun run seed
bun run dev
```

`bun run seed` creates the required Wiki Viki policy/help pages and processes every DOCX/PDF in `seed-data/`. Source-file failures are isolated so the remaining files continue.

## Verification

```bash
bun run check
bun run build
```

All editing and discussion handles must match `Editor-01` or `Operator-A` style anonymous identifiers. AI output always enters the Draft → Human Review → Publish workflow, with regex/keyword and semantic governance checks before publishing.
