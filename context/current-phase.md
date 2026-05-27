# Current Phase

## Phase

**Bajnokság titles — Phase 3** (completed)

Persist placement titles on finalize and show **Helyezési címek** on the champion screen.

## Status

Completed — 2026-05-27

**Branch:** `feature/bajnoksag-titles`

## Goals (Titles Phase 3)

- [x] `Tournament.titles?: PlayerTitle[]` on type
- [x] `loadState` — `normalizePlayerTitles` for matches + tournaments
- [x] `finalizeActiveTournament` — sets `titles: computeTournamentPlacementTitles(...)`
- [x] `TournamentChampionPage` — **Helyezési címek** section for all entrants (live compute, matches finalize snapshot)
- [x] Test: finalize persists titles
- [x] `npm run build` + `npm run test` (25/25) + `npm run lint` (clean)

## What was built

| File | Change |
|------|--------|
| `src/types/tournament.ts` | Optional `titles?: PlayerTitle[]` |
| `src/storage/loadState.ts` | `normalizePlayerTitles`; tournament + match titles |
| `src/utils/tournament.ts` | Finalize stores placement titles |
| `src/pages/TournamentChampionPage.tsx` | `TitleCard` list below champion hero |
| `src/index.css` | `champion-page__placements` spacing |
| `src/utils/placementTitles.test.ts` | Finalize persistence test |

## Champion screen flow

1. Bracket completes → champion screen (trophy + name).
2. **Helyezési címek** — every entrant with bracket-based placement label (same order as rankings).
3. **Befejezés** → `status: completed`, `titles` saved, `activeTournamentId` cleared.

## Automated verification

| Check | Result |
|-------|--------|
| `npm run build` | Pass |
| `npm run test` | 25/25 pass |
| `npm run lint` | Pass |

## Manual smoke (recommended)

- [ ] Finish a bajnokság → champion page shows all **Helyezési címek**
- [ ] **Befejezés** → export JSON includes `tournament.titles`
- [ ] Reload → completed tournament still has `titles` in state

## Titles implementation phases

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 0 | Context + regression gate | Done |
| 1 | Live round titles (duel + tiebreak) | Done |
| 2 | Elimination rankings + placement compute | Done |
| 3 | Persist + champion UI | **Done** |
| 4 | History recap + placement in detail | Next |
| 5 | Docs + sign-off | Pending |

## Next phase

**Titles Phase 4 — History parity**

- Generalize `RoundTitlesRecap` for duels
- `DuelRoundTitlesRecap` in tournament history detail
- Show stored `tournament.titles` on `/history/tournament/:id`

## References

- Cursor plan: `bajnokság_funny_titles_31e0fae8.plan.md`

## History

- 2026-05-27 — Titles Phases 0–2.
- 2026-05-27 — Titles Phase 3: `Tournament.titles`, champion placements, finalize persist.
