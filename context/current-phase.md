# Current Phase

## Phase

**Bajnokság titles** — complete (Phases 0–5)

Funny round titles in párharc scoring + placement titles for all entrants at bajnokság end. Builds on **Bajnokság v1** (Phases 0–6 on `main`).

## Status

Completed — 2026-05-27

**Branch:** `feature/bajnoksag-titles`

## Verdict

**Ready to merge** after optional manual smoke below.

| Area | Result |
|------|--------|
| `npm run build` | Pass |
| `npm run test` | 25/25 pass |
| `npm run lint` | Pass |
| Meccs play / end / history | Unchanged behavior (`PlayMatchPage` uses shared hook only) |
| `roundTitles.ts` rules | Not modified |

---

## Titles phases (0–5)

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 0 | Branch + Meccs baseline gate | Done |
| 1 | `useRoundTitleDisplayMap`; duel + tie-break live titles | Done |
| 2 | `getTournamentEliminationRankings`; `computeTournamentPlacementTitles` | Done |
| 3 | `Tournament.titles`; champion **Helyezési címek**; finalize persist | Done |
| 4 | `DuelRoundTitlesRecap`; history placement + per-duel recap | Done |
| 5 | Sign-off (this file) | Done |

---

## Phase 0 — Context

- [x] Branch `feature/bajnoksag-titles`
- [x] Build / test / lint clean before coding
- [x] Scope: per-round funny + all-entrant placement (not per-duel placement screen)
- [x] Reuse `computeRoundTitles`; do not change Meccs finalize or classification rules

## Phase 1 — Live round titles

- [x] `src/hooks/useRoundTitleDisplayMap.ts`
- [x] `PlayMatchPage`, `TournamentDuelPage`, `TournamentTiebreakPage`
- [x] Tie-break uses `roundsPerDuel + tieBreakIndex + 1` for label variants
- [x] `roundIndex` resets when `duel.id` changes

## Phase 2 — Placement data layer

- [x] `getTournamentEliminationRankings` — bracket bands (`poolSize - duels.length + 1` for losers)
- [x] `computeTournamentPlacementTitles`
- [x] Tests: 2 / 3 / 4 / 5 players + placement label mapping

## Phase 3 — Champion + persist

- [x] `Tournament.titles?: PlayerTitle[]`
- [x] `normalizePlayerTitles` in `loadState`
- [x] `finalizeActiveTournament` stores titles
- [x] `TournamentChampionPage` — **Helyezési címek** for all entrants

## Phase 4 — History

- [x] `RoundTitlesRecapCore` + match wrapper
- [x] `DuelRoundTitlesRecap` in `TournamentBracketView`
- [x] `TournamentHistoryDetailPage` — placement + ágrajz recaps (fallback compute if no stored `titles`)

## Phase 5 — Sign-off

- [x] Final `npm run build` / `test` / `lint`
- [x] Documentation consolidated in this file only

---

## What users get

- **Párharc / döntő kör:** funny + gap subtitles when a kör is complete (same engine as Meccs)
- **Champion screen:** **Helyezési címek** for every entrant before **Befejezés**
- **Előzmények:** `tournament.titles` + **Körönkénti címek** per párharc in ágrajz

## Key files

| Area | Path |
|------|------|
| Hook | `src/hooks/useRoundTitleDisplayMap.ts` |
| Rankings | `src/utils/tournament.ts` |
| Placement | `src/utils/placementTitles.ts` |
| Scoring UI | `src/pages/TournamentDuelPage.tsx`, `TournamentTiebreakPage.tsx` |
| Champion | `src/pages/TournamentChampionPage.tsx` |
| History | `src/pages/TournamentHistoryDetailPage.tsx`, `src/components/tournament/DuelRoundTitlesRecap.tsx` |
| Tests | `src/utils/tournament.test.ts`, `src/utils/placementTitles.test.ts` |

## Ranking rules (placement)

- `championId` → rank 1
- Each completed duel loser: rank from that round’s pool size
- `poolSize = duels × 2 + (bye ? 1 : 0)` → `eliminationRank = poolSize - duels.length + 1`
- Tied losers in the same round share the same rank

## Manual smoke (before merge)

### Bajnokság

- [ ] Párharc: complete a kör → funny lines under both names
- [ ] Tie-break: titles on döntő kör; repeat if still tied
- [ ] Champion: all **Helyezési címek** visible
- [ ] **Befejezés** → JSON backup includes `tournament.titles`
- [ ] `/history/tournament/:id` → placement + per-duel **Körönkénti címek**

### Meccs regression

- [ ] `/match/play` — round titles still work
- [ ] `/match/end` and `/history/match/:id` — unchanged

## Still out of scope

- Per-duel placement screen between párharc and hub
- Pin-total rankings across the tournament
- Editing `constants/roundTitles.ts` variant tables

## History

- 2026-05-27 — Bajnokság v1 Phases 0–6 (`main`).
- 2026-05-27 — Titles Phases 0–5 on `feature/bajnoksag-titles`; sign-off in this file.
