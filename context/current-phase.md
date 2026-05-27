# Current Phase

## Phase

**Phase 2 — Játékosok** (completed)

Next: **Phase 3 — Score entry / match** ([phase-3.md](phases/phase-3.md))

## Status

Completed

## Goals

- [x] Add player with validation (empty, trim, max 24 chars)
- [x] Edit player name inline
- [x] Delete player with confirm dialog
- [x] Block delete when player is in active match
- [x] Persist all changes via `useAppState` → `lengoteke:v1:state`
- [x] Hungarian labels and error messages
- [x] Large mobile-friendly inputs and buttons
- [x] No match creation (deferred to Phase 3)

## What was built

| File | Purpose |
|------|---------|
| `src/utils/playerValidation.ts` | `validatePlayerName`, `normalizePlayerName` |
| `src/utils/players.ts` | `isPlayerInActiveMatch`, `sortPlayersByName` |
| `src/components/players/PlayerForm.tsx` | Új játékos + Hozzáadás |
| `src/components/players/PlayerList.tsx` | List, edit, delete + guards |
| `src/components/players/PlayerChip.tsx` | Name display |
| `src/components/common/ConfirmDialog.tsx` | Törlés megerősítés |
| `src/pages/PlayersPage.tsx` | Full Játékosok page |
| `src/index.css` | Form, list, dialog styles |

## Hungarian UI copy

| Action | Label / message |
|--------|-----------------|
| Add | Új játékos, Hozzáadás |
| Empty name | Add meg a játékos nevét. |
| Too long | Legfeljebb 24 karakter lehet. |
| Empty list | Még nincs játékos. Add hozzá az elsőt! |
| Edit | Szerkesztés, Mentés, Mégse |
| Delete confirm | Játékos törlése — Biztosan törlöd: {name}? |
| Active match block | {name} nem törölhető — aktív meccsben szerepel. |

## Browser verification

**Dev server:** `http://localhost:5174/players`

| Test | Result |
|------|--------|
| Empty submit | Alert: „Add meg a játékos nevét.” |
| Add Anna + Béla | Both appear in list (Hungarian sort) |
| Reload page | Players persist from localStorage |
| Delete Anna in active match | Dialog → confirm → alert blocks delete; Anna remains |
| Build | `npm run build` passes (50 modules) |

## Notes

- Players sorted with `localeCompare('hu')`.
- Új meccs page still placeholder (Phase 3).
- Dev server HMR on port 5174.

## History

- 2026-05-27 — Phase 0: Vite scaffold, router, storage layer.
- 2026-05-27 — Phase 1: State hardening, save error banner, browser tests.
- 2026-05-27 — Phase 2: Játékosok CRUD, delete guard, browser tests.
