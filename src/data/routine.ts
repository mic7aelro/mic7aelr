// Daily care routine: products on the shelf and the weekly morning and night order.
// Days use Date.getDay(): 0 = Sunday … 6 = Saturday.

export type Period = 'AM' | 'PM';

export type Product = {
  role: string;
  name: string;
  text: string;
  when: string;
  days?: string;
};

export type ProductGroup = { group: string; items: Product[] };

type ByDay<T> = T | ((day: number) => T);

export type RoutineStep = {
  phase: string;
  name: string;
  product: ByDay<string>;
  days?: number[];
  tag?: ByDay<string>;
  how?: keyof typeof HOW;
  slot?: boolean;
};

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const NIGHT_FOCUS = ['Recovery', 'Recovery', 'Brush', 'Salicylic', 'Brush', 'Retinal', 'Mud mask'];

export const NIGHT_FOCUS_TEXT = [
  'Recovery night. Hydrate only.',
  'Recovery night. Hydrate only.',
  'Brush night. Use the Spuds brush with the cleanser.',
  'Pore night with the Salicylic Acid 2%.',
  'Brush night. Use the Spuds brush with the cleanser.',
  'Retinal night. No product yet, so hydrate only until you buy one.',
  'Mask night with the Dead Sea Mud Mask.',
];

export const HISMILE_DAYS = [0, 3, 5];
const NATIVE_DAYS = [0, 1, 3, 5];
const BRUSH_NIGHTS = [2, 4];

export const PRODUCTS: ProductGroup[] = [
  { group: 'Oral care', items: [
    { role: 'Tool', name: 'Tongue scraper', text: 'Removes buildup from the tongue. Keeps breath fresh.', when: 'AM + PM', days: 'Step 1' },
    { role: 'Water flosser', name: 'quip Water Flosser', text: 'Cleans between teeth and along the gum line.', when: 'AM + PM', days: 'Before brushing' },
    { role: 'Toothbrush', name: 'Oral-B iO Series 2', text: 'Electric brush for daily cleaning. Brush for 2 minutes.', when: 'AM + PM' },
    { role: 'Toothpaste', name: 'Sensodyne Extra Whitening', text: 'Cleans, whitens, and reduces sensitivity. Spit after brushing. Do not rinse.', when: 'AM + PM' },
    { role: 'Colour corrector', name: 'HiSmile V34 Colour Corrector Serum', text: 'Brightens teeth by neutralizing yellow tones. Apply after brushing.', when: 'AM', days: 'Sun · Wed · Fri' },
  ] },
  { group: 'Hair and body', items: [
    { role: 'Shampoo', name: 'Native Coconut + Vanilla', text: 'Cleans hair and scalp. Alternates with Method Men.', when: 'AM shower', days: 'Sun · Mon · Wed · Fri' },
    { role: 'Shampoo', name: 'Method Men Glacier + Granite', text: 'Cleans hair and scalp. Alternates with Native.', when: 'AM shower', days: 'Tue · Thu · Sat' },
    { role: 'Body moisturizer', name: "Palmer's Cocoa Butter", text: 'Softens and moisturizes the body. Apply to damp skin after the night shower.', when: 'PM' },
    { role: 'Fragrance', name: 'Sol de Janeiro Body Mist 68', text: 'Fresh floral fragrance. Spray after skincare.', when: 'AM', days: 'Optional' },
  ] },
  { group: 'Face: cleanse', items: [
    { role: 'Cleanser', name: 'CeraVe Balancing Air Foam Cleanser', text: 'Removes dirt, oil, and buildup. Preps skin for the next steps.', when: 'AM + PM' },
    { role: 'Exfoliating tool', name: 'Spuds + Bristles Face Brush', text: 'Exfoliates dead skin and deep-cleans. Use with the cleanser. Keep away from the eye area.', when: 'PM', days: 'Tue · Thu' },
    { role: 'Mask', name: 'Dead Sea Mud Mask', text: 'Draws oil and buildup out of pores. Apply after the cleanser.', when: 'PM', days: 'Sat' },
  ] },
  { group: 'Face: treat', items: [
    { role: 'Toner · hydrating', name: 'The Ordinary Saccharomyces Ferment 30% Milky Toner', text: 'Adds light hydration and supports the skin barrier. Gentle enough to use every day.', when: 'AM + PM' },
    { role: 'Serum · BHA', name: 'The Ordinary Salicylic Acid 2%', text: 'Clears pores. Helps with breakouts and blackheads.', when: 'PM', days: 'Wed' },
    { role: 'Serum · antioxidant', name: 'e.l.f. SKIN Vitamin C + E + Ferulic Serum', text: 'Brightens skin and protects against free radicals during the day.', when: 'AM only' },
    { role: 'Serum · humectant', name: 'The Ordinary Hyaluronic Acid 2% + B5', text: 'Attracts and holds moisture. Leaves skin plump and smooth. Apply to slightly damp skin.', when: 'AM + PM' },
  ] },
  { group: 'Face: hydrate and protect', items: [
    { role: 'Eye cream', name: 'The INKEY List Caffeine Eye Cream', text: 'Reduces puffiness and dark circles. Tap on with the ring finger.', when: 'AM + PM' },
    { role: 'Moisturizer', name: 'innisfree Green Tea Seed Hyaluronic Cream', text: 'Locks in hydration and supports the skin barrier.', when: 'AM + PM' },
    { role: 'Sunscreen', name: 'Naked Sundays SPF 50+', text: 'Shields skin from UV damage and aging. Always the last skincare step.', when: 'AM', days: 'Every day' },
  ] },
  { group: 'Backups', items: [
    { role: 'Cleanser', name: 'Cetaphil Gentle Skin Cleanser', text: 'Use when the CeraVe runs out, or when skin feels irritated.', when: 'Backup' },
    { role: 'Toner · AHA exfoliant', name: 'The Ordinary Glycolic Acid 7% Exfoliating Toner', text: 'Removes dead surface skin and brightens. If you use it, use it on a recovery night only. Use SPF the next morning.', when: 'Backup' },
  ] },
];

