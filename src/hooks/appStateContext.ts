import { createContext } from 'react';
import type { AppState } from '../types';
import type { SaveResult } from '../storage/saveState';

export type AppStateUpdater = (state: AppState) => AppState;

export interface AppStateContextValue {
  state: AppState;
  update: (updater: AppStateUpdater) => SaveResult;
  replace: (next: AppState) => SaveResult;
  lastSaveError: SaveResult | null;
  lastSavedAt: number | null;
}

export const AppStateContext = createContext<AppStateContextValue | null>(null);
