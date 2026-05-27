# Current Phase

## Phase

**Bajnokság titles — Phase 4** (completed)

History parity: placement titles + per-duel round title recap on tournament detail.

## Status

Completed — 2026-05-27

**Branch:** `feature/bajnoksag-titles`

## Goals (Titles Phase 4)

- [x] `RoundTitlesRecapCore` — shared `{ rounds, playerIds, players }` with labeled entries
- [x] `RoundTitlesRecap` — Meccs wrapper (unchanged UX for match end + history)
- [x] `DuelRoundTitlesRecap` — main körök + döntő körök per párharc
- [x] `TournamentBracketView` — recap under each duel in ágrajz
- [x] `TournamentHistoryDetailPage` — **Helyezési címek** from `tournament.titles` (fallback: recompute)
- [x] `npm run build` + `npm run test` (25/25) + `npm run lint` (clean)

## What was built

| File | Change |
|------|--------|
| `src/components/match/RoundTitlesRecap.tsx` | `RoundTitlesRecapCore` + generalized match recap |
| `src/components/tournament/DuelRoundTitlesRecap.tsx` | **New** — duel + tie-break round titles |
| `src/components/tournament/TournamentBracketView.tsx` | `DuelRoundTitlesRecap` per párharc |
| `src/pages/TournamentHistoryDetailPage.tsx` | Placement section + bracket with recaps |
| `src/index.css` | `.bracket-duel__titles` spacing |

## History detail layout

1. Date
2. **Bajnokság győztese**
3. **Helyezési címek** (`tournament.titles`, or computed for older saves)
4. **Ágrajz** — scores, totals, döntő körök, győztes, **Körönkénti címek** per duel

## Automated verification

| Check | Result |
|-------|--------|
| `npm run build` | Pass |
| `npm run test` | 25/25 pass |
| `npm run lint` | Pass |

## Manual smoke (recommended)

- [ ] Complete bajnokság → history → **Helyezési címek** match champion screen
- [ ] Expand **Körönkénti címek** under a párharc in ágrajz
- [ ] Duel with tie-break → döntő kör labeled in recap
- [ ] Meccs history `/history/match/:id` — round recap still works

## Titles implementation phases

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 0 | Context + regression gate | Done |
| 1 | Live round titles (duel + tiebreak) | Done |
| 2 | Elimination rankings + placement compute | Done |
| 3 | Persist + champion UI | Done |
| 4 | History recap + placement in detail | **Done** |
| 5 | Docs + sign-off | Next |

## Next phase

**Titles Phase 5 — Sign-off**

- Update `bajnoksag-plan.md` (remove titles from out-of-scope)
- Final build/test/lint + manual smoke checklist

## References

- Cursor plan: `bajnokság_funny_titles_31e0fae8.plan.md`

## History

- 2026-05-27 — Titles Phases 0–3.
- 2026-05-27 — Titles Phase 4: history placement + per-duel round title recap.
