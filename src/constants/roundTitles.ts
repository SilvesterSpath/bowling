export const ROUND_TITLE_KEYS = [
  'perfect',
  'gutter',
  'round_hero',
  'round_struggler',
  'filler',
] as const;

export type RoundTitleKey = (typeof ROUND_TITLE_KEYS)[number];

/** Short Hungarian labels for inline display beside player names. */
export const ROUND_TITLE_VARIANTS: Record<RoundTitleKey, readonly string[]> = {
  perfect: [
    'Tökéletes Lengő',
    'Strike Király',
    'Tízes Mester',
    'Max Pont Hős',
  ],
  gutter: [
    'Nulla Hero',
    'Üres Pálya',
    'Gödör Király',
    'Nulla Varázs',
  ],
  round_hero: [
    'Kör Királya',
    'Pálya Vadász',
    'Lengő Bajnok',
    'Kör Főnök',
  ],
  round_struggler: [
    'Lengő Tanuló',
    'Óvatos Lengő',
    'Kör Harcos',
    'Pálya Turista',
  ],
  filler: [
    'Lengő Lovag',
    'Bulizó Lengő',
    'Pálya Barát',
    'Hullám Haver',
    'Esti Lengős',
    'Családi Lengő',
    'Szilveszter Lengő',
    'Körben Jó',
  ],
};

export function getRoundTitleLabel(
  key: RoundTitleKey,
  roundIndex: number,
  playerOffset = 0,
): string {
  const variants = ROUND_TITLE_VARIANTS[key];
  const index = (roundIndex - 1 + playerOffset) % variants.length;
  return variants[index] ?? variants[0];
}
