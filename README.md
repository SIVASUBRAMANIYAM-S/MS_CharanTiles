# MS Charan Tiles

Cross-platform tile catalog + e-commerce POC built with Expo SDK 57, React Native 0.86, Expo Router and Supabase.

## Setup

```bash
npm install
cp .env.example .env   # fill in Supabase values
npx expo start
```

Requires Node.js `^20.19.4` or `^22.13.0`+.

## Scripts

| Script              | Purpose                   |
| ------------------- | ------------------------- |
| `npm start`         | Start the Expo dev server |
| `npm run lint`      | ESLint (flat config)      |
| `npm run format`    | Prettier write            |
| `npm run typecheck` | `tsc --noEmit`            |

## Layout

- `app/` — Expo Router routes (`(tabs)`, product, category, auth, checkout, order)
- `components/` — `ui/`, `catalog/`, `checkout/`
- `lib/` — `supabase.ts` client, `queries/`, `store/` (zustand), `theme/`
- `types/database.ts` — generated Supabase types
