/**
 * A suggested reading order, grouped into tracks.
 *
 * Each track is a run that reads in sequence. The tracks appear in the order
 * listed here. A book that reads well at any time belongs to no track and
 * appears under "Read whenever".
 *
 * Sources: the Batman order follows Comic Book Herald and Omniverse Comics
 * Guide. The Hickman order follows Comic Book Herald: Fantastic Four, then
 * Avengers and New Avengers, then Secret Wars.
 */
export type ReadingTrack = {
  name: string;
  note: string;
  ids: string[];
};

export const readingTracks: Record<'dc' | 'marvel', ReadingTrack[]> = {
  dc: [
    {
      name: 'Batman, in story order',
      note: 'The core Batman run, from the first year in Gotham to the return of Jason Todd.',
      ids: [
        'batman-year-one',
        'man-who-laughs',
        'haunted-knight',
        'long-halloween',
        'dark-victory',
        'killing-joke',
        'death-in-family',
        'lonely-place-dying',
        'hush',
        'under-red-hood',
        'three-jokers',
        'last-halloween',
      ],
    },
    {
      name: 'Events and crossovers',
      note: 'The line-wide stories, in the order the events happen.',
      ids: [
        'tower-babel',
        'green-lantern-rebirth',
        'blackest-night',
        'flashpoint',
        'dark-nights-metal',
        'batman-who-laughs',
        'death-metal',
      ],
    },
    {
      name: 'Batman/Superman: World’s Finest',
      note: 'One continuous run by Mark Waid and Dan Mora.',
      ids: [
        'worlds-finest-1', 'worlds-finest-2', 'worlds-finest-3', 'worlds-finest-4',
        'worlds-finest-5', 'worlds-finest-6', 'worlds-finest-7',
      ],
    },
    {
      name: 'The Absolute Universe',
      note: 'A separate line with its own continuity. Start with any title.',
      ids: [
        'absolute-batman-1', 'absolute-batman-2',
        'absolute-wonder-woman-1', 'absolute-wonder-woman-2',
        'absolute-superman-1', 'absolute-superman-2',
        'absolute-martian-manhunter-1', 'absolute-green-lantern-1', 'absolute-flash-1',
      ],
    },
    {
      name: 'The animated universe',
      note: 'The comics set in the world of Batman: The Animated Series.',
      ids: [
        'batman-adventures-omnibus',
        'batman-adventures-continue-1',
        'batman-adventures-continue-2',
        'batman-adventures-continue-3',
      ],
    },
  ],
  marvel: [
    {
      name: 'The Starlin Infinity saga',
      note: 'Jim Starlin’s cosmic run, from the gathering of the gems onward.',
      ids: ['thanos-quest', 'infinity-gauntlet', 'infinity-war', 'infinity-crusade', 'infinity-entity'],
    },
    {
      name: 'The modern event line',
      note: 'The events that reshape the Marvel Universe, in order.',
      ids: [
        'annihilation',
        'house-of-m-x-men-new-avengers',
        'civil-war-a-marvel-comics-event',
        'secret-invasion',
      ],
    },
    {
      name: 'The Hickman saga',
      note: 'Fantastic Four first, then Avengers, then Secret Wars, then the aftermath.',
      ids: [
        'fantastic-four-hickman-1', 'fantastic-four-hickman-2',
        'fantastic-four-hickman-3', 'fantastic-four-hickman-4',
        'avengers-hickman-1', 'avengers-hickman-2', 'avengers-hickman-3',
        'avengers-hickman-4', 'avengers-hickman-5',
        'secret-wars-2015',
        'one-world-under-doom',
      ],
    },
    {
      name: 'Miles Morales by Ziglar',
      note: 'One continuous run. Read the volumes in number order.',
      ids: [
        'miles-morales-ziglar-1', 'miles-morales-ziglar-2', 'miles-morales-ziglar-3',
        'miles-morales-ziglar-4', 'miles-morales-ziglar-5', 'miles-morales-ziglar-6',
        'miles-morales-ziglar-7',
      ],
    },
  ],
};

/** The track name and the position inside that track, for each comic. */
export const comicOrder: Record<string, { readingTrack: string; readingOrder: number }> = {};
for (const tracks of Object.values(readingTracks)) {
  tracks.forEach((track, trackIndex) => {
    track.ids.forEach((id, index) => {
      // The number keeps the tracks apart, so a sort places every track in order.
      comicOrder[id] = { readingTrack: track.name, readingOrder: (trackIndex + 1) * 100 + index + 1 };
    });
  });
}
