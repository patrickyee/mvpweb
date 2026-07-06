import { RANK_LABELS, type Card } from '../game/types';

// Card face artwork: Vector-Playing-Cards by Byron Knoll / notpeter, released into the
// public domain (https://github.com/notpeter/Vector-Playing-Cards). Files are named
// `{RANK}{SUIT}.svg`, e.g. `10H.svg`, `AS.svg`.
const modules = import.meta.glob('../assets/cards/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const urlByFile: Record<string, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const file = path.split('/').pop();
  if (file) {
    urlByFile[file] = url;
  }
}

const SUIT_CODES: Record<Card['suit'], string> = {
  hearts: 'H',
  diamonds: 'D',
  clubs: 'C',
  spades: 'S',
};

export function cardImageUrl(card: Card): string {
  return urlByFile[`${RANK_LABELS[card.rank]}${SUIT_CODES[card.suit]}.svg`];
}
