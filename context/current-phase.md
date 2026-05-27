# Current Phase

## Phase

**Bajnokság titles — Phase 0** (completed)

Context sign-off before implementing funny round titles + tournament placement titles. Builds on **Bajnokság v1** (Phases 0–6) and **Meccs MVP** (Phases 0–8).

## Status

Completed — 2026-05-27

**Branch:** `feature/bajnoksag-titles`

## Goals (Titles Phase 0)

- [x] On feature branch `feature/bajnoksag-titles` (from `main`)
- [x] `npm run build` + `npm run test` (17/17) + `npm run lint` (clean)
- [x] Meccs title paths verified unchanged (play, leaderboard, end, history)
- [x] Bajnokság gap documented (empty title maps on duel/tiebreak; no `tournament.titles`)
- [x] Scope confirmed with product owner: per-round funny + all-entrant placement at bajnokság end
- [x] Constraints recorded (reuse `roundTitles.ts`, no Meccs behavior change)

## Automated verification

| Check | Result |
|-------|--------|
| `npm run build` | Pass |
| `npm run test` | 17/17 pass |
| `npm run lint` | Pass |
| Branch | `feature/bajnoksag-titles` |

## Meccs baseline (must not regress)

| Path | Round funny titles | Placement titles |
|------|-------------------|------------------|
| `/match/play` | `computeRoundTitles` → `RoundScoreGrid` | — |
| `/match/leaderboard` | Latest complete round | — |
| `/match/end` | `RoundTitlesRecap` | `computePlacementTitles` → stored on `match.titles` |
| `/history/match/:id` | `RoundTitlesRecap` in `HistoryDetail` | Stored `match.titles` |

**Phase 0 rule:** Do not edit `roundTitles.ts` classification logic or `MatchEndPage` finalize behavior during titles work.

## Bajnokság gap (what Phases 1–5 will fill)

| Area | Today | Target |
|------|--------|--------|
| `TournamentDuelPage` | `titlesByPlayerId={new Map()}` | Live funny + gap subtitles per kör |
| `TournamentTiebreakPage` | `titlesByPlayerId={new Map()}` | Same for döntő kör |
| `TournamentChampionPage` | Champion hero only | **Helyezési címek** for all entrants |
| `Tournament` type | No `titles` field | Optional `titles?: PlayerTitle[]` on finalize |
| `TournamentHistoryDetailPage` | Ágrajz only | Placement block + per-duel round title recap |

## Confirmed scope (titles feature)

**In scope**

- Per-round funny titles in párharc + döntő kör (reuse `computeRoundTitles`)
- Bracket elimination rankings → placement labels for every entrant
- Persist `tournament.titles` on finalize (like Meccs `match.titles`)
- History detail parity

**Out of scope**

- Per-duel placement screen between párharc and hub
- Duel hub leaderboard route
- Pin-total rankings across the whole tournament
- Changes to Hungarian variant tables in `constants/roundTitles.ts`

## Titles implementation phases

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 0 | Context + regression gate | **Done** |
| 1 | `useRoundTitleDisplayMap` + duel/tiebreak pages | Next |
| 2 | `getTournamentEliminationRankings` + `computeTournamentPlacementTitles` | Pending |
| 3 | `Tournament.titles` + champion **Helyezési címek** | Pending |
| 4 | History recap + placement in detail | Pending |
| 5 | Docs + full sign-off | Pending |

## Next phase

**Titles Phase 1 — Live round titles**

- Add `src/hooks/useRoundTitleDisplayMap.ts`
- Refactor `PlayMatchPage` to use hook (no behavior change)
- Wire `TournamentDuelPage` + `TournamentTiebreakPage`
- Sync `roundIndex` when `duel.id` changes

## References

- [bajnoksag-plan.md](../bajnoksag-plan.md) — v1 spec (line 397 deferred titles; superseded by titles plan)
- [bajnoksag-phase0-review.md](../bajnoksag-phase0-review.md) — original Meccs stability review
- [bajnoksag-phase6-qa.md](../bajnoksag-phase6-qa.md) — v1 QA sign-off
- Cursor plan: `bajnokság_funny_titles_31e0fae8.plan.md` (phases 0–5)

## Bajnokság v1 summary (unchanged)

| Phase | Deliverable |
|-------|-------------|
| 0 | Meccs stability review |
| 1 | Schema v2, tournament utils |
| 2 | Setup, home, hub |
| 3 | Duel + tie-break |
| 4 | Champion + finalize |
| 5 | Unified Előzmények |
| 6 | QA, backup, lint |

## History

- 2026-05-27 — MVP Meccs Phases 0–8.
- 2026-05-27 — Bajnokság v1 Phases 0–6.
- 2026-05-27 — Titles Phase 0: branch + baseline verification, scope sign-off.
