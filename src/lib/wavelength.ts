/**
 * Rules and content for the Wavelength game.
 *
 * A round has a scale and a hidden target on that scale. The player writes a clue. Jev rates the
 * clue on the scale. The player scores points for how close Jev lands to the target.
 */

export type Pack = 'any' | 'movies' | 'music' | 'food' | 'sports' | 'anime' | 'shonen' | 'star-wars' | 'marvel' | 'dc';

export interface Scale {
  id: string;
  /** Packs that include this scale. */
  packs: Pack[];
  left: string;
  right: string;
  /** The question that Jev answers. */
  instructions: string;
  /** Five ordered levels, from the left end to the right end. */
  levels: [string, string, string, string, string];
}

export const PACKS: { id: Pack; label: string }[] = [
  { id: 'any', label: 'Mixed' },
  { id: 'movies', label: 'Movies' },
  { id: 'music', label: 'Music' },
  { id: 'food', label: 'Food' },
  { id: 'sports', label: 'Sports' },
  { id: 'anime', label: 'Anime' },
  { id: 'shonen', label: 'Shonen' },
  { id: 'star-wars', label: 'Star Wars' },
  { id: 'marvel', label: 'Marvel' },
  { id: 'dc', label: 'DC' },
];

/** Scales that work for the superhero and space packs. */
const ALL: Pack[] = ['any', 'star-wars', 'marvel', 'dc'];

