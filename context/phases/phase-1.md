Implement Phase 1 only.

Add the localStorage-based app state system.

Create:

- AppState TypeScript types
- Player, Match, Round, RoundScore types
- defaultState()
- loadState()
- saveState()
- useAppState() hook

Use one localStorage key:
lengoteke:v1:state

Requirements:

- auto-load state on app start
- persist every state update
- handle missing or broken localStorage data safely
- keep all UI text in Hungarian

Do not implement player UI yet.
Stop after Phase 1 is complete.
