import { MAX_PLAYER_NAME_LENGTH } from '../constants/scoring';

export function normalizePlayerName(name: string): string {
  return name.trim();
}

export function validatePlayerName(name: string): string | null {
  const trimmed = normalizePlayerName(name);
  if (!trimmed) {
    return 'Add meg a játékos nevét.';
  }
  if (trimmed.length > MAX_PLAYER_NAME_LENGTH) {
    return `Legfeljebb ${MAX_PLAYER_NAME_LENGTH} karakter lehet.`;
  }
  return null;
}
