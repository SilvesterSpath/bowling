# Bajnokság — Phase 0 review (Meccs stability)

**Date:** 2026-05-27  
**Scope:** Validate normal Meccs flow before any Bajnokság implementation. No app code changes in this phase.  
**Plan reference:** [bajnoksag-plan.md](./bajnoksag-plan.md) — Phase 0

---

## Verdict

**Meccs is stable enough to begin Bajnokság Phase 1 (data layer), with conditions.**

| Area | Status |
|------|--------|
| Production build (`npm run build`) | Pass |
| ESLint (`npm run lint`) | 3 existing errors (non-blocking for runtime) |
| Meccs routes & guards | Sound |
| Score / ranking / titles logic | Coherent, isolated from tournament |
| Storage (v1) | Works; v2 migration needs careful design |
| Tournament code in repo | None (clean separation) |

**Recommendation:** Proceed to **Phase 1** after a short **manual smoke test** on a phone or dev server (checklist below). Fix lint noise optionally in parallel; do not block Phase 1 on it.

---

## Automated checks

### Build

```
npm run build  →  PASS (tsc -b && vite build, ~214ms bundle)
```

### Lint (pre-existing)

| File | Issue |
|------|--------|
| `src/components/common/SaveIndicator.tsx` | `setState` in `useEffect` (react-hooks/set-state-in-effect) |
| `src/hooks/useAppState.tsx` | Fast refresh export rule (react-refresh/only-export-components) |
| `src/utils/placementTitles.ts` | Unused `_players` (@typescript-eslint/no-unused-vars) |

None of these affect Meccs correctness; they are hygiene items.

---

## Meccs flow audit (code review)

### Routes ([src/App.tsx](src/App.tsx))

| Route | Page | Guard |
|-------|------|--------|
| `/` | Home | — |
| `/match/new` | New match | Blocks if `activeMatch` |
| `/match/play` | Play | Redirect `/` if no active match |
| `/match/leaderboard` | Leaderboard | Redirect `/` if no active match |
| `/match/end` | Match end | Redirect `/` if no active match |
| `/history`, `/history/:matchId` | History list / detail | Detail only for `completed` |

No tournament routes present. Wildcard redirects to `/`.

### Home & session ([src/pages/HomePage.tsx](src/pages/HomePage.tsx))

- Single **Folytatás** when `activeMatchId` points to an active match.
- **Új meccs**, **Játékosok**, **Előzmények** always available.
- **Meccs elvetése** with confirm; uses `abandonActiveMatch` (delete if no scores, else completed + “(megszakítva)”).
- **Biztonsági mentés** in `<details>` on home only.

Ready for Bajnokság: will need **Új bajnokság**, mutual exclusion with `activeMatchId`, and optional second **Folytatás** path — not implemented yet (expected).

### New match ([src/components/match/MatchSetupForm.tsx](src/components/match/MatchSetupForm.tsx))

- Guards: `activeMatch` → blocked UI + link to play.
- Min/max players and rounds enforced.
- Creates match + sets `activeMatchId`, navigates to `/match/play`.

Pattern to mirror for `TournamentSetupForm` + `activeTournamentId`.

### Play ([src/pages/PlayMatchPage.tsx](src/pages/PlayMatchPage.tsx))

- Scores 0–10 via `parseScoreInput` / `clampScoreValue`.
- Round navigator; **Következő kör** disabled until round complete.
- **Meccs vége** link only when `areAllRoundsComplete`.
- Round titles: `computeRoundTitles` only for **viewed** round when complete; two lines (funny + subtitle) via `RoundScoreGrid`.

**Minor edge case:** `roundIndex` is local state; if active match were swapped without unmount, index could desync. Not reachable today (one active match, redirect on missing).

### Leaderboard ([src/pages/LeaderboardPage.tsx](src/pages/LeaderboardPage.tsx))

- Totals via `getRankings`.
- Round titles from `getLatestCompleteRound` (not necessarily the round user last edited).
- **Meccs vége** always visible (no `areAllRoundsComplete` guard).

**Note:** User can open match end before all rounds filled. Finalize still saves current totals and placement titles. Acceptable for v1; optional later guard.

### Match end ([src/pages/MatchEndPage.tsx](src/pages/MatchEndPage.tsx))

- Placement titles via `computePlacementTitles`; persisted on finalize.
- `pruneCompletedMatches` + `activeMatchId: null`.
- `RoundTitlesRecap` for per-round history.

**Do not modify** for Bajnokság v1 (per plan).

