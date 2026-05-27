# Current Phase

## Phase

**Phase 5 — Meccs vége és címek** (completed)

Next: **Phase 6 — Előzmények** ([phase-6.md](phases/phase-6.md))

## Status

Completed

## Goals

- [x] `computeTitles()` with priority rules (champion → default)
- [x] Meccs vége page: végeredmény + címek
- [x] `TitleCard` component
- [x] **Befejezés** — `status: completed`, `completedAt`, persist `titles`
- [x] Clear `activeMatchId` on finalize
- [x] Prune completed matches to max 50 (`pruneCompletedMatches`)
- [x] Links to `/match/end` from Játék and Eredménytábla
- [x] Hungarian UI throughout

## What was built

| File | Purpose |
|------|---------|
| `src/utils/titles.ts` | Stats + priority title assignment |
| `src/utils/match.ts` | `pruneCompletedMatches` |
| `src/components/leaderboard/TitleCard.tsx` | Player + title display |
| `src/pages/MatchEndPage.tsx` | Leaderboard, titles, finalize |
| `src/pages/LeaderboardPage.tsx` | Meccs vége link |
| `src/pages/PlayMatchPage.tsx` | Meccs vége link |

## Title rules (priority)

1. champion — rank 1  
2. last_place — last rank (≥2 players)  
3. high_roller — max round === global max  
4. gutter_king — most nullák (zeros)  
5. steady_eddie — lowest std dev (≥2 scored rounds)  
6. roller_coaster — highest max−min spread  
7. clutch_finisher — best score in final round  
8. slow_starter — biggest 2nd-half improvement  
9. party_animal — middle rank  
10. default — fallback  

Each player receives exactly one title.

## Browser verification

**Dev server:** `http://localhost:5174/`

| Test | Result |
|------|--------|
| `/match/end` with tied leaders | Both show „Kupaőr — A Szilveszter Kupája” |
| Befejezés | Redirect home; no Folytatás link |
| localStorage | `activeMatchId: null`, 1 completed match, 2 titles saved |
| Build | `npm run build` passes (58 modules) |

## Notes

- `phase-5.md` previously duplicated Phase 4 text — corrected to Meccs vége spec.
- History list UI still Phase 6.

## History

- 2026-05-27 — Phases 0–4: Scaffold through Eredménytábla.
- 2026-05-27 — Phase 5: Titles, Meccs vége, finalize + prune, browser tests.
