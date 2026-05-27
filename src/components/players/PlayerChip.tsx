interface PlayerChipProps {
  name: string;
}

export function PlayerChip({ name }: PlayerChipProps) {
  return <span className="player-chip">{name}</span>;
}
