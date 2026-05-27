# Current Phase

## Phase

**Bajnokság Phase 2 — Setup, home, hub shell** (completed)

Phase 3 adds real duel scoring (`TournamentDuelPage` replaces placeholder).

## Status

Completed — 2026-05-27

## Goals (Phase 2)

- [x] `TournamentNewPage` + `TournamentSetupForm` (players, shuffle, duel rounds default **3**)
- [x] `TournamentHubPage` + `TournamentProgressPanel` (wired to `getTournamentProgress`)
- [x] Home: **Új bajnokság**, **Folytatás** for active tournament, mutual-exclusion with Meccs
- [x] `MatchSetupForm` blocks when bajnokság active; tournament setup blocks when meccs active
- [x] `useActiveTournament` hook
- [x] `abandonActiveTournament` — no history row (tournament removed from state)
- [x] Routes: `/tournament/new`, `/tournament`, `/tournament/duel` (placeholder until Phase 3)
- [x] Hub: **Párharc indítása** / **Folytatás**, **Következő szakasz**, **Bajnokság elvetése**
- [x] `npm run build` + `npm run test` pass

## What was built

| File | Purpose |
|------|---------|
| `src/hooks/useActiveTournament.ts` | Active tournament from `activeTournamentId` |
| `src/components/tournament/TournamentSetupForm.tsx` | Player select, shuffle, duel round stepper, name |
| `src/components/tournament/TournamentProgressPanel.tsx` | Hub progress blocks (Hungarian labels) |
| `src/pages/TournamentNewPage.tsx` | Új bajnokság setup screen |
| `src/pages/TournamentHubPage.tsx` | Bajnokság központ, CTAs, abandon, advance round |
| `src/pages/HomePage.tsx` | Új bajnokság, tournament Folytatás, abandon |
| `src/components/match/MatchSetupForm.tsx` | Block if tournament active; clear `activeTournamentId` on new match |
| `src/App.tsx` | Tournament routes + duel placeholder |
| `src/utils/tournament.ts` | `abandonActiveTournament`, `activateDuel`, `updateActiveTournament`, … |
| `src/index.css` | `.tournament-progress`, `.tournament-hub__*` |

## Routes

| Route | Screen | Notes |
|-------|--------|-------|
| `/tournament/new` | `TournamentNewPage` | Setup; redirects if session blocked |
| `/tournament` | `TournamentHubPage` | Progress + CTAs; redirect `/` if no active tournament |
| `/tournament/duel` | Placeholder | Phase 3 replaces with score entry |

Meccs routes unchanged.

## Active session rules (enforced in UI)

| State | Home primary CTA | Blocked actions |
|-------|------------------|-----------------|
| Active meccs | Folytatás → `/match/play` | Új bajnokság (setup shows block) |
| Active bajnokság | Folytatás → `/tournament` | Új meccs (setup shows block) |
| None | — | Both **Új meccs** and **Új bajnokság** available |

Starting a tournament sets `activeTournamentId` and clears `activeMatchId`. Starting a match clears `activeTournamentId`.

## Hub behaviour

| UI block | Source |
|----------|--------|
| Aktuális szakasz | `getTournamentProgress().roundLabel` |
| Hátralévő játékosok | `remainingPlayerCount` |
| Hátralévő párharcok | `remainingDuelCount` |
| Továbbjutók | `advancedPlayerIds` (+ erőnyerő in list) |
| Aktuális párharc | `currentDuel` names |
| Erőnyerő | `byePlayerId` |

| CTA | When |
|-----|------|
| **Párharc indítása — A vs B** | Pending duel; activates duel → `/tournament/duel` |
| **Folytatás — A vs B** | Duel already `active` |
| **Következő szakasz** | All duels in round complete → `advanceBracket` |
| Győztes üzenet | `championId` set (celebration screen = Phase 4) |
| **Bajnokság elvetése** | Confirm; removes tournament (no Előzmények entry) |

## `utils/tournament.ts` additions (Phase 2)

| Export | Role |
|--------|------|
| `abandonActiveTournament` | Remove active tournament; clear `activeTournamentId` |
| `hasAnyTournamentScoresEntered` | Abandon confirm copy |
| `activateDuel` | Set `activeDuelId`, duel `status: active` |
| `updateActiveTournament` | Immutable update helper for pages |
| `getActiveTournament` | Lookup active tournament in state |

## Verification

| Check | Result |
|-------|--------|
| `npm run build` | Pass |
| `npm run test` | 8/8 pass |
| Meccs flow | Unchanged routes and play/end/history |
| Tournament setup | Creates tournament + navigates to hub |
| Placeholder duel | `/tournament/duel` — back to hub |

## Manual smoke test (recommended)

- [ ] Home → **Új bajnokság** → 3+ players, shuffle on, start → hub shows progress
- [ ] Home with active bajnokság → **Folytatás** only (no meccs Folytatás)
- [ ] **Új meccs** blocked while bajnokság active
- [ ] **Párharc indítása** → placeholder → back to hub
- [ ] **Bajnokság elvetése** → home, no history entry
- [ ] Start meccs after abandon bajnokság works

## Not in Phase 2 (by design)

- Real duel score entry (`TournamentDuelPage`) — Phase 3
- Tie-break page — Phase 3
- Champion celebration — Phase 4
- Tournament history — Phase 5

## Next phase

**Phase 3 — Duel + tie-break**

- `TournamentDuelPage` (N rounds, reuse `RoundScoreGrid`)
- `TournamentTiebreakPage` (1 round playoffs, auto-repeat if tied)
- Replace `/tournament/duel` placeholder
- Wire duel completion → hub / tie-break / advance

## References

- [bajnoksag-plan.md](../bajnoksag-plan.md)
- [bajnoksag-phase0-review.md](../bajnoksag-phase0-review.md)

## History

- 2026-05-27 — MVP Meccs Phases 0–8.
- 2026-05-27 — Bajnokság Phase 0: Meccs stability review.
- 2026-05-27 — Bajnokság Phase 1: schema v2, tournament utils, tests.
- 2026-05-27 — Bajnokság Phase 2: setup, home, hub shell, session guards.
