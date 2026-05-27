export const ROUND_TITLE_KEYS = [
  'perfect',
  'gutter',
  'all_equal',
  'lead_dominant',
  'lead_comfort',
  'lead_narrow',
  'lead_tied',
  'one_behind',
  'two_behind',
  'chasing',
  'far_behind',
  'mid_pack',
  'last_narrow',
  'last_clear',
  'last_tied',
  'last_solo',
] as const;

export type RoundTitleKey = (typeof ROUND_TITLE_KEYS)[number];

/** Whimsical nicknames (original style). */
export const ROUND_FUNNY_VARIANTS: Record<RoundTitleKey, readonly string[]> = {
  perfect: [
    'Tökéletes Lengő',
    'Strike Király',
    'Tízes Mester',
    'Max Pont Hős',
    'Tíz Pont Zseni',
    'Telitalálat',
  ],
  gutter: [
    'Nulla Hero',
    'Üres Pálya',
    'Gödör Király',
    'Nulla Varázs',
    'Nulla Ninja',
    'Pálya Szellem',
  ],
  all_equal: [
    'Döntetlen Duo',
    'Szinkron Lengő',
    'Páros Pálya',
    'Egyenlő Esély',
  ],
  lead_dominant: [
    'Kör Királya',
    'Vadkan a Pályán',
    'Lengő Legenda',
    'Pont Őr',
  ],
  lead_comfort: [
    'Lengő Bajnok',
    'Kör Főnök',
    'Pálya Vadász',
    'Hullámvezér',
  ],
  lead_narrow: [
    'Csipetnyi Király',
    'Majdnem Strike',
    'Élen Szökellő',
    'Szűk Trón',
  ],
  lead_tied: [
    'Két Király',
    'Megosztott Trón',
    'Azonos Korona',
    'Kétely Király',
  ],
  one_behind: [
    'Majdnem Király',
    'Egy Lépésnyire',
    'Szoros Üldöző',
    'Második Lengő',
  ],
  two_behind: [
    'Kör Harcos',
    'Hullám Lovas',
    'Üldöző Szellem',
    'Második Hullám',
  ],
  chasing: [
    'Felfutó Csillag',
    'Lovagol a Vezetőt',
    'Hajrá Hős',
    'Üldöző Lengő',
  ],
  far_behind: [
    'Pálya Turista',
    'Messzi Lengő',
    'Utolsó Esély',
    'Lengő Utazó',
  ],
  mid_pack: [
    'Lengő Lovag',
    'Bulizó Lengő',
    'Pálya Barát',
    'Körben Jó',
  ],
  last_narrow: [
    'Óvatos Lengő',
    'Lengő Tanuló',
    'Majdnem Gödör',
    'Alakvételző',
  ],
  last_clear: [
    'Lengő Legendás Utolsó',
    'Gödör Guru',
    'Utolsó Mohikán',
    'Pálya Alja',
  ],
  last_tied: [
    'Megosztott Utolsó',
    'Két Gödör',
    'Azonos Gödör',
    'Nulla Duó',
  ],
  last_solo: [
    'Magányos Lengő',
    'Utolsó Lovag',
    'Leghátul Hőse',
    'Sor Vége',
  ],
};

/** Score-gap description (what happened in the round). */
export const ROUND_GAP_VARIANTS: Record<RoundTitleKey, readonly string[]> = {
  perfect: [
    'Tízes — telitalálat',
    'Max pont, max díj',
    'Strike pillanat',
    'Tökéletes kör',
  ],
  gutter: [
    'Nulla — üres pálya',
    'Gödör a végén',
    'Nulla, nulla, nulla',
    'Pálya nélkül',
  ],
  all_equal: [
    'Mindenki egyforma',
    'Döntetlen kör',
    'Szinkron pont',
    'Egyenlő hullám',
  ],
  lead_dominant: [
    'Nagy előny az élen',
    'Simán vezet',
    'Messze a mezőny',
    'Domináns kör',
  ],
  lead_comfort: [
    'Két pont előny',
    'Stabil vezetés',
    'Élen, de nem véres',
    'Kényelmes első',
  ],
  lead_narrow: [
    'Egy pont az élen',
    'Szűk előny',
    'Csipetnyi vezetés',
    'Majdnem döntetlen',
  ],
  lead_tied: [
    'Megosztott első',
    'Döntetlen az élen',
    'Két király egy kör',
    'Azonos csúcs',
  ],
  one_behind: [
    'Egy pont a csúcstól',
    'Majdnem első',
    'Egy lépés lemaradva',
    'Szoros üldözés',
  ],
  two_behind: [
    'Két pont lemaradás',
    'Közel, de nem elég',
    'Második hullám',
    'Két pont a bajnoktól',
  ],
  chasing: [
    'Üldöző távolság',
    'Három pont hátra',
    'Még be lehet hozni',
    'Lovagol a vezetőt',
  ],
  far_behind: [
    'Messze a vezetőtől',
    'Nagy lemaradás',
    'Hátrányos kör',
    'Utolsó esély',
  ],
  mid_pack: [
    'Középmezőny',
    'Közepes kör',
    'Sem elöl, sem hátul',
    'Biztonságos zóna',
  ],
  last_narrow: [
    'Egy pont az utolsó',
    'Majdnem legrosszabb',
    'Szűk hátrány',
    'Alakvételi pont',
  ],
  last_clear: [
    'Egyértelmű utolsó',
    'Messze a többitől',
    'Mély gödör',
    'Utolsó helyen',
  ],
  last_tied: [
    'Megosztott utolsó',
    'Döntetlen a hátul',
    'Két utolsó egyszerre',
    'Azonos gödör',
  ],
  last_solo: [
    'Magányos utolsó',
    'Leghátul egyedül',
    'Utolsó, de nem nulla',
    'A sor végén',
  ],
};

function pickVariant(
  variants: readonly string[],
  roundIndex: number,
  playerOffset: number,
): string {
  const index = (roundIndex - 1 + playerOffset) % variants.length;
  return variants[index] ?? variants[0];
}

export function getRoundFunnyLabel(
  key: RoundTitleKey,
  roundIndex: number,
  playerOffset = 0,
): string {
  return pickVariant(ROUND_FUNNY_VARIANTS[key], roundIndex, playerOffset);
}

export function getRoundGapLabel(
  key: RoundTitleKey,
  roundIndex: number,
  playerOffset = 0,
): string {
  return pickVariant(ROUND_GAP_VARIANTS[key], roundIndex, playerOffset);
}
