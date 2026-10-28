# SterlingSend

**This folder is the app.**

## Run

```bash
npm run dev
```

Open **http://localhost:3000**

From parent `Feesz/` folder: `npm run dev` (delegates here).

## AI / project context

Attach **`../PROJECT_CONTEXT.md`** to any AI prompt — full product, stack, routes, and constraints.

## Env

Copy `.env.example` → `.env.local`. Firebase required for login/dashboard; guest + marketing work without it.

## Template thumbnails

Invoice template gallery images live in `public/templates/*.webp`.

Regenerate after layout or palette changes:

```bash
npx playwright install chromium
npx tsx scripts/generate-template-thumbs.ts
```

Thumbs are about 480px wide WebP previews (not live rendered templates).