export const HOW = {
  scrape: ['Scrape from the back of the tongue to the front, 5 to 6 times.', 'Rinse the scraper.'],
  floss: ['Aim the tip along the gum line.', 'Pause between each tooth.'],
  brush: ['Brush for 2 minutes.', 'Spit. Do not rinse, so the fluoride stays on the teeth.'],
  cleanse: ['Wet face (and the brush, on brush nights).', 'Move the cleanser in small, gentle circles. Avoid the eye area.', 'Rinse well. Pat skin dry. Do not rub.'],
  mask: ['Apply a thin, even layer to clean skin.', 'Leave it on until it dries, about 10 minutes.', 'Rinse with warm water. Pat dry.'],
  toner: ['Pour a few drops into your palms.', 'Pat into skin. Do not swipe hard.', 'Leave skin slightly damp for the next step.'],
  bha: ['Apply a few drops to dry skin, or to spots only.', 'Avoid the eye area.', 'Wait 1 minute before the next step.'],
  vitc: ['Apply 3 to 4 drops to the face.', 'Let it absorb for 1 minute.'],
  ha: ['Pat a little water on the face if skin is dry.', 'Apply 1 to 2 drops.', 'Press gently into skin.'],
  eye: ['Use a pea-sized amount for both eyes.', 'Tap on with the ring finger. Do not rub.'],
  moist: ['Apply a thin layer to the face and neck.', 'Use a little more after brush, acid, or mask nights.'],
  spf: ['Use two finger lengths for face and neck.', 'Reapply every 2 hours when you are outside.'],
} satisfies Record<string, string[]>;

