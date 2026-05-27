# Current Phase

## Phase

**Bajnokság Phase 1 — Data layer (no UI)** (completed)

Previous MVP (Meccs Phases 0–8) remains stable. Tournament UI starts in Phase 2.

## Status

Completed — 2026-05-27

## Goals (Phase 1)

- [x] Tournament types (`Tournament`, `TournamentDuel`, `TournamentBracketRound`)
- [x] `AppState` schema v2: `tournaments[]`, `activeTournamentId`
- [x] v1 → v2 migration (preserve players, matches, `activeMatchId`; no data wipe)
- [x] `loadState` normalization for tournaments, duels, tie-break rounds
- [x] Session exclusivity helper (`enforceSessionExclusivity`)
- [x] `utils/tournament.ts` — pairing, labels, progress, duel/tie-break resolution
- [x] `constants/tournament.ts` — default 3 duel rounds
- [x] Vitest pairing tests (2 / 3 / 8 players, tie-break)
- [x] `npm run build` + `npm run test` pass

## What was built

| File | Purpose |
|------|---------|
| `src/types/tournament.ts` | Tournament domain types |
| `src/types/index.ts` | `AppState` v2 + re-exports |
| `src/constants/tournament.ts` | `DEFAULT_TOURNAMENT_DUEL_ROUNDS = 3`, min/max, tie-break constant |
| `src/constants/storage.ts` | `SCHEMA_VERSION = 2`, `MAX_COMPLETED_TOURNAMENTS` |
| `src/storage/migrate.ts` | v1 → v2 migration; v2 passthrough |
| `src/storage/loadState.ts` | Normalize tournaments; enforce active session XOR |
| `src/storage/defaultState.ts` | Empty `tournaments`, `activeTournamentId: null` |
| `src/utils/tournament.ts` | Full tournament logic (see API below) |
| `src/utils/tournament.test.ts` | 8 unit tests |
| `package.json` | `vitest`, `"test": "vitest run"` |
| `vite.config.ts` | Vitest `include` for `*.test.ts` |

## Schema v2 (`AppState`)

```ts
{
  schemaVersion: 2,
  players: Player[],
  matches: Match[],           // unchanged
  tournaments: Tournament[],
  activeMatchId: MatchId | null,
  activeTournamentId: TournamentId | null,
}
```

**Storage key unchanged:** `lengoteke:v1:state` (JSON shape grows).

**Migration:** Existing v1 saves upgrade automatically on load — `tournaments: []`, `activeTournamentId: null`.

**Invariant:** `activeMatchId` and `activeTournamentId` cannot both be set (normalized on load; prefer clearing tournament if both present).

## `utils/tournament.ts` API

| Export | Role |
|--------|------|
| `createTournament` | Setup: name, players, optional shuffle, `roundsPerDuel` (default 3) |
| `buildFirstBracketRound` | First bracket: shuffle, pairs, erőnyerő on odd count |
| `buildBracketRoundFromPool` | Next-round pairing from winner pool |
| `advanceBracket` | When round complete → champion or next bracket round |
| `getRoundLabel` | Döntő / Elődöntő / Negyedfődöntő / `{n}. forduló` |
| `getTournamentProgress` | Hub fields: label, remaining players/duels, advanced, current duel, bye |
| `resolveDuelWinner` | Main totals, then latest tie-break round; no manual winner |
| `needsTieBreak` / `needsAnotherTieBreakRound` | Tie-break flow helpers |
| `createTieBreakRound` | Single playoff round for two players |
| `pruneCompletedTournaments` | Keep last 50 completed (mirror matches) |
| `canStartMatch` / `canStartTournament` | Mutual-exclusion guards for Phase 2 UI |
| `hasActiveMatch` / `hasActiveTournament` | Active session detection |
| `enforceSessionExclusivity` | Used by `loadState` normalization |

## Tests (`npm run test`)

| Test | Coverage |
|------|----------|
| 2 players | 1 duel, no bye |
| 3 players | 1 duel + erőnyerő |
| 8 players | 4 duels, Negyedfődöntő label |
| 2-player advance | Champion after round 1 |
| 8-player advance | 4 → Elődöntő → Döntő → champion |
| 3-player bye path | Winner + bye → final pairing |
| Main totals | Higher total wins |
| Tie-break | Repeat playoffs until unequal |

## Verification

| Check | Result |
|-------|--------|
| `npm run build` | Pass |
| `npm run test` | 8/8 pass |
| Meccs routes / pages | Unchanged (no UI in Phase 1) |
| Tournament routes | Not added yet (Phase 2+) |

## Not in Phase 1 (by design)

- No tournament pages or routes
- No Home **Új bajnokság** button
- No `useActiveTournament` hook (Phase 2)
- No history merge for tournaments (Phase 5)

## Next phase

**Phase 2 — Setup, home, hub shell**

- `TournamentNewPage`, `TournamentHubPage`, `TournamentProgressPanel`
- Home: **Új bajnokság**, **Folytatás**, mutual-exclusion with Meccs
- Abandon tournament helper (no history row)
- Routes in `App.tsx`: `/tournament/new`, `/tournament`

## References

- Full spec: [bajnoksag-plan.md](../bajnoksag-plan.md)
- Phase 0 review: [bajnoksag-phase0-review.md](../bajnoksag-phase0-review.md)

## History

- 2026-05-27 — MVP Phases 0–8 (Meccs) completed.
- 2026-05-27 — Bajnokság Phase 0: Meccs stability review.
- 2026-05-27 — Bajnokság Phase 1: types, schema v2, migration, tournament utils, tests.
