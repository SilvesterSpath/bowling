# Current Phase

## Phase

**Phase 1 — App state (localStorage)** (completed)

Next: **Phase 2 — Create match** ([phase-2.md](phases/phase-2.md))

## Status

Completed

## Goals

- [x] `AppState`, `Player`, `Match`, `Round`, `RoundScore` types
- [x] `defaultState()`, `loadState()`, `saveState()`, `migrateState()`
- [x] Single key: `lengoteke:v1:state`
- [x] Auto-load on app start (`useState(() => loadState())`)
- [x] Persist on every `update()` / `replace()` via `useAppState`
- [x] Safe recovery from missing / corrupt localStorage
- [x] Hungarian save-error banner (quota / unknown)
- [x] Read-only state summary on Játékosok page (counts only — no CRUD UI)
- [x] Browser verification (see below)

## What changed in Phase 1

| File | Change |
|------|--------|
| `src/hooks/useAppState.tsx` | Functional `update()` — no stale state on rapid writes |
| `src/components/common/SaveErrorBanner.tsx` | Hungarian alert when save fails |
| `src/App.tsx` | Global `SaveErrorBanner` above routes |
| `src/storage/index.ts` | Barrel exports for storage API |
| `src/pages/PlayersPage.tsx` | Read-only counts: játékosok, meccsek, aktív meccs |
| `src/index.css` | Sticky save-error banner + state summary styles |

## Storage API summary

```ts
// Load (app boot)
loadState(): AppState  // corrupt/missing → defaultState()

// Save (every mutation)
saveState(state): { ok: true } | { ok: false; error: 'quota' | 'unknown' }

// React
const { state, update, replace, lastSaveError } = useAppState();
update((prev) => ({ ...prev, players: [...] }));
```

## Browser verification

**Dev server:** `http://localhost:5174/` (`npm run dev`)

| Test | Steps | Result |
|------|--------|--------|
| Home loads | Navigate to `/` | Hungarian title + menu (Új meccs, Játékosok, Előzmények) |
| State hydrate | Inject valid `lengoteke:v1:state` with active match via CDP, reload | **Folytatás — Teszt Meccs** link appears |
| Corrupt recovery | Set `lengoteke:v1:state` to invalid JSON, reload | App loads; no crash; default empty menu (no Folytatás) |
| Players page | `/players` | Játékosok heading; read-only summary shows 0/0/nem after corrupt reset |
| Build | `npm run build` | Passes (43 modules) |

## Notes

- Phase 1 spec: **no player CRUD UI** — deferred to Phase 2+.
- `useActiveMatch` reads `activeMatchId` + `status === 'active'`; Home resume link confirmed in browser.
- Dev server may use port **5174** if 5173 is busy.

## History

- 2026-05-27 — Phase 0 completed: Vite scaffold, router, types, localStorage layer, placeholder pages.
- 2026-05-27 — Phase 1 completed: state hardening, save error UI, functional updates, browser tests documented.
