interface RoundNavigatorProps {
  currentRound: number;
  roundCount: number;
  onPrev: () => void;
  onNext: () => void;
}

export function RoundNavigator({
  currentRound,
  roundCount,
  onPrev,
  onNext,
}: RoundNavigatorProps) {
  return (
    <div className="round-navigator">
      <button
        type="button"
        className="btn btn--secondary round-navigator__btn"
        onClick={onPrev}
        disabled={currentRound <= 1}
        aria-label="Előző kör"
      >
        ←
      </button>
      <p className="round-navigator__label" aria-live="polite">
        <span className="round-navigator__current">{currentRound}.</span> kör /{' '}
        {roundCount}
      </p>
      <button
        type="button"
        className="btn btn--secondary round-navigator__btn"
        onClick={onNext}
        disabled={currentRound >= roundCount}
        aria-label="Következő kör"
      >
        →
      </button>
    </div>
  );
}
