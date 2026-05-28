# B2B Sanity Studio

Content workspace for the B2B storefront.

## Setup
1. Create a free project at https://sanity.io and note the **project ID**.
2. `cd studio && npm install`
3. Set `SANITY_STUDIO_PROJECT_ID` (env var, or edit `sanity.config.js`).
4. `npm run dev` — Studio runs at http://localhost:3333
5. Add products / reviews, then in the storefront set `VITE_SANITY_PROJECT_ID` (in `.env`) to the same project ID and restart `npm run dev`. The storefront switches from seed data to Sanity automatically.

Schemas live in `schemas/` and mirror the seed-data shape in `../src/data/`.
