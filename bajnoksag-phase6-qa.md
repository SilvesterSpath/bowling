# Bajnokság — Phase 6 QA report

**Date:** 2026-05-27  
**Scope:** Final QA, backup/migration tests, Meccs regression check, lint cleanup.

---

## Verdict

**Bajnokság v1 is ready for party use**, alongside the existing Meccs MVP.

| Area | Status |
|------|--------|
| Automated tests | **17/17 pass** |
| Production build | **Pass** |
| ESLint | **Pass** |
| Meccs code paths | **Unchanged** (routes, `HistoryDetail`, `MatchEndPage`, play flow) |
| Backup / migration | **Covered by unit tests** + existing `DataBackupPanel` export/import |

---

## Automated checks

| Command | Result |
|---------|--------|
| `npm run build` | Pass |
| `npm run test` | 17/17 pass |
| `npm run lint` | Clean |

### Test coverage added in Phase 6

| File | What it verifies |
|------|------------------|
| `src/storage/migrate.test.ts` | v1→v2 preserves meccs data; v2 tournaments; invalid → default |
| `src/utils/history.test.ts` | `getHistoryEntries` merge/sort; labels; active sessions excluded |
| `src/utils/tournament.test.ts` | 2/3/4/5/8-player bracket pairing; bye; champion path; tie-break resolution |

---

## Code polish (Phase 6)

| Change | Why |
|--------|-----|
| `SaveIndicator` — CSS flash via `key={lastSavedAt}` | Avoid `setState` in `useEffect` (react-hooks lint) |
| `TournamentDuelPage` — `appendTieBreakRound` before tiebreak navigate | First döntő kör exists when tiebreak page loads |
| `TournamentTiebreakPage` — no mount `useEffect` | Simpler flow; repeat tie-break via `appendTieBreakRound` on finish |
| `loadState` — `const` active ids | prefer-const lint |
| `computePlacementTitles(match)` — drop unused `players` arg | Unused parameter lint |

---

## Meccs regression review

Reviewed paths that must stay stable:

- `/` home, `/match/*` play → leaderboard → end → titles
- `activeMatchId` XOR `activeTournamentId` enforced on load
- Előzmények: meccs detail via `/history/match/:id`
- Backup JSON: schema v2 includes `tournaments[]` (export uses full `AppState`)

No intentional changes to Meccs scoring, round titles, or match finalization logic in Phase 6.

---

## Manual smoke checklist (party night)

Run in browser after `npm run dev`:

### Meccs

- [ ] Új meccs → play all rounds → leaderboard → end → titles saved
- [ ] Completed meccs in Előzmények with **Meccs** badge
- [ ] `/history/match/{id}` opens detail

### Bajnokság

- [ ] **3 játékos:** erőnyerő, bye reaches döntő
- [ ] **4 játékos:** elődöntő (2 párharc) → döntő → győztes
- [ ] **5 játékos:** erőnyerő + 2 párharc first round
- [ ] **Döntetlen:** main totals tie → döntő kör → winner advances (repeat if still tied)
- [ ] Champion screen → finalize → **Bajnokság** badge in history → ágrajz detail

### Backup

- [ ] Beállítások → export JSON (contains `schemaVersion: 2`, `tournaments`)
- [ ] Import same file on fresh tab → meccs + bajnokság history restored
- [ ] Old v1-only backup still migrates (players/matches kept, empty tournaments)

### Session exclusivity

- [ ] Active meccs blocks új bajnokság (and vice versa)
- [ ] Abandon meccs / bajnokság returns to home cleanly

---

## Known non-blockers

- `public/sounds/applause.mp3` optional — champion screen works without it
- Manual smoke not run in CI (local device recommended)

---

## Sign-off

Phases 0–6 complete per [bajnoksag-plan.md](./bajnoksag-plan.md). Track status in [context/current-phase.md](./context/current-phase.md).
