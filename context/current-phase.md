# Current Phase

## Phase

**Phase 4 — Eredménytábla** (completed)

Next: **Phase 5 — Meccs vége / címek** ([phase-5.md](phases/phase-5.md))

## Status

Completed

## Goals

- [x] Calculate total score per player (`getPlayerTotal`)
- [x] Sort by score descending with competition ranking (`getRankings`)
- [x] Handle ties (shared rank 1, 1, 3…)
- [x] Show rank, player name, total, nullák (zero-score count)
- [x] Highlight first place row(s)
- [x] Live data from active match via `useActiveMatch`
- [x] Hungarian column labels
- [x] Guard: redirect home if no active match
- [x] Link from Játék page to Eredménytábla

## What was built

| File | Purpose |
|------|---------|
| `src/utils/scoring.ts` | `getRankings`, `getPlayerMisses`, `RankingEntry` |
| `src/components/leaderboard/LeaderboardTable.tsx` | Table UI + leader highlight |
| `src/pages/LeaderboardPage.tsx` | Active match leaderboard |
| `src/pages/PlayMatchPage.tsx` | Eredménytábla button |
| `src/index.css` | Leaderboard table styles |

## Ranking rules

- **Összesen:** sum of entered round scores (null rounds count as 0).
- **Nullák:** count of rounds where score === 0.
- **Helyezés:** competition ranking; tied totals share the same rank.

## Browser verification

**Dev server:** `http://localhost:5174/match/leaderboard`

| Test | Result |
|------|--------|
| With scores Anna 15, Béla 13 | 1. Anna 15, 2. Béla 13 |
| Tie both 15 | Both show rank **1.** (leader highlight) |
| No active match | Redirect to `/` |
| Match name shown | „Teszt Kupa” |
| Build | `npm run build` passes (55 modules) |

## Notes

- Score entry on Játék page still pending (separate phase); leaderboard reads whatever is in `rounds`.
- `phase-4.md` header typo („Phase 5”) corrected to Phase 4.

## History

- 2026-05-27 — Phase 0–3: Scaffold through Új meccs.
- 2026-05-27 — Phase 4: Eredménytábla, ties, nullák, browser tests.
