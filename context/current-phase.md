# Current Phase

## Phase

**Bajnokság Phase 4 — Champion celebration** (completed)

Phase 5 adds tournament history list and bracket detail.

## Status

Completed — 2026-05-27

## Goals (Phase 4)

- [x] `TournamentChampionPage` — large **Bajnokság győztese**, champion name, trophy
- [x] CSS confetti overlay (~2–3s animation)
- [x] Optional applause via HTML5 `Audio` (`/sounds/applause.mp3`, fails silently if missing)
- [x] **Befejezés** → `status: completed`, `completedAt`, prune, clear `activeTournamentId`, home
- [x] Hub redirects to `/tournament/champion` when `championId` set
- [x] **Következő szakasz** with champion → champion page
- [x] `finalizeActiveTournament` helper
- [x] `npm run build` + `npm run test` pass

## What was built

| File | Purpose |
|------|---------|
| `src/pages/TournamentChampionPage.tsx` | Celebration + finalize confirm |
| `src/components/tournament/TournamentTrophy.tsx` | Pure CSS cup + glow |
| `src/components/tournament/ChampionConfetti.tsx` | CSS-only confetti particles |
| `src/utils/tournament.ts` | `finalizeActiveTournament` |
| `src/pages/TournamentHubPage.tsx` | Auto-redirect to champion screen |
| `src/App.tsx` | Route `/tournament/champion` |
| `src/index.css` | Champion, trophy, confetti styles |
| `public/sounds/` | Folder for optional `applause.mp3` |

## Routes

| Route | Screen |
|-------|--------|
| `/tournament/champion` | `TournamentChampionPage` |

Redirects: no active tournament → `/`; no `championId` → `/tournament`.

## Champion flow

1. Last bracket round completes → **Következő szakasz** → `advanceBracket` sets `championId` → `/tournament/champion`
2. Hub with `championId` → auto-redirect to champion page
3. Confetti + optional applause on mount
4. **Befejezés** → confirm → tournament saved as `completed` in `tournaments[]`, `activeTournamentId` cleared → home

Completed tournaments remain in state for Phase 5 history (not yet shown in Előzmények UI).

## Finalize (`finalizeActiveTournament`)

- Sets `status: 'completed'`, `completedAt` (ISO)
- `pruneCompletedTournaments` (max 50, mirror matches)
- Clears `activeTournamentId`
- Does **not** modify `matches[]`

## Optional sound

Place `applause.mp3` in `public/sounds/applause.mp3` for applause on champion screen. If the file is missing or autoplay is blocked, the app continues without error.

## Verification

| Check | Result |
|-------|--------|
| `npm run build` | Pass |
| `npm run test` | 8/8 pass |
| Meccs finalize | Unchanged |

## Manual smoke test (recommended)

- [ ] 2-player bajnokság → win final duel → **Következő szakasz** → champion screen
- [ ] Trophy + confetti visible; name correct
- [ ] **Befejezés** → home; no **Folytatás** for bajnokság
- [ ] Reload: completed tournament still in localStorage (Phase 5 will list it)
- [ ] Meccs flow still works

## Not in Phase 4 (by design)

- Tournament cards in Előzmények — Phase 5
- Bracket history detail — Phase 5

## Next phase

**Phase 5 — History**

- Unified history list (Meccs + Bajnokság badges)
- `TournamentHistoryDetail` + bracket view
- Routes `/history/match/:id` and `/history/tournament/:id`

## References

- [bajnoksag-plan.md](../bajnoksag-plan.md)

## History

- 2026-05-27 — MVP Meccs Phases 0–8.
- 2026-05-27 — Bajnokság Phases 0–3.
- 2026-05-27 — Bajnokság Phase 4: champion screen, finalize, confetti, trophy.
