/**
 * Generates iconic legendary video game character handles based on a seed or UID.
 * Features legendary gaming icons like Gordon Freeman, Master Chief, Kratos, Mario, etc.
 */

const LEGENDARY_CHARACTERS = [
  'Gordon Freeman',
  'Master Chief',
  'Mario',
  'Link',
  'Kratos',
  'Solid Snake',
  'Geralt of Rivia',
  'Doom Slayer',
  'Jin Sakai',
  'Cloud Strife',
  'Jack Cooper',
  'Arthur Morgan',
  'Captain Price',
  'Nathan Drake',
  'Agent 47',
  'Ezio Auditore',
  'Commander Shepard',
  'Sephiroth',
  'Leon Kennedy',
  'Sans',
  'Crash Bandicoot',
  'Sub-Zero',
  'Scorpion',
  'Ryu',
  'Trevor Philips',
  'Duke Nukem',
  'Marcus Fenix',
  'Isaac Clarke',
  'B.J. Blazkowicz',
  'Corvo Attano',
  'Johnny Silverhand',
  'Donkey Kong',
  'Sonic the Hedgehog',
  'Mega Man',
  'Sly Cooper',
  'Ratchet',
  'Spyro',
  'Max Payne',
  'Rayman',
  'Pac-Man'
];

export function generateGamerTag(seed?: string | null): string {
  if (!seed || seed.trim() === '') {
    return 'Master Chief';
  }

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  const positiveHash = Math.abs(hash);
  const character = LEGENDARY_CHARACTERS[positiveHash % LEGENDARY_CHARACTERS.length];

  return character;
}
