import type { Player } from '../types';

export function formatMatchDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString('hu-HU', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function displayName(player: Player): string {
  return player.name.trim() || 'Névtelen';
}

export function defaultMatchName(): string {
  const date = new Date().toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return `Szilveszter Cup — ${date}`;
}
