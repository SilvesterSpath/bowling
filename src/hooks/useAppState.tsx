import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { loadState } from '../storage/loadState';
import { saveState, type SaveResult } from '../storage/saveState';
import type { AppState } from '../types';

type AppStateUpdater = (state: AppState) => AppState;

interface AppStateContextValue {
  state: AppState;
  update: (updater: AppStateUpdater) => SaveResult;
  replace: (next: AppState) => SaveResult;
  lastSaveError: SaveResult | null;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());
  const [lastSaveError, setLastSaveError] = useState<SaveResult | null>(null);

  const persist = useCallback((next: AppState) => {
    const result = saveState(next);
    setLastSaveError(result.ok ? null : result);
    if (result.ok) {
      setState(next);
    }
    return result;
  }, []);

  const update = useCallback((updater: AppStateUpdater): SaveResult => {
    let saveResult: SaveResult = { ok: true };
    setState((prev) => {
      const next = updater(prev);
      saveResult = saveState(next);
      if (saveResult.ok) {
        return next;
      }
      return prev;
    });
    setLastSaveError(saveResult.ok ? null : saveResult);
    return saveResult;
  }, []);

  const replace = useCallback(
    (next: AppState) => persist(next),
    [persist],
  );

  const value = useMemo(
    () => ({
      state,
      update,
      replace,
      lastSaveError,
    }),
    [state, update, replace, lastSaveError],
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}
