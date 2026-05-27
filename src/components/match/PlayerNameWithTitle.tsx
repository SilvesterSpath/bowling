interface PlayerNameWithTitleProps {
  name: string;
  title?: string;
}

export function PlayerNameWithTitle({ name, title }: PlayerNameWithTitleProps) {
  return (
    <span className="player-line">
      <span className="player-line__name">{name}</span>
      {title ? (
        <span className="player-line__title">{title}</span>
      ) : null}
    </span>
  );
}
