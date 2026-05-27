import { clampScoreValue } from '../../utils/scoring';

interface ScoreStepperInputProps {
  id: string;
  value: number | null | undefined;
  onChange: (raw: string) => void;
  invalid?: boolean;
}

function stepScore(current: number | null, delta: number): number {
  const base = current ?? 0;
  return clampScoreValue(base + delta);
}

export function ScoreStepperInput({
  id,
  value,
  onChange,
  invalid = false,
}: ScoreStepperInputProps) {
  const numeric =
    value === null || value === undefined ? null : clampScoreValue(value);

  const applyDelta = (delta: number) => {
    onChange(String(stepScore(numeric, delta)));
  };

  return (
    <div className="score-stepper">
      <input
        id={id}
        className="input score-grid__input score-stepper__input"
        type="number"
        inputMode="numeric"
        min={0}
        max={10}
        placeholder="—"
        value={numeric === null ? '' : numeric}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid}
      />
      <div className="score-stepper__controls">
        <button
          type="button"
          className="score-stepper__btn score-stepper__btn--up"
          aria-label="Pont növelése"
          disabled={numeric !== null && numeric >= 10}
          onClick={() => applyDelta(1)}
        >
          <span className="score-stepper__icon" aria-hidden="true">
            ▲
          </span>
        </button>
        <button
          type="button"
          className="score-stepper__btn score-stepper__btn--down"
          aria-label="Pont csökkentése"
          disabled={numeric !== null && numeric <= 0}
          onClick={() => applyDelta(-1)}
        >
          <span className="score-stepper__icon" aria-hidden="true">
            ▼
          </span>
        </button>
      </div>
    </div>
  );
}
