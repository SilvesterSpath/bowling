import { useMemo } from 'react';

const COLORS = ['#d4af37', '#f5f5f0', '#e8c547', '#245c38', '#e85d5d'];

export function ChampionConfetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, index) => ({
        id: index,
        left: `${(index * 17) % 100}%`,
        delay: `${(index % 8) * 0.08}s`,
        duration: `${2 + (index % 3) * 0.4}s`,
        color: COLORS[index % COLORS.length],
        rotate: `${(index * 37) % 360}deg`,
      })),
    [],
  );

  return (
    <div className="champion-confetti" aria-hidden>
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="champion-confetti__piece"
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            backgroundColor: piece.color,
            ['--confetti-rotate' as string]: piece.rotate,
          }}
        />
      ))}
    </div>
  );
}
