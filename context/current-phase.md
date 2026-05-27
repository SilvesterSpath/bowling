# Current Phase

## Phase

**Bajnokság Phase 6 — QA and backup** (completed)

**Bajnokság v1 is complete** (Phases 0–6). Meccs MVP (Phases 0–8) remains the base app.

## Status

Completed — 2026-05-27

## Goals (Phase 6)

- [x] Unit tests: migration v1→v2, `getHistoryEntries`, 4/5-player brackets
- [x] `npm run build` + `npm run test` (17/17) + `npm run lint` (clean)
- [x] Meccs regression review (no play/end/history logic regressions)
- [x] Backup/migration verified via tests + `DataBackupPanel` path
- [x] Tie-break flow polish (append round before tiebreak navigate)
- [x] Lint fixes: `SaveIndicator`, `loadState`, `placementTitles`, tiebreak page
- [x] QA report: [bajnoksag-phase6-qa.md](../bajnoksag-phase6-qa.md)

## Automated verification

| Check | Result |
|-------|--------|
| `npm run build` | Pass |
| `npm run test` | 17/17 pass |
| `npm run lint` | Pass |

### New / extended tests

| File | Coverage |
|------|----------|
| `src/storage/migrate.test.ts` | v1→v2, v2 pass-through, invalid payload |
| `src/utils/history.test.ts` | merged history sort, labels, active excluded |
| `src/utils/tournament.test.ts` | +4/5 player bracket pairing; existing bye/champion/tie-break |

## Code changes (Phase 6)

| Area | Change |
|------|--------|
| `SaveIndicator` | CSS fade via `key={lastSavedAt}` (no effect setState) |
| `TournamentDuelPage` | Append first döntő kör before navigating to tiebreak |
| `TournamentTiebreakPage` | Removed mount `useEffect`; redirect if no open tie-break round |
| `loadState` | `const` for normalized active session ids |
| `placementTitles` | `computePlacementTitles(match)` — unused `players` param removed |

## Manual smoke (recommended)

See checklist in [bajnoksag-phase6-qa.md](../bajnoksag-phase6-qa.md):

- Meccs full flow + history badge
- Bajnokság 3 / 4 / 5 players, bye, döntő kör repeat
- Backup export/import with `tournaments` in JSON
- Session exclusivity (one active meccs OR bajnokság)

## Bajnokság feature summary (Phases 0–6)

| Phase | Deliverable |
|-------|-------------|
| 0 | Meccs stability review |
| 1 | Schema v2, tournament utils, tests |
| 2 | Setup, home, hub |
| 3 | Duel + tie-break scoring |
| 4 | Champion screen + finalize |
| 5 | Unified Előzmények + ágrajz |
| 6 | QA, backup tests, lint, sign-off |

## References

- [bajnoksag-plan.md](../bajnoksag-plan.md)
- [bajnoksag-phase6-qa.md](../bajnoksag-phase6-qa.md)
- [bajnoksag-phase0-review.md](../bajnoksag-phase0-review.md)

## History

- 2026-05-27 — MVP Meccs Phases 0–8.
- 2026-05-27 — Bajnokság Phases 0–5.
- 2026-05-27 — Bajnokság Phase 6: QA, tests, lint, v1 sign-off.
