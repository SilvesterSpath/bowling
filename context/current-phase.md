# Current Phase

## Phase

**Bajnokság Phase 5 — History** (completed)

Phase 6 is final QA, backup restore with tournaments, and full regression.

## Status

Completed — 2026-05-27

## Goals (Phase 5)

- [x] `getHistoryEntries(state)` — merged matches + tournaments, date desc
- [x] Unified `HistoryList` with **Meccs** / **Bajnokság** badges
- [x] `TournamentHistoryDetailPage` + `TournamentBracketView`
- [x] Routes `/history/match/:id` and `/history/tournament/:id`
- [x] Legacy redirect `/history/:id` → correct detail route
- [x] Match history detail unchanged (`HistoryMatchPage` + `HistoryDetail`)
- [x] Bracket: rounds, duels, scores, tie-breaks, erőnyerő, champion highlight
- [x] `npm run build` + `npm run test` pass

## What was built

| File | Purpose |
|------|---------|
| `src/utils/history.ts` | `HistoryEntry`, `getHistoryEntries`, `getTournamentById`, champion label |
| `src/components/history/HistoryList.tsx` | Unified cards + badges |
| `src/components/tournament/TournamentBracketView.tsx` | Read-only ágrajz |
| `src/pages/HistoryPage.tsx` | List only |
| `src/pages/HistoryMatchPage.tsx` | Meccs detail (extracted) |
| `src/pages/TournamentHistoryDetailPage.tsx` | Bajnokság detail |
| `src/pages/HistoryLegacyRedirect.tsx` | Old `/history/:id` URLs |
| `src/App.tsx` | Split history routes |
| `src/index.css` | Badges, bracket, champion block styles |

## Routes

| Route | Screen |
|-------|--------|
| `/history` | Unified list |
| `/history/match/:matchId` | Meccs részletei (`HistoryDetail`) |
| `/history/tournament/:tournamentId` | Bajnokság ágrajz |
| `/history/:legacyId` | Redirect to match or tournament detail |

## History list cards

| Kind | Badge | Meta line |
|------|-------|-----------|
| Meccs | **Meccs** | `{n} játékos · {k} kör` + Győztes |
| Bajnokság | **Bajnokság** | `{n} játékos · {szakasz} szakasz` + Győztes |

Sorted by `completedAt` (newest first).

## Tournament detail

- Date, **Bajnokság győztese** name
- **Ágrajz:** each szakasz (label), erőnyerő if any
- Per párharc: names, kör scores table, összesen, döntő körök, győztes
- Champion-path duels get gold border highlight

## Verification

| Check | Result |
|-------|--------|
| `npm run build` | Pass |
| `npm run test` | 8/8 pass |
| Meccs detail | Same `HistoryDetail` component |
| Backup JSON | Already includes `tournaments` from schema v2 |

## Manual smoke test (recommended)

- [ ] Complete a meccs → appears in Előzmények with **Meccs** badge
- [ ] Complete a bajnokság → appears with **Bajnokság** badge
- [ ] Open tournament detail → ágrajz, champion, tie-break rows if played
- [ ] Old bookmark `/history/{matchId}` still works via redirect
- [ ] Meccs detail link `/history/match/{id}` works

## Next phase

**Phase 6 — QA and backup**

- Full flows: 3 / 4 / 5 players, bye, tie-break repeat
- Backup export/import with tournaments in JSON
- Verify zero Meccs regressions
- Optional: `getHistoryEntries` unit test

## Bajnokság feature summary (Phases 1–5)

| Phase | Deliverable |
|-------|-------------|
| 1 | Schema v2, tournament utils, tests |
| 2 | Setup, home, hub |
| 3 | Duel + tie-break scoring |
| 4 | Champion screen + finalize |
| 5 | Unified Előzmények |

## References

- [bajnoksag-plan.md](../bajnoksag-plan.md)

## History

- 2026-05-27 — MVP Meccs Phases 0–8.
- 2026-05-27 — Bajnokság Phases 0–4.
- 2026-05-27 — Bajnokság Phase 5: unified history + bracket detail.
