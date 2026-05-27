# Current Phase

## Phase

**Phase 6 — Előzmények** (completed)

Next: **Phase 7 — Polish** ([phase-7.md](phases/phase-7.md))

## Status

Completed

## Goals

- [x] List completed matches, newest first
- [x] History card: name, date, winner(s), player/round count
- [x] Detail: frozen leaderboard from match data
- [x] Detail: stored `titles` (read-only, no recompute)
- [x] Detail: compact round-by-round score table
- [x] Empty state: „Még nincs befejezett meccs…”
- [x] Invalid / non-completed match id → friendly error + back link
- [x] Hungarian UI throughout

## What was built

| File | Purpose |
|------|---------|
| `src/utils/history.ts` | `getCompletedMatches`, `getMatchById`, `getWinnerLabel` |
| `src/components/history/HistoryList.tsx` | Clickable match cards |
| `src/components/history/HistoryDetail.tsx` | Read-only recap |
| `src/pages/HistoryPage.tsx` | List + detail routes |
| `src/index.css` | History list, detail, rounds table styles |

## Routes

| Path | View |
|------|------|
| `/history` | Completed matches list |
| `/history/:matchId` | Match detail (read-only) |

## Browser verification

**Dev server:** `http://localhost:5174/history`

| Test | Result |
|------|--------|
| List | Shows „Teszt Kupa” with date, győztes, counts |
| Detail | Végeredmény, Címek, Körök sections |
| Stored titles | Anna + Béla Kupaőr titles from finalize |
| Invalid id | Error message + vissza link |
| Build | `npm run build` passes (60 modules) |

## Notes

- `phase-6.md` previously duplicated Phase 5 (titles) — corrected to Előzmények spec (titles done in Phase 5).
- Delete match from history remains out of scope (low priority).

## History

- 2026-05-27 — Phases 0–5: Through Meccs vége és címek.
- 2026-05-27 — Phase 6: Előzmények list + detail, browser tests.
