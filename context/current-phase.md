# Current Phase

## Phase

**Phase 0 — Scaffold** (completed)

Next: **Phase 1 — Players** ([phase-1.md](phases/phase-1.md))

## Status

Completed

## Goals

- [x] Vite + React + TypeScript project scaffold
- [x] React Router with all MVP routes
- [x] Mobile-first `AppShell`, festive green/gold theme
- [x] Hungarian UI on Home and placeholder pages
- [x] `AppState` types, `loadState` / `saveState` / `migrate`
- [x] `useAppState` + `useActiveMatch` hooks (persistence ready)
- [x] No business logic (player CRUD, scoring, titles deferred)

## What was built

### Tooling

| Item | Detail |
|------|--------|
| Stack | Vite 8, React 19, TypeScript, `react-router-dom` |
| Package name | `lengoteke` |
| Storage key | `lengoteke:v1:state` |

### Routes

| Path | Page | State |
|------|------|-------|
| `/` | Home | Live — nav + active match resume link |
| `/players` | Játékosok | Placeholder |
| `/match/new` | Új meccs | Placeholder |
| `/match/play` | Játék | Placeholder |
| `/match/leaderboard` | Eredménytábla | Placeholder |
| `/match/end` | Meccs vége | Placeholder |
| `/history` | Előzmények | Placeholder |
| `/history/:matchId` | Meccs részletei | Placeholder |

### Source layout

```
src/
├── types/index.ts
├── constants/{storage,scoring,titles}.ts
├── storage/{defaultState,migrate,loadState,saveState}.ts
├── hooks/{useAppState,useActiveMatch}.ts
├── utils/{ids,format,scoring,titles}.ts
├── components/layout/{AppShell,PageHeader}.tsx
├── components/common/PlaceholderPage.tsx
└── pages/{Home,Players,NewMatch,Play,Leaderboard,MatchEnd,History}.tsx
```

### Storage layer

- **loadState**: parse JSON → migrate → normalize (scores clamped 0–10, active match validated)
- **saveState**: returns `{ ok: true }` or `{ ok: false, error: 'quota' | 'unknown' }`
- **useAppState**: `update(fn)` and `replace(state)` persist immediately; exposes `lastSaveError`

## Notes

- Scaffold created via `npm create vite` in `_scaffold`, then moved to repo root (root was non-empty).
- `utils/titles.ts` and full ranking helpers are stubs until Phase 4–5.
- Per workflow: branch/commit not done — ask before `git commit`.
- Plan file (`lengoteke-plan.md`) not written (user asked not to edit plan file).

## Verification

Run from project root:

```bash
npm run build
npm run dev
```

Expected: build passes; Home shows Hungarian menu; all routes render placeholders.

## History

- 2026-05-27 — Phase 0 completed: Vite scaffold, router, types, localStorage layer, placeholder pages, `current-phase.md` documented.
