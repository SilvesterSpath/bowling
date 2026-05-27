# Current Phase

## Phase

**Bajnokság titles — Phase 1** (completed)

Live per-round funny + descriptive subtitles in párharc and döntő kör scoring.

## Status

Completed — 2026-05-27

**Branch:** `feature/bajnoksag-titles`

## Goals (Titles Phase 1)

- [x] `src/hooks/useRoundTitleDisplayMap.ts` — wraps `computeRoundTitles` + `toRoundTitleDisplayMap`
- [x] `PlayMatchPage` refactored to hook (Meccs behavior unchanged)
- [x] `TournamentDuelPage` — titles on viewed main round; `roundIndex` resets when `duel.id` changes
- [x] `TournamentTiebreakPage` — titles on active döntő kör; `roundIndex = roundsPerDuel + tieBreakIndex + 1`
- [x] Player order `[playerAId, playerBId]` (matches `createDuel`)
- [x] `npm run build` + `npm run test` (17/17) + `npm run lint` (clean)

## What was built

| File | Change |
|------|--------|
| `src/hooks/useRoundTitleDisplayMap.ts` | **New** shared hook for live round titles |
| `src/pages/PlayMatchPage.tsx` | Uses hook instead of inline `useMemo` |
| `src/pages/TournamentDuelPage.tsx` | Hook + duel-id sync for navigator round |
| `src/pages/TournamentTiebreakPage.tsx` | Hook; hooks called before early returns |

## Behavior

- Titles appear only when the current round is complete (same as Meccs).
- Tie-break uses a higher synthetic `roundIndex` so repeated döntő körök get varied funny lines.
- No changes to `roundTitles.ts` classification logic.

## Automated verification

| Check | Result |
|-------|--------|
| `npm run build` | Pass |
| `npm run test` | 17/17 pass |
| `npm run lint` | Pass |

## Manual smoke (recommended)

- [ ] Bajnokság párharc: fill both scores in a kör → funny + gap lines under names
- [ ] Navigate prev/next kör → titles update per viewed round
- [ ] Tie-break after döntetlen → titles on döntő kör when complete
- [ ] Meccs `/match/play` still shows round titles

## Titles implementation phases

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 0 | Context + regression gate | Done |
| 1 | Live round titles (duel + tiebreak) | **Done** |
| 2 | Elimination rankings + placement compute | Next |
| 3 | `Tournament.titles` + champion UI | Pending |
| 4 | History recap + placement in detail | Pending |
| 5 | Docs + sign-off | Pending |

## Next phase

**Titles Phase 2 — Placement data layer**

- `getTournamentEliminationRankings(tournament)`
- `computeTournamentPlacementTitles(tournament)`
- Unit tests (2 / 3 / 4 / 5 players)

## References

- [bajnoksag-plan.md](../bajnoksag-plan.md)
- Cursor plan: `bajnokság_funny_titles_31e0fae8.plan.md`

## History

- 2026-05-27 — Titles Phase 0: branch + baseline verification.
- 2026-05-27 — Titles Phase 1: `useRoundTitleDisplayMap` + duel/tiebreak wiring.