export const SCALES: Scale[] = [
  {
    id: 'sw-side',
    packs: ['any', 'star-wars'],
    left: 'Dark side',
    right: 'Light side',
    instructions: 'Where does this Star Wars character, place, item, or idea sit between the dark side and the light side?',
    levels: [
      'Pure dark side: cruel, and serves the Sith or the Empire',
      'Leans dark: a villain or a fallen hero',
      'Neutral or balanced: neither light nor dark',
      'Leans light: mostly good, with flaws',
      'Pure light side: selfless, and serves the Jedi or the Rebellion',
    ],
  },
  {
    id: 'sw-power',
    packs: ['star-wars'],
    left: 'Weakest',
    right: 'Most powerful',
    instructions: 'How powerful is this Star Wars character or thing, in the Force or in a fight?',
    levels: [
      'Helpless: no fighting skill and no Force',
      'Weak: a normal fighter or a minor Force user',
      'Strong: a trained warrior or a skilled Jedi or Sith',
      'Very strong: a master, or a huge weapon',
      'Overwhelming: among the most powerful beings or weapons in the galaxy',
    ],
  },
  {
    id: 'marvel-scale',
    packs: ['marvel'],
    left: 'Street level',
    right: 'Cosmic',
    instructions: 'How big is the scale of this Marvel character, place, or thing?',
    levels: [
      'Street level: local crime in one neighborhood',
      'City level: one city is at stake',
      'Global: the whole Earth is at stake',
      'Galactic: whole planets and empires are at stake',
      'Cosmic: the universe or reality is at stake',
    ],
  },
  {
    id: 'marvel-side',
    packs: ['marvel'],
    left: 'Villain',
    right: 'Hero',
    instructions: 'Is this Marvel character a villain or a hero?',
    levels: [
      'Pure villain: evil, with no redeeming side',
      'Mostly villain: dangerous, with a soft spot',
      'Anti-hero: morally grey, and switches sides',
      'Mostly hero: good, with a dark edge',
      'Pure hero: selfless and noble',
    ],
  },
  {
    id: 'dc-power',
    packs: ['dc'],
    left: 'Mortal',
    right: 'Godlike',
    instructions: 'How powerful is this DC character or thing?',
    levels: [
      'Ordinary human with no special skills',
      'Peak human: extreme training or gadgets',
      'Superhuman: real powers, with limits',
      'Powerhouse: can fight a city or an army alone',
      'Godlike: can bend planets, time, or reality',
    ],
  },
  {
    id: 'dc-side',
    packs: ['dc'],
    left: 'Villain',
    right: 'Hero',
    instructions: 'Is this DC character a villain or a hero?',
    levels: [
      'Pure villain: cruel, and wants chaos or power',
      'Mostly villain: dangerous, with a code',
      'Anti-hero: morally grey, and hard to trust',
      'Mostly hero: good, with a dark edge',
      'Pure hero: selfless, and a symbol of hope',
    ],
  },
  {
    id: 'tone',
    packs: ALL,
    left: 'Dark and grim',
    right: 'Bright and fun',
    instructions: 'What is the tone of this Star Wars, Marvel, or DC character, movie, or moment?',
    levels: [
      'Dark and grim: bleak, violent, and heavy',
      'Serious: tense, with little humor',
      'Balanced: drama with some jokes',
      'Light: adventurous, with a lot of humor',
      'Bright and fun: a joyful, goofy ride',
    ],
  },
  {
    id: 'iconic',
    packs: ALL,
    left: 'Deep cut',
    right: 'Everyone knows it',
    instructions: 'How well known is this Star Wars, Marvel, or DC character, place, or thing among the general public?',
    levels: [
      'Deep cut: only dedicated fans know it',
      'Niche: comic and movie fans know it',
      'Familiar: many casual fans know it',
      'Famous: most people know it',
      'Iconic: almost everyone on Earth knows it',
    ],
  },
  {
    id: 'silly',
    packs: ALL,
    left: 'Very serious',
    right: 'Very silly',
    instructions: 'How silly is this Star Wars, Marvel, or DC character, idea, or moment?',
    levels: [
      'Very serious: no one would laugh',
      'Mostly serious: a rare joke',
      'Mixed: serious and silly in equal parts',
      'Silly: played for laughs',
      'Very silly: pure comedy or absurd',
    ],
  },
  {
    id: 'movie-prestige',
    packs: ['movies', 'any'],
    left: 'Cheesy',
    right: 'Prestige',
    instructions: 'How prestigious is this movie, director, or actor? Cheesy means campy fun. Prestige means serious acclaimed art.',
    levels: [
      'Pure cheese: campy, B-movie fun',
      'Leans cheesy: silly, and a guilty pleasure',
      'Mainstream: a crowd-pleaser with broad appeal',
      'Respected: acclaimed by critics',
      'Prestige: an awards contender and serious art',
    ],
  },
  {
    id: 'movie-classic',
    packs: ['movies', 'any'],
    left: 'Forgettable',
    right: 'Classic',
    instructions: 'How much of a classic is this movie, actor, or character?',
    levels: [
      'Forgettable: most people never think of it',
      'Minor: a few people remember it',
      'Well liked: a solid favorite of its era',
      'Beloved: people still quote it',
      'All-time classic: a landmark of cinema',
    ],
  },
  {
    id: 'movie-stress',
    packs: ['movies', 'any'],
    left: 'Comfort watch',
    right: 'Stressful',
    instructions: 'How stressful is this movie, show, or scene to watch?',
    levels: [
      'Pure comfort: cozy and safe',
      'Relaxing: gentle, with light tension',
      'Tense in parts: some scary or sad moments',
      'Intense: gripping and hard to watch at times',
      'Nerve-wracking: brutal, scary, or heartbreaking',
    ],
  },
  {
    id: 'movie-audience',
    packs: ['movies', 'any'],
    left: 'Kids',
    right: 'Adults only',
    instructions: 'Who is this movie, show, or character made for?',
    levels: [
      'Toddlers and young kids',
      'Kids and families',
      'Everyone, including teens',
      'Teens and adults: violence or mature themes',
      'Adults only: graphic, disturbing, or explicit',
    ],
  },
  {
    id: 'movie-hype',
    packs: ['movies', 'any'],
    left: 'Overrated',
    right: 'Underrated',
    instructions: 'Is this movie, actor, or director overrated or underrated by the general public?',
    levels: [
      'Very overrated: praised far beyond its quality',
      'Slightly overrated: good, but oversold',
      'Fairly rated: gets the credit it deserves',
      'Slightly underrated: better than people say',
      'Very underrated: a hidden gem that people ignore',
    ],
  },
  {
    id: 'movie-rewatch',
    packs: ['movies', 'any'],
    left: 'Watch once',
    right: 'Rewatch forever',
    instructions: 'How often would people rewatch this movie or show?',
    levels: [
      'Once is enough',
      'A rare second viewing',
      'Now and then, on a lazy day',
      'Often: a favorite to put on again',
      'Forever: people rewatch it every year',
    ],
  },
  {
    id: 'music-energy',
    packs: ['music', 'any'],
    left: 'Chill',
    right: 'Hype',
    instructions: 'How much energy does this song, artist, or genre have?',
    levels: [
      'Very chill: sleepy and calm',
      'Mellow: relaxed and easy',
      'Steady: upbeat but not wild',
      'Energetic: gets people moving',
      'Full hype: a rush of energy for a party or a gym',
    ],
  },
  {
    id: 'music-mood',
    packs: ['music', 'any'],
    left: 'Sad',
    right: 'Happy',
    instructions: 'What is the mood of this song, artist, or album?',
    levels: [
      'Very sad: heartbreak and tears',
      'Melancholy: wistful and moody',
      'Mixed: bittersweet or neutral',
      'Cheerful: warm and upbeat',
      'Pure joy: bright and celebratory',
    ],
  },
  {
    id: 'music-cred',
    packs: ['music', 'any'],
    left: 'Guilty pleasure',
    right: 'Critics\' darling',
    instructions: 'How do critics and serious fans see this song, artist, or album?',
    levels: [
      'Guilty pleasure: fun, but mocked',
      'Pop fluff: popular, and often dismissed',
      'Respected: liked by both fans and critics',
      'Acclaimed: praised by critics',
      'Critics\' darling: hailed as a masterpiece',
    ],
  },
  {
    id: 'music-era',
    packs: ['music', 'any'],
    left: 'Old school',
    right: 'Brand new',
    instructions: 'How new is the sound of this song, artist, or genre?',
    levels: [
      'Old school: from before 1970',
      'Retro: from the 1970s or 1980s',
      'Throwback: from the 1990s or 2000s',
      'Recent: from the 2010s',
      'Brand new: from the last few years',
    ],
  },
  {
    id: 'music-fame',
    packs: ['music', 'any'],
    left: 'Unknown',
    right: 'Global superstar',
    instructions: 'How famous is this artist or song across the world?',
    levels: [
      'Unknown: almost no one has heard of it',
      'Local: known in a small scene',
      'Known: a fan base in one country',
      'Famous: a household name in many countries',
      'Global superstar: known on every continent',
    ],
  },
  {
    id: 'food-spice',
    packs: ['food', 'any'],
    left: 'Mild',
    right: 'Spicy',
    instructions: 'How spicy is this food or dish?',
    levels: [
      'Not spicy at all',
      'Barely there: a tiny warmth',
      'Medium: a clear kick',
      'Hot: makes people sweat',
      'Painful: extreme heat',
    ],
  },
  {
    id: 'food-health',
    packs: ['food', 'any'],
    left: 'Junk',
    right: 'Healthy',
    instructions: 'How healthy is this food or meal?',
    levels: [
      'Pure junk: sugar, grease, and little else',
      'Indulgent: tasty, and not good for you',
      'Mixed: fine in moderation',
      'Healthy: fresh and balanced',
      'Very healthy: a nutritious powerhouse',
    ],
  },
  {
    id: 'food-fancy',
    packs: ['food', 'any'],
    left: 'Cheap',
    right: 'Fancy',
    instructions: 'How fancy is this food, dish, or restaurant?',
    levels: [
      'Very cheap: fast food or a gas station snack',
      'Budget: an everyday casual meal',
      'Nice: a sit-down restaurant',
      'Upscale: a special occasion',
      'Luxury: fine dining with a very high price',
    ],
  },
  {
    id: 'food-time',
    packs: ['food', 'any'],
    left: 'Morning food',
    right: 'Late-night food',
    instructions: 'When do people eat this food most?',
    levels: [
      'Breakfast: early morning',
      'Brunch or a mid-morning snack',
      'Lunch or an afternoon snack',
      'Dinner: the evening meal',
      'Late night: after midnight, or after a party',
    ],
  },
  {
    id: 'food-taste',
    packs: ['food', 'any'],
    left: 'Acquired taste',
    right: 'Loved by everyone',
    instructions: 'How widely liked is this food?',
    levels: [
      'Very divisive: most people hate it',
      'Acquired taste: a few people love it',
      'Split: about half of people like it',
      'Popular: most people like it',
      'Universal: almost everyone loves it',
    ],
  },
  {
    id: 'sport-skill',
    packs: ['sports', 'any'],
    left: 'Bad',
    right: 'All-time great',
    instructions: 'How good is this athlete, coach, or team?',
    levels: [
      'Historically bad',
      'Below average',
      'Solid: a good starter',
      'Star: among the best of their era',
      'All-time great: among the best ever',
    ],
  },
  {
    id: 'sport-hype',
    packs: ['sports', 'any'],
    left: 'Overrated',
    right: 'Underrated',
    instructions: 'Is this athlete or team overrated or underrated by fans and media?',
    levels: [
      'Very overrated: praised far beyond their play',
      'Slightly overrated',
      'Fairly rated: gets the credit they deserve',
      'Slightly underrated',
      'Very underrated: a star that people ignore',
    ],
  },
  {
    id: 'sport-watch',
    packs: ['sports', 'any'],
    left: 'Boring',
    right: 'Must watch',
    instructions: 'How exciting is this athlete, team, sport, or event to watch?',
    levels: [
      'Very boring: people change the channel',
      'Slow: exciting only for real fans',
      'Decent: good if you like the sport',
      'Exciting: a fun watch for most fans',
      'Must watch: appointment viewing for everyone',
    ],
  },
  {
    id: 'sport-villain',
    packs: ['sports', 'any'],
    left: 'Fan favorite',
    right: 'Villain',
    instructions: 'How do neutral fans feel about this athlete or team?',
    levels: [
      'Fan favorite: loved by almost everyone',
      'Well liked: people root for them',
      'Neutral: no strong feeling',
      'Disliked: people enjoy seeing them lose',
      'Villain: people love to hate them',
    ],
  },
  {
    id: 'sport-fame',
    packs: ['sports', 'any'],
    left: 'Local',
    right: 'Global',
    instructions: 'How well known is this athlete, team, or sport around the world?',
    levels: [
      'Local: known only in one town or region',
      'National: known across one country',
      'Regional: known across a continent',
      'International: known on several continents',
      'Global: known almost everywhere on Earth',
    ],
  },
  {
    id: 'anime-mood',
    packs: ['anime', 'shonen', 'any'],
    left: 'Wholesome',
    right: 'Dark',
    instructions: 'How dark is this anime, character, or moment?',
    levels: [
      'Wholesome: warm, gentle, and safe',
      'Light: mostly happy, with small sad moments',
      'Mixed: fun, with real drama',
      'Dark: heavy, violent, or tragic',
      'Very dark: bleak, brutal, or disturbing',
    ],
  },
  {
    id: 'anime-pace',
    packs: ['anime', 'any'],
    left: 'Slow burn',
    right: 'Action packed',
    instructions: 'How fast-paced is this anime, arc, or scene?',
    levels: [
      'Very slow burn: quiet days and long talks',
      'Slow: builds over many episodes',
      'Balanced: a steady mix of story and action',
      'Fast: something big happens often',
      'Non-stop: fight after fight, or twist after twist',
    ],
  },
  {
    id: 'anime-entry',
    packs: ['anime', 'any'],
    left: 'Gateway anime',
    right: 'Deep cut',
    instructions: 'Who knows this anime, and how easy is it for a new fan to start with?',
    levels: [
      'Gateway: the first anime that most new fans watch',
      'Easy: a popular pick for beginners',
      'Well known: most fans have seen it',
      'Niche: for fans who have watched a lot',
      'Deep cut: only dedicated fans know it',
    ],
  },
  {
    id: 'anime-cred',
    packs: ['anime', 'any'],
    left: 'Guilty pleasure',
    right: 'Masterpiece',
    instructions: 'How do fans and critics rate this anime or manga?',
    levels: [
      'Guilty pleasure: fun, but widely mocked',
      'Popcorn: enjoyable, and not deep',
      'Solid: a good watch with a loyal fan base',
      'Acclaimed: praised by fans and critics',
      'Masterpiece: often named among the best ever',
    ],
  },
  {
    id: 'anime-fame',
    packs: ['anime', 'shonen', 'any'],
    left: 'Anime fans only',
    right: 'Known by everyone',
    instructions: 'How well known is this anime or character outside of anime fans?',
    levels: [
      'Only anime fans know it',
      'Known in nerdy circles',
      'Some non-fans have heard of it',
      'Most people have heard of it',
      'Everyone knows it, even people who never watched anime',
    ],
  },
  {
    id: 'anime-silly',
    packs: ['anime', 'any'],
    left: 'Very serious',
    right: 'Very silly',
    instructions: 'How silly is this anime, character, or moment?',
    levels: [
      'Very serious: no jokes at all',
      'Mostly serious: a rare joke',
      'Mixed: serious and silly in equal parts',
      'Silly: played for laughs',
      'Very silly: pure comedy or absurd',
    ],
  },
  {
    id: 'anime-tears',
    packs: ['anime', 'any'],
    left: 'Won\'t make you cry',
    right: 'Will destroy you',
    instructions: 'How emotional and sad is this anime, character, or moment?',
    levels: [
      'Never sad: light and fun',
      'A little touching',
      'Emotional: a few tears are likely',
      'Heartbreaking: many people cry',
      'Devastating: people still recover years later',
    ],
  },
  {
    id: 'anime-era',
    packs: ['anime', 'any'],
    left: 'Classic',
    right: 'Modern',
    instructions: 'When did this anime come out?',
    levels: [
      'Classic: from the 1980s or before',
      'Retro: from the 1990s',
      'Early 2000s: the DVD era',
      'Streaming era: from the 2010s',
      'Modern: from the last few years',
    ],
  },
  {
    id: 'shonen-power',
    packs: ['shonen'],
    left: 'Weakest',
    right: 'Strongest',
    instructions: 'How strong is this shonen character or technique in a fight?',
    levels: [
      'Helpless: cannot fight',
      'Weak: a normal fighter',
      'Strong: a skilled warrior',
      'Elite: can take on a whole team',
      'Overpowered: can end the world or the universe',
    ],
  },
  {
    id: 'shonen-side',
    packs: ['shonen'],
    left: 'Villain',
    right: 'Hero',
    instructions: 'Is this shonen character a villain or a hero?',
    levels: [
      'Pure villain: evil, with no redeeming side',
      'Mostly villain: dangerous, with a soft spot',
      'Rival or gray: fights for their own goal',
      'Mostly hero: good, with a dark edge',
      'Pure hero: selfless and never gives up',
    ],
  },
  {
    id: 'shonen-cool',
    packs: ['shonen'],
    left: 'Cringe',
    right: 'Peak cool',
    instructions: 'How cool is this shonen character, move, or scene?',
    levels: [
      'Cringe: people laugh at it',
      'Awkward: tries too hard',
      'Fine: neither cool nor cringe',
      'Cool: fans hype it',
      'Peak cool: an iconic moment that fans quote',
    ],
  },
  {
    id: 'shonen-tragic',
    packs: ['shonen'],
    left: 'Happy past',
    right: 'Tragic past',
    instructions: 'How tragic is the backstory of this shonen character?',
    levels: [
      'Happy: a normal, warm childhood',
      'Mild: a small loss',
      'Painful: a hard early life',
      'Tragic: lost family or home',
      'Devastating: lost everything, and it shaped the whole story',
    ],
  },
  {
    id: 'shonen-hype',
    packs: ['shonen'],
    left: 'Skippable',
    right: 'Peak fiction',
    instructions: 'How good is this shonen arc, fight, or episode?',
    levels: [
      'Skippable: many fans skip it',
      'Slow: only for die-hard fans',
      'Good: a solid arc',
      'Great: fans rewatch it',
      'Peak fiction: often named the best moment in the series',
    ],
  },
  {
    id: 'shonen-rating',
    packs: ['shonen'],
    left: 'Underrated',
    right: 'Overrated',
    instructions: 'Do fans rate this shonen character higher or lower than they deserve?',
    levels: [
      'Very underrated: a great character that people ignore',
      'Slightly underrated',
      'Fairly rated',
      'Slightly overrated',
      'Very overrated: loved far beyond what they deserve',
    ],
  },
];

