export const TITLE_LABELS = {
  champion: 'Kupaőr — A Szilveszter Kupája',
  last_place: 'Lengő Legendás Utolsó',
  high_roller: 'Vadkan a Pályán',
  gutter_king: 'Nulla Hero',
  steady_eddie: 'Óra Pontosságú Lengő',
  roller_coaster: 'Hullámvasút Lovas',
  clutch_finisher: 'Hajrá Hős',
  slow_starter: 'Felfutó Csillag',
  party_animal: 'Bulizó Bajnok',
  default: 'Lengő Teke Lovag',
} as const;

export type TitleKey = keyof typeof TITLE_LABELS;