### History ([src/pages/HistoryPage.tsx](src/pages/HistoryPage.tsx))

- List: completed matches only (`getCompletedMatches`).
- Detail: rankings, placement titles, round recap, round table.
- Legacy title detection in `HistoryDetail`.

Route `/history/:matchId` will need split to `/history/match/:id` when tournaments ship (Phase 5).

### Backup ([src/components/common/DataBackupPanel.tsx](src/components/common/DataBackupPanel.tsx))

- Export: raw `localStorage` JSON.
- Import: `migrateState` → `replace` → reload.

**v2 risk:** Today `migrateState` resets to empty state if `schemaVersion !== 1`. Phase 1 must implement real v1→v2 migration, not wipe user data.

### Storage layer

| Piece | Behavior |
|-------|----------|
| Key | `lengoteke:v1:state` |
| `loadState` | parse → migrate → normalize (clamp scores, validate active match) |
| `migrateState` | Only accepts `schemaVersion: 1`; else `defaultState()` |
| `AppState` | `players`, `matches`, `activeMatchId` only |

No `tournaments` or `activeTournamentId` yet.

### Reusable for Bajnokság (read-only integration planned)

- `RoundScoreGrid`, `RoundNavigator`, `AppShell`, `PageHeader`, `ConfirmDialog`
- `createEmptyRounds`, `isRoundComplete`, `getPlayerTotal`, `parseScoreInput`, `getRankings`
- `PlayerNameWithTitle` (optional in duels later)

### Fragile touchpoints for tournament work

1. **`src/types/index.ts` + `migrate.ts` + `loadState.ts`** — schema v2 and normalization.
2. **`HomePage`** — dual active session UX and exclusivity.
3. **`HistoryPage` / `HistoryList`** — unified list + route split.
4. **`STORAGE_KEY`** — still `v1` in name; plan may keep key or version bump document.

### Files safe to leave untouched (v1 plan)

- `src/utils/roundTitles.ts`, `src/utils/placementTitles.ts`
- `MatchEndPage` behavior
- Match play/leaderboard core flows (avoid drive-by refactors)

---

## Manual regression checklist

Run on dev (`npm run dev`) or production build. Mark when done.

- [ ] **Home:** no active match → Új meccs, no Folytatás
- [ ] **New match:** 2+ players, start → play page
- [ ] **New match blocked** while active match exists
- [ ] **Play:** enter 0–10 per player; incomplete round blocks next round
- [ ] **Play:** complete round → funny + subtitle lines appear
- [ ] **Play:** all rounds complete → Meccs vége link appears
- [ ] **Leaderboard:** totals order correct; round titles on latest complete round
- [ ] **Match end:** placement titles; finalize → home; match in Előzmények
- [ ] **History detail:** végeredmény, címek, kör recap, körök table
- [ ] **Abandon:** no scores → match removed; with scores → “(megszakítva)” in history
- [ ] **Players:** add/edit/delete; used in new match
- [ ] **Backup:** export JSON; restore overwrites and reloads
- [ ] **Offline:** airplane mode still scores and saves (localStorage)

---

## Gaps / risks before Bajnokság

| Risk | Severity | Mitigation in plan |
|------|----------|-------------------|
| `migrateState` wipes on unknown version | High | Phase 1: v1→v2 preserve players/matches |
| Simultaneous match + tournament active | High | Phase 2: exclusivity in setup + home |
| `STORAGE_KEY` still `v1` | Low | Document; optional rename later |
| Lint failures in CI if added | Low | Fix 3 lint items when convenient |
| Match end without all rounds | Low | Documented; optional guard later |

---

## Phase 0 sign-off

| Criterion | Met? |
|-----------|------|
| Plan document exists and reviewed | Yes — [bajnoksag-plan.md](./bajnoksag-plan.md) |
| Meccs code paths mapped | Yes — this document |
| Build passes | Yes |
| No tournament code mixed into Match | Yes |
| Manual checklist provided | Yes — run before Phase 2 UI if not before Phase 1 |

**Signed off for Phase 1 (data layer):** Yes, contingent on manual checklist (or spot-check of critical paths) before shipping user-facing tournament UI in Phase 2+.

---

## Next step

**Phase 1 — Data layer (no UI):** tournament types, `schemaVersion: 2`, migration, `utils/tournament.ts`, constants, pairing unit tests. Run `npm run build` after.

Do not edit `roundTitles.ts`, `placementTitles.ts`, or `MatchEndPage` unless a Meccs bug is found.
