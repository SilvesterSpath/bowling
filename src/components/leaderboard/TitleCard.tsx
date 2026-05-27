import type { Player } from '../../types';
import type { PlayerTitle } from '../../types';
import { displayName } from '../../utils/format';

interface TitleCardProps {
  player: Player;
  title: PlayerTitle;
}

export function TitleCard({ player, title }: TitleCardProps) {
  return (
    <article className="title-card">
      <p className="title-card__name">{displayName(player)}</p>
      <p className="title-card__label">{title.label}</p>
    </article>
  );
}