export const scalesForPack = (pack: Pack) => SCALES.filter((scale) => scale.packs.includes(pack));

// ---------------------------------------------------------------------------------------------
// Clue rules
// ---------------------------------------------------------------------------------------------

const NUMBER_WORD = '(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|hundred)';
/** A rating such as "7/10", "seven out of ten", or "80%". */
const RATING = new RegExp(`(?:\\d+(?:\\.\\d+)?|${NUMBER_WORD})\\s*(?:/|out of|of ten|percent|%)`, 'i');
const ONLY_A_NUMBER = new RegExp(`^(?:\\d+(?:\\.\\d+)?|${NUMBER_WORD})$`, 'i');
export const MAX_CLUE_LENGTH = 60;

/**
 * Return an error message, or null when the clue is allowed. The rule blocks clues that name the
 * number. It allows titles with numbers, such as "One Piece" or "Toy Story 3".
 */
export function validateClue(clue: string): string | null {
  const text = clue.trim();
  if (text.length === 0) return 'Write a clue.';
  if (text.length > MAX_CLUE_LENGTH) return `Use at most ${MAX_CLUE_LENGTH} characters.`;
  const words = text.replace(/[^A-Za-z0-9.\s]/g, ' ').trim();
  const letters = text.replace(/[^A-Za-z]/g, '');
  if (RATING.test(text) || ONLY_A_NUMBER.test(words) || (/\d/.test(text) && letters.length < 3)) {
    return 'Do not give a number or a rating. A title with a number, such as Toy Story 3, is fine.';
  }
  return null;
}

// ---------------------------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------------------------

export interface Band {
  /** Largest distance that earns these points. */
  reach: number;
  points: number;
}

/** Distances are on a scale from 0 to 100. */
export const BANDS: Band[] = [
  { reach: 5, points: 4 },
  { reach: 11, points: 3 },
  { reach: 18, points: 2 },
  { reach: 28, points: 1 },
];

export function pointsFor(target: number, guess: number): number {
  const distance = Math.abs(target - guess);
  return BANDS.find((band) => distance <= band.reach)?.points ?? 0;
}

/** Turn a Jev score, from 0 to levels-1, into a position from 0 to 100. */
export const positionFromScore = (score: number, levels: number) => Math.max(0, Math.min(100, (score / (levels - 1)) * 100));

/** Pick a hidden target away from both ends, so that every band fits on the scale. */
export function randomTarget(random: () => number = Math.random): number {
  return Math.round(8 + random() * 84);
}
