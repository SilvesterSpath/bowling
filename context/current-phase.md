# Current Phase

## Phase

**Bajnokság titles — Phase 2** (completed)

Bracket elimination rankings and placement title computation (data layer only — no UI yet).

## Status

Completed — 2026-05-27

**Branch:** `feature/bajnoksag-titles`

## Goals (Titles Phase 2)

- [x] `eliminationRankForBracketRound` + `getTournamentEliminationRankings(tournament)`
- [x] `computeTournamentPlacementTitles(tournament)` in `placementTitles.ts`
- [x] Shared `labelForRank` for match + tournament (Meccs `computePlacementTitles` unchanged)
- [x] Unit tests: 2 / 3 / 4 / 5 player elimination ranks
- [x] `placementTitles.test.ts` — match regression + tournament label mapping
- [x] `npm run build` + `npm run test` (24/24) + `npm run lint` (clean)

## Ranking rules

For each completed duel, the **loser** gets a rank from that bracket round’s pool:

- `poolSize = duels.length × 2 + (bye ? 1 : 0)`
- `eliminationRank = poolSize - duels.length + 1`
- `championId` → rank **1**
- Losers in the same round share the same rank (e.g. 4-player semi losers both rank 3)

## What was built

| File | Change |
|------|--------|
| `src/utils/tournament.ts` | `eliminationRankForBracketRound`, `getTournamentEliminationRankings` |
| `src/utils/placementTitles.ts` | `computeTournamentPlacementTitles` |
| `src/utils/tournament.test.ts` | +5 tests for elimination rankings |
| `src/utils/placementTitles.test.ts` | **New** — Meccs + tournament placement labels |

## Automated verification

| Check | Result |
|-------|--------|
| `npm run build` | Pass |
| `npm run test` | 24/24 pass |
| `npm run lint` | Pass |

## Example ranks (verified in tests)

| Players | Champion | 2nd | 3rd / tied |
|---------|----------|-----|------------|
| 2 | a | b | — |
| 3 (bye) | a | c | b |
| 4 | a | c | b, d (tied) |
| 5 | a | e | c; b, d (tied 4th) |

## Titles implementation phases

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 0 | Context + regression gate | Done |
| 1 | Live round titles (duel + tiebreak) | Done |
| 2 | Elimination rankings + placement compute | **Done** |
| 3 | `Tournament.titles` + champion UI | Next |
| 4 | History recap + placement in detail | Pending |
| 5 | Docs + sign-off | Pending |

## Next phase

**Titles Phase 3 — Champion screen + persist**

- `titles?: PlayerTitle[]` on `Tournament`
- `loadState` normalize
- `finalizeActiveTournament` stores titles
- `TournamentChampionPage` — **Helyezési címek** for all entrants

## References

- Cursor plan: `bajnokság_funny_titles_31e0fae8.plan.md`

## History

- 2026-05-27 — Titles Phase 0–1.
- 2026-05-27 — Titles Phase 2: elimination rankings + `computeTournamentPlacementTitles`.