export const ROUTINE: Record<Period, RoutineStep[]> = {
  AM: [
    { phase: 'Oral care', name: 'Tongue scrape', product: 'Tongue scraper', how: 'scrape' },
    { phase: 'Oral care', name: 'Water floss', product: 'quip Water Flosser', how: 'floss' },
    { phase: 'Oral care', name: 'Brush teeth', product: 'Oral-B iO Series 2 + Sensodyne Extra Whitening', how: 'brush' },
    { phase: 'Oral care', name: 'Colour corrector', product: 'HiSmile V34 Colour Corrector Serum', days: HISMILE_DAYS },
    { phase: 'Shower', name: 'Shampoo', product: (d) => (NATIVE_DAYS.includes(d) ? 'Native Coconut + Vanilla' : 'Method Men Glacier + Granite') },
    { phase: 'Face', name: 'Cleanser', product: 'CeraVe Balancing Air Foam Cleanser', how: 'cleanse' },
    { phase: 'Face', name: 'Toner', product: 'The Ordinary Saccharomyces Ferment 30% Milky Toner', how: 'toner' },
    { phase: 'Face', name: 'Vitamin C serum', product: 'e.l.f. SKIN Vitamin C + E + Ferulic Serum', how: 'vitc' },
    { phase: 'Face', name: 'Hyaluronic acid', product: 'The Ordinary Hyaluronic Acid 2% + B5', how: 'ha' },
    { phase: 'Face', name: 'Niacinamide', product: 'No product yet. Skip until you buy one.', slot: true },
    { phase: 'Face', name: 'Eye cream', product: 'The INKEY List Caffeine Eye Cream', how: 'eye' },
    { phase: 'Face', name: 'Moisturizer', product: 'innisfree Green Tea Seed Hyaluronic Cream', how: 'moist' },
    { phase: 'Face', name: 'SPF', product: 'Naked Sundays SPF 50+', how: 'spf' },
    { phase: 'Finish', name: 'Body mist', product: 'Sol de Janeiro Body Mist 68', tag: 'Optional' },
  ],
  PM: [
    { phase: 'Oral care', name: 'Tongue scrape', product: 'Tongue scraper', how: 'scrape' },
    { phase: 'Oral care', name: 'Water floss', product: 'quip Water Flosser', how: 'floss' },
    { phase: 'Oral care', name: 'Brush teeth', product: 'Oral-B iO Series 2 + Sensodyne Extra Whitening', how: 'brush' },
    { phase: 'Shower', name: 'Shower', product: 'Body only. Shampoo is in the morning.', slot: true },
    {
      phase: 'Face',
      name: 'Cleanser',
      product: (d) => (BRUSH_NIGHTS.includes(d) ? 'CeraVe Balancing Air Foam Cleanser + Spuds brush' : 'CeraVe Balancing Air Foam Cleanser'),
      tag: (d) => (BRUSH_NIGHTS.includes(d) ? 'Brush' : ''),
      how: 'cleanse',
    },
    { phase: 'Face', name: 'Mask', product: 'Dead Sea Mud Mask', days: [6], how: 'mask' },
    { phase: 'Face', name: 'Toner', product: 'The Ordinary Saccharomyces Ferment 30% Milky Toner', how: 'toner' },
    { phase: 'Face', name: 'BHA serum', product: 'The Ordinary Salicylic Acid 2%', days: [3], how: 'bha' },
    { phase: 'Face', name: 'Retinal', product: 'No product yet. Skip until you buy one.', days: [5], slot: true },
    { phase: 'Face', name: 'Hyaluronic acid', product: 'The Ordinary Hyaluronic Acid 2% + B5', how: 'ha' },
    { phase: 'Face', name: 'Eye cream', product: 'The INKEY List Caffeine Eye Cream', how: 'eye' },
    { phase: 'Face', name: 'Moisturizer', product: 'innisfree Green Tea Seed Hyaluronic Cream', how: 'moist' },
    { phase: 'Body', name: 'Body moisturizer', product: "Palmer's Cocoa Butter" },
  ],
};

export const WHY = [
  ['One active per night.', 'Salicylic acid and retinal each get a different night. Two actives on the same night can irritate skin.'],
  ['No acids on brush or mask nights.', 'The Spuds brush and the mud mask already exfoliate. Tuesday, Thursday, and Saturday stay acid-free.'],
  ['Sunday and Monday are for recovery.', 'Only hydrate on these nights. The skin barrier repairs before the next active night.'],
  ['Floss and scrape before you brush.', 'The toothpaste then stays on clean teeth. Spit after you brush. Do not rinse.'],
  ['Thinnest to thickest.', 'Serums go on before creams. SPF is always the last skincare step.'],
  ['Backups stay on the shelf.', 'Use Cetaphil when the CeraVe runs out. Use the Glycolic Toner on a recovery night only, never with salicylic acid or retinal.'],
];

export const byDay = <T,>(value: ByDay<T>, day: number): T =>
  typeof value === 'function' ? (value as (d: number) => T)(day) : value;

export const stepsFor = (period: Period, day: number) =>
  ROUTINE[period]
    .map((step, index) => ({ ...step, id: `${period}-${index}` }))
    .filter((step) => !step.days || step.days.includes(day));
