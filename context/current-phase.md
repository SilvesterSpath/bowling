# Current Phase

## Phase

**Phase 7 — Buli polish** (completed)

Next: **Phase 8 — QA** ([phase-8.md](phases/phase-8.md))

## Status

Completed

## Goals

- [x] First-visit storage hint (dismissible, `lengoteke:v1:hint-dismissed`)
- [x] „Mentve” indicator after successful saves (2s toast)
- [x] Confirm before meccs elvetése and meccs befejezése
- [x] Abandon: delete match if no scores; else complete as „(megszakítva)”
- [x] JSON backup export + restore on Home
- [x] `focus-visible` and disabled button styles
- [x] Hungarian UI throughout

## What was built

| File | Purpose |
|------|---------|
| `src/components/common/StorageHintBanner.tsx` | Data loss warning |
| `src/components/common/SaveIndicator.tsx` | Brief „Mentve” toast |
| `src/components/common/DataBackupPanel.tsx` | Export / import JSON |
| `src/utils/match.ts` | `abandonActiveMatch` |
| `src/utils/scoring.ts` | `hasAnyScoresEntered`, `areAllRoundsComplete` |
| `src/hooks/useAppState.tsx` | `lastSavedAt` tracking |
| `src/pages/HomePage.tsx` | Hint, backup, meccs elvetése |
| `src/pages/MatchEndPage.tsx` | Finalize confirm dialog |
| `src/index.css` | Polish styles |

## Browser verification

**Dev server:** `http://localhost:5174/`

| Test | Result |
|------|--------|
| Home | Storage hint + Biztonsági mentés panel |
| Dismiss hint | „Értem” hides banner |
| Backup buttons | Mentés letöltése / visszaállítása present |
| Build | `npm run build` passes (63 modules) |

## Notes

- `phase-7.md` previously duplicated Phase 6 (history) — corrected to polish spec (history done in Phase 6).
- Score entry on Játék page still not implemented (gap vs original master plan).

## History

- 2026-05-27 — Phases 0–6: Full flow through Előzmények.
- 2026-05-27 — Phase 7: Party polish, backup, abandon, confirms.
