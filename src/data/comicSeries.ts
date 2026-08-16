export type ComicSeries = {
  /** The name of the run that holds this book. */
  series: string;
  /** The position of this book inside the run, counting from 1. */
  order: number;
};

/**
 * Reading order for the runs that read in sequence.
 * A book that stands alone does not appear here.
 */
export const comicSeries: Record<string, ComicSeries> = {
  // DC
  'haunted-knight': { series: 'Loeb and Sale Batman', order: 1 },
  'long-halloween': { series: 'Loeb and Sale Batman', order: 2 },
  'dark-victory': { series: 'Loeb and Sale Batman', order: 3 },
  'last-halloween': { series: 'Loeb and Sale Batman', order: 4 },

  'batman-adventures-continue-1': { series: 'The Batman Adventures Continue', order: 1 },
  'batman-adventures-continue-2': { series: 'The Batman Adventures Continue', order: 2 },
  'batman-adventures-continue-3': { series: 'The Batman Adventures Continue', order: 3 },

  'worlds-finest-1': { series: 'Batman/Superman: World’s Finest', order: 1 },
  'worlds-finest-2': { series: 'Batman/Superman: World’s Finest', order: 2 },
  'worlds-finest-3': { series: 'Batman/Superman: World’s Finest', order: 3 },
  'worlds-finest-4': { series: 'Batman/Superman: World’s Finest', order: 4 },
  'worlds-finest-5': { series: 'Batman/Superman: World’s Finest', order: 5 },
  'worlds-finest-6': { series: 'Batman/Superman: World’s Finest', order: 6 },
  'worlds-finest-7': { series: 'Batman/Superman: World’s Finest', order: 7 },

  'absolute-batman-1': { series: 'Absolute Batman', order: 1 },
  'absolute-batman-2': { series: 'Absolute Batman', order: 2 },
  'absolute-wonder-woman-1': { series: 'Absolute Wonder Woman', order: 1 },
  'absolute-wonder-woman-2': { series: 'Absolute Wonder Woman', order: 2 },
  'absolute-superman-1': { series: 'Absolute Superman', order: 1 },
  'absolute-superman-2': { series: 'Absolute Superman', order: 2 },
  'absolute-martian-manhunter-1': { series: 'Absolute Martian Manhunter', order: 1 },
  'absolute-green-lantern-1': { series: 'Absolute Green Lantern', order: 1 },
  'absolute-flash-1': { series: 'Absolute Flash', order: 1 },

  // Marvel
  'thanos-quest': { series: 'Starlin Infinity Saga', order: 1 },
  'infinity-gauntlet': { series: 'Starlin Infinity Saga', order: 2 },
  'infinity-war': { series: 'Starlin Infinity Saga', order: 3 },
  'infinity-crusade-1': { series: 'Starlin Infinity Saga', order: 4 },
  'infinity-crusade-2': { series: 'Starlin Infinity Saga', order: 5 },

  'fantastic-four-hickman-1': { series: 'Fantastic Four by Hickman', order: 1 },
  'fantastic-four-hickman-2': { series: 'Fantastic Four by Hickman', order: 2 },
  'fantastic-four-hickman-3': { series: 'Fantastic Four by Hickman', order: 3 },
  'fantastic-four-hickman-4': { series: 'Fantastic Four by Hickman', order: 4 },

  'avengers-hickman-1': { series: 'Avengers by Hickman', order: 1 },
  'avengers-hickman-2': { series: 'Avengers by Hickman', order: 2 },
  'avengers-hickman-3': { series: 'Avengers by Hickman', order: 3 },
  'avengers-hickman-4': { series: 'Avengers by Hickman', order: 4 },
  'avengers-hickman-5': { series: 'Avengers by Hickman', order: 5 },

  'miles-morales-ziglar-1': { series: 'Miles Morales by Ziglar', order: 1 },
  'miles-morales-ziglar-2': { series: 'Miles Morales by Ziglar', order: 2 },
  'miles-morales-ziglar-3': { series: 'Miles Morales by Ziglar', order: 3 },
  'miles-morales-ziglar-4': { series: 'Miles Morales by Ziglar', order: 4 },
  'miles-morales-ziglar-5': { series: 'Miles Morales by Ziglar', order: 5 },
  'miles-morales-ziglar-6': { series: 'Miles Morales by Ziglar', order: 6 },
  'miles-morales-ziglar-7': { series: 'Miles Morales by Ziglar', order: 7 },
};
