interface PlayerNameWithTitleProps {
  name: string;
  title?: string;
  subtitle?: string;
}

export function PlayerNameWithTitle({
  name,
  title,
  subtitle,
}: PlayerNameWithTitleProps) {
  return (
    <span className="player-line">
      <span className="player-line__name">{name}</span>
      {title ? (
        <span className="player-line__title">{title}</span>
      ) : null}
      {subtitle ? (
        <span className="player-line__subtitle">{subtitle}</span>
      ) : null}
    </span>
  );
}
