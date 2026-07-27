import { comicDetails } from './comicDetails';
import { comicOrder } from './comicOrder';
import { comicSeries } from './comicSeries';

export type ComicStatus = 'owned' | 'wishlist';

export type Comic = {
  id: string;
  title: string;
  creators?: string;
  writers?: string;
  artists?: string;
  year?: string;
  category: string;
  description?: string;
  collects?: string;
  read: boolean;
  status: ComicStatus;
  universe?: 'dc' | 'marvel';
  cover?: string;
  /** A purchase page for this edition, for example an Amazon link. */
  link?: string;
  /** The run that holds this book, when the run reads in sequence. */
  series?: string;
  /** The position of this book inside the run, counting from 1. */
  order?: number;
  /** The place of this book in the suggested reading order of its publisher. */
  readingOrder?: number;
  /** The named run that this book belongs to in the reading order. */
  readingTrack?: string;
};

const comicCatalog: Comic[] = [
  { id: 'batman-adventures-omnibus', title: 'Batman Adventures Omnibus', year: '2021', category: 'Animated Tie-ins', description: 'The complete Batman Adventures series set in the world of Batman: The Animated Series.', read: false, status: 'owned' },
  { id: 'batman-adventures-continue-1', title: 'The Batman Adventures Continue: Season One', creators: 'Paul Dini, Alan Burnett & Ty Templeton', year: '2020', category: 'Animated Tie-ins', description: 'The animated universe continues with new villains and modern continuity links.', read: false, status: 'owned' },
  { id: 'batman-adventures-continue-2', title: 'The Batman Adventures Continue: Season Two', year: '2021', category: 'Animated Tie-ins', read: false, status: 'owned' },
  { id: 'batman-adventures-continue-3', title: 'The Batman Adventures Continue: Season Three', year: '2023', category: 'Animated Tie-ins', read: false, status: 'owned' },

  { id: 'batman-year-one', title: 'Batman: Year One', creators: 'Frank Miller & David Mazzucchelli', year: '1987', category: 'Batman Core', description: 'Batman’s first year and Gordon’s rise as an ally.', read: true, status: 'owned' },
  { id: 'man-who-laughs', title: 'Batman: The Man Who Laughs', creators: 'Ed Brubaker & Doug Mahnke', year: '2005', category: 'Batman Core', description: 'A modern retelling of Batman’s first battle with the Joker.', read: true, status: 'owned' },
  { id: 'haunted-knight', title: 'Batman: Haunted Knight', creators: 'Jeph Loeb & Tim Sale', year: '1993–1995', category: 'Batman Core', description: 'Three Halloween tales about fear, love, and obsession.', read: true, status: 'owned' },
  { id: 'long-halloween', title: 'Batman: The Long Halloween', creators: 'Jeph Loeb & Tim Sale', year: '1996–1997', category: 'Batman Core', description: 'A year-long serial-killer mystery set against Gotham’s mob war.', read: true, status: 'owned' },
  { id: 'dark-victory', title: 'Batman: Dark Victory', creators: 'Jeph Loeb & Tim Sale', year: '1999–2000', category: 'Batman Core', description: 'The Long Halloween continues and Dick Grayson becomes Robin.', read: true, status: 'owned' },
  { id: 'killing-joke', title: 'Batman: The Killing Joke', creators: 'Alan Moore & Brian Bolland', year: '1988', category: 'Batman Core', description: 'A psychological duel between Batman and the Joker.', read: true, status: 'owned' },
  { id: 'death-in-family', title: 'Batman: A Death in the Family', creators: 'Jim Starlin & Jim Aparo', year: '1988–1989', category: 'Batman Core', description: 'Jason Todd faces tragedy in one of Batman’s defining stories.', read: true, status: 'owned' },
  { id: 'lonely-place-dying', title: 'Batman: A Lonely Place of Dying', creators: 'Marv Wolfman & George Pérez', year: '1989', category: 'Batman Core', description: 'Tim Drake proves why Batman still needs a Robin.', read: true, status: 'owned' },
  { id: 'under-red-hood', title: 'Batman: Under the Red Hood', creators: 'Judd Winick & Doug Mahnke', year: '2005', category: 'Batman Core', description: 'Jason Todd returns and forces Bruce to face his failures.', read: true, status: 'owned' },
  { id: 'three-jokers', title: 'Batman: Three Jokers', creators: 'Geoff Johns & Jason Fabok', year: '2020', category: 'Batman Core', description: 'Batman, Batgirl, and Red Hood confront three forms of Joker madness.', read: false, status: 'owned' },
  { id: 'hush', title: 'Batman: Hush', creators: 'Jeph Loeb & Jim Lee', year: '2002–2003', category: 'Batman Core', description: 'Batman’s rogues become part of one large conspiracy.', read: true, status: 'owned' },
  { id: 'superman-batman', title: 'Superman/Batman', creators: 'Jeph Loeb, Ed McGuinness & Michael Turner', year: '2003–2006', category: 'Batman Core', read: false, status: 'owned' },
  { id: 'batman-ego', title: 'Batman: Ego', creators: 'Darwyn Cooke', year: '2000', category: 'Batman Core', description: 'Bruce confronts the monstrous idea at the center of his mission.', read: false, status: 'owned' },
  { id: 'up-in-sky', title: 'Superman: Up in the Sky', creators: 'Tom King & Andy Kubert', year: '2019–2020', category: 'Batman Core', read: false, status: 'owned' },
  { id: 'all-star-superman', title: 'All-Star Superman', creators: 'Grant Morrison & Frank Quitely', year: '2005–2008', category: 'Batman Core', description: 'A mythic Superman story about mortality and legacy.', read: false, status: 'owned' },
  { id: 'woman-tomorrow', title: 'Supergirl: Woman of Tomorrow', creators: 'Tom King & Bilquis Evely', year: '2021–2022', category: 'Batman Core', read: true, status: 'owned' },

  { id: 'tower-babel', title: 'JLA: Tower of Babel', creators: 'Mark Waid & Howard Porter', year: '2000', category: 'Events & Crossovers', read: false, status: 'owned' },
  { id: 'green-lantern-rebirth', title: 'Green Lantern: Rebirth', creators: 'Geoff Johns & Ethan Van Sciver', year: '2004–2005', category: 'Events & Crossovers', read: false, status: 'owned' },
  { id: 'blackest-night', title: 'Blackest Night', creators: 'Geoff Johns & Ivan Reis', year: '2009–2010', category: 'Events & Crossovers', description: 'The dead rise as Black Lanterns under the cosmic threat of Nekron.', read: false, status: 'wishlist' },
  { id: 'flashpoint', title: 'Flashpoint', creators: 'Geoff Johns & Andy Kubert', year: '2011', category: 'Events & Crossovers', read: false, status: 'wishlist' },
  { id: 'dark-nights-metal', title: 'Dark Nights: Metal', creators: 'Scott Snyder & Greg Capullo', year: '2017–2018', category: 'Events & Crossovers', read: false, status: 'owned' },
  { id: 'batman-who-laughs', title: 'The Batman Who Laughs', creators: 'Scott Snyder & Jock', year: '2018–2019', category: 'Events & Crossovers', read: false, status: 'owned' },
  { id: 'death-metal', title: 'Dark Nights: Death Metal', creators: 'Scott Snyder & Greg Capullo', year: '2020–2021', category: 'Events & Crossovers', read: false, status: 'owned' },

  { id: 'dark-knight-returns', title: 'The Dark Knight Returns', creators: 'Frank Miller & Klaus Janson', year: '1986', category: 'Elseworlds & Standalones', read: true, status: 'owned' },
  { id: 'red-son', title: 'Superman: Red Son', creators: 'Mark Millar, Dave Johnson & Kilian Plunkett', year: '2003', category: 'Elseworlds & Standalones', read: false, status: 'owned' },
  { id: 'kingdom-come', title: 'Kingdom Come', creators: 'Mark Waid & Alex Ross', year: '1996', category: 'Elseworlds & Standalones', read: false, status: 'owned' },
  { id: 'worlds-finest-1', title: 'Batman/Superman: World’s Finest Vol. 1 — The Devil Nezha', creators: 'Mark Waid & Dan Mora', category: 'Elseworlds & Standalones', read: false, status: 'owned' },
  { id: 'worlds-finest-2', title: 'Batman/Superman: World’s Finest Vol. 2 — Strange Visitor', creators: 'Mark Waid & Dan Mora', category: 'Elseworlds & Standalones', read: false, status: 'owned' },
  { id: 'worlds-finest-3', title: 'Batman/Superman: World’s Finest Vol. 3 — Elementary', creators: 'Mark Waid & Dan Mora', category: 'Elseworlds & Standalones', read: false, status: 'owned' },
  { id: 'worlds-finest-4', title: 'Batman/Superman: World’s Finest Vol. 4 — Return to Kingdom Come', creators: 'Mark Waid & Dan Mora', category: 'Elseworlds & Standalones', read: false, status: 'owned' },
  { id: 'worlds-finest-5', title: 'Batman/Superman: World’s Finest Vol. 5 — Secret Origins', creators: 'Mark Waid & Dan Mora', category: 'Elseworlds & Standalones', read: false, status: 'owned' },
  { id: 'worlds-finest-6', title: 'Batman/Superman: World’s Finest Vol. 6 — Impossible', creators: 'Mark Waid & Dan Mora', category: 'Elseworlds & Standalones', read: false, status: 'owned' },
  { id: 'worlds-finest-7', title: 'Batman/Superman: World’s Finest Vol. 7 — Total Eclipso', creators: 'Mark Waid & Dan Mora', category: 'Elseworlds & Standalones', read: false, status: 'owned' },
  { id: 'new-frontier', title: 'DC: The New Frontier', creators: 'Darwyn Cooke', year: '2004', category: 'Elseworlds & Standalones', read: false, status: 'owned' },
  { id: 'crisis-infinite-earths', title: 'Crisis on Infinite Earths', creators: 'Marv Wolfman & George Pérez', year: '1985–1986', category: 'Elseworlds & Standalones', read: false, status: 'wishlist' },
  { id: 'watchmen', title: 'Watchmen', creators: 'Alan Moore & Dave Gibbons', year: '1986–1987', category: 'Elseworlds & Standalones', read: false, status: 'owned' },
  { id: 'swamp-thing', title: 'Saga of the Swamp Thing', creators: 'Alan Moore & Stephen Bissette', year: '1984–1987', category: 'Elseworlds & Standalones', read: false, status: 'wishlist' },
  { id: 'authority-relentless', title: 'The Authority: Relentless', creators: 'Warren Ellis & Bryan Hitch', year: '1999–2000', category: 'Elseworlds & Standalones', read: false, status: 'wishlist' },
  { id: 'last-halloween', title: 'Batman: The Long Halloween — The Last Halloween', category: 'Elseworlds & Standalones', read: false, status: 'wishlist' },

  { id: 'absolute-batman-1', title: 'Absolute Batman Vol. 1: The Zoo', creators: 'Scott Snyder & Nick Dragotta', year: '2024', category: 'Absolute Universe', read: false, status: 'owned' },
  { id: 'absolute-batman-2', title: 'Absolute Batman Vol. 2: Abomination', creators: 'Scott Snyder & Nick Dragotta', category: 'Absolute Universe', read: false, status: 'wishlist' },
  { id: 'absolute-wonder-woman-1', title: 'Absolute Wonder Woman Vol. 1: The Last Amazon', creators: 'Kelly Thompson & Hayden Sherman', year: '2024', category: 'Absolute Universe', read: false, status: 'owned' },
  { id: 'absolute-wonder-woman-2', title: 'Absolute Wonder Woman Vol. 2: As My Mothers Made Me', creators: 'Kelly Thompson & Hayden Sherman', category: 'Absolute Universe', read: false, status: 'wishlist' },
  { id: 'absolute-superman-1', title: 'Absolute Superman Vol. 1: Last Dust of Krypton', creators: 'Jason Aaron & Rafa Sandoval', year: '2024', category: 'Absolute Universe', read: false, status: 'owned' },
  { id: 'absolute-superman-2', title: 'Absolute Superman Vol. 2: Son of the Demon', creators: 'Jason Aaron & Rafa Sandoval', category: 'Absolute Universe', read: false, status: 'wishlist' },
  { id: 'absolute-martian-manhunter-1', title: 'Absolute Martian Manhunter Vol. 1: Martian Vision', creators: 'Deniz Camp & Javier Rodríguez', category: 'Absolute Universe', read: false, status: 'wishlist' },
  { id: 'absolute-green-lantern-1', title: 'Absolute Green Lantern Vol. 1: Without Fear', creators: 'Al Ewing & Jahnoy Lindsay', category: 'Absolute Universe', read: false, status: 'wishlist' },
  { id: 'absolute-flash-1', title: 'Absolute Flash Vol. 1: Of Two Worlds', creators: 'Jeff Lemire & Nick Robles', category: 'Absolute Universe', read: false, status: 'wishlist' },

  { id: 'thanos-quest', title: 'Thanos Quest', creators: 'Jim Starlin & Ron Lim', year: '1990', category: 'Cosmic Marvel', description: 'Thanos outsmarts the cosmic Elders to collect the Infinity Gems.', read: false, status: 'owned', universe: 'marvel' },
  { id: 'infinity-gauntlet', title: 'Infinity Gauntlet', creators: 'Jim Starlin, George Pérez & Ron Lim', year: '1991', category: 'Cosmic Marvel', description: 'Thanos becomes omnipotent and wipes out half the universe.', read: false, status: 'owned', universe: 'marvel' },
  { id: 'infinity-war', title: 'Infinity War', creators: 'Jim Starlin, Ron Lim & Al Milgrom', year: '1992', category: 'Cosmic Marvel', read: false, status: 'owned', universe: 'marvel' },
  { id: 'infinity-crusade', title: 'Infinity Crusade', creators: 'Jim Starlin, Ron Lim & Al Milgrom', year: '1993', category: 'Cosmic Marvel', read: false, status: 'owned', universe: 'marvel' },
  { id: 'annihilation', title: 'Annihilation', creators: 'Keith Giffen, Dan Abnett & Andy Lanning', year: '2006', category: 'Cosmic Marvel', description: 'The Annihilation Wave forces Marvel’s cosmic heroes into a war for survival.', read: false, status: 'owned', universe: 'marvel' },
  { id: 'fantastic-four-unthinkable', title: 'Fantastic Four: Unthinkable', creators: 'Mark Waid & Mike Wieringo', year: '2003', category: 'Fantastic Four', description: 'Doctor Doom abandons science and embraces black magic.', read: false, status: 'wishlist', universe: 'marvel' },
  { id: 'silver-surfer-slott-omnibus', title: 'Silver Surfer by Slott & Allred Omnibus', creators: 'Dan Slott & Mike Allred', year: '2014–2017', category: 'Cosmic Marvel', read: false, status: 'owned', universe: 'marvel' },
  { id: 'infinity-entity', title: 'The Infinity Entity', creators: 'Jim Starlin & Alan Davis', year: '2016', category: 'Cosmic Marvel', read: false, status: 'owned', universe: 'marvel' },
  { id: 'fantastic-four-hickman-1', title: 'Fantastic Four by Jonathan Hickman: The Complete Collection Vol. 1', creators: 'Jonathan Hickman, Dale Eaglesham & Steve Epting', category: 'Hickman Saga', collects: 'Collects Dark Reign: Fantastic Four #1-5, Fantastic Four #570-578, and material from Dark Reign: The Cabal.', read: false, status: 'owned', universe: 'marvel' },
  { id: 'fantastic-four-hickman-2', title: 'Fantastic Four by Jonathan Hickman: The Complete Collection Vol. 2', creators: 'Jonathan Hickman, Dale Eaglesham & Steve Epting', category: 'Hickman Saga', collects: 'Collects Fantastic Four #579-588 and FF #1-5.', read: false, status: 'owned', universe: 'marvel' },
  { id: 'fantastic-four-hickman-3', title: 'Fantastic Four by Jonathan Hickman: The Complete Collection Vol. 3', creators: 'Jonathan Hickman, Dale Eaglesham & Steve Epting', category: 'Hickman Saga', collects: 'Collects FF #6-16 and Fantastic Four #600-604.', read: false, status: 'owned', universe: 'marvel' },
  { id: 'fantastic-four-hickman-4', title: 'Fantastic Four by Jonathan Hickman: The Complete Collection Vol. 4', creators: 'Jonathan Hickman, Dale Eaglesham & Steve Epting', category: 'Hickman Saga', collects: 'Collects Fantastic Four #605-611 and #605.1, plus FF #17-23.', read: false, status: 'owned', universe: 'marvel' },
  { id: 'avengers-hickman-1', title: 'Avengers by Jonathan Hickman: The Complete Collection Vol. 1', creators: 'Jonathan Hickman, Jerome Opeña & Leinil Francis Yu', category: 'Hickman Saga', read: false, status: 'owned', universe: 'marvel' },
  { id: 'avengers-hickman-2', title: 'Avengers by Jonathan Hickman: The Complete Collection Vol. 2', creators: 'Jonathan Hickman, Jerome Opeña & Leinil Francis Yu', category: 'Hickman Saga', read: false, status: 'owned', universe: 'marvel' },
  { id: 'avengers-hickman-3', title: 'Avengers by Jonathan Hickman: The Complete Collection Vol. 3', creators: 'Jonathan Hickman, Jerome Opeña & Leinil Francis Yu', category: 'Hickman Saga', read: false, status: 'owned', universe: 'marvel' },
  { id: 'avengers-hickman-4', title: 'Avengers by Jonathan Hickman: The Complete Collection Vol. 4', creators: 'Jonathan Hickman, Jerome Opeña & Leinil Francis Yu', category: 'Hickman Saga', read: false, status: 'owned', universe: 'marvel' },
  { id: 'avengers-hickman-5', title: 'Avengers by Jonathan Hickman: The Complete Collection Vol. 5', creators: 'Jonathan Hickman, Jerome Opeña & Leinil Francis Yu', category: 'Hickman Saga', read: false, status: 'owned', universe: 'marvel' },
  { id: 'secret-wars-2015', title: 'Secret Wars', creators: 'Jonathan Hickman & Esad Ribić', year: '2015', category: 'Hickman Saga', description: 'Doom reshapes the remains of the multiverse into Battleworld.', read: false, status: 'owned', universe: 'marvel' },
  { id: 'silver-surfer-black', title: 'Silver Surfer: Black', creators: 'Donny Cates & Tradd Moore', year: '2019', category: 'Cosmic Marvel', read: false, status: 'owned', universe: 'marvel' },
  { id: 'cosmic-ghost-rider', title: 'Cosmic Ghost Rider', creators: 'Donny Cates & Dylan Burnett', year: '2018', category: 'Cosmic Marvel', read: false, status: 'owned', universe: 'marvel' },
  { id: 'spider-man-blue', title: 'Spider-Man: Blue', creators: 'Jeph Loeb & Tim Sale', year: '2002', category: 'Read Whenever', read: false, status: 'owned', universe: 'marvel' },
  { id: 'miles-morales-ziglar-1', title: 'Miles Morales: Spider-Man Vol. 1 — Trial by Spider', creators: 'Cody Ziglar', category: 'Read Whenever', read: false, status: 'owned', universe: 'marvel' },
  { id: 'miles-morales-ziglar-2', title: 'Miles Morales: Spider-Man Vol. 2 — Bad Blood', creators: 'Cody Ziglar', category: 'Read Whenever', read: false, status: 'owned', universe: 'marvel' },
  { id: 'miles-morales-ziglar-3', title: 'Miles Morales: Spider-Man Vol. 3 — Gang War', creators: 'Cody Ziglar', category: 'Read Whenever', read: false, status: 'owned', universe: 'marvel' },
  { id: 'miles-morales-ziglar-4', title: 'Miles Morales: Spider-Man Vol. 4 — Retribution', creators: 'Cody Ziglar', category: 'Read Whenever', read: false, status: 'owned', universe: 'marvel' },
  { id: 'miles-morales-ziglar-5', title: 'Miles Morales: Spider-Man Vol. 5 — Blood Hunt', creators: 'Cody Ziglar', category: 'Read Whenever', read: false, status: 'owned', universe: 'marvel' },
  { id: 'miles-morales-ziglar-6', title: 'Miles Morales: Spider-Man Vol. 6 — Webs of Wakanda / Pools of Blood', creators: 'Cody Ziglar', category: 'Read Whenever', read: false, status: 'owned', universe: 'marvel' },
  { id: 'miles-morales-ziglar-7', title: 'Miles Morales: Spider-Man Vol. 7 — God War', creators: 'Cody Ziglar', category: 'Read Whenever', read: false, status: 'wishlist', universe: 'marvel' },
];

export const comics: Comic[] = comicCatalog.map((comic) => ({
  ...comic,
  ...comicDetails[comic.id],
  ...comicSeries[comic.id],
  ...(comicOrder[comic.id] ?? {}),
}));

export const comicCovers: Record<string, string> = {
  'batman-adventures-omnibus': 'https://images-na.ssl-images-amazon.com/images/P/1779521197.01.LZZZZZZZ.jpg',
  'batman-adventures-continue-2': 'https://images-na.ssl-images-amazon.com/images/P/1779514387.01.LZZZZZZZ.jpg',
  'man-who-laughs': 'https://images-na.ssl-images-amazon.com/images/P/1401216269.01.LZZZZZZZ.jpg',
  'long-halloween': 'https://images-na.ssl-images-amazon.com/images/P/1779515022.01.LZZZZZZZ.jpg',
  'dark-victory': 'https://images-na.ssl-images-amazon.com/images/P/1779514832.01.LZZZZZZZ.jpg',
  'under-red-hood': 'https://images-na.ssl-images-amazon.com/images/P/1401231454.01.LZZZZZZZ.jpg',
  hush: 'https://images-na.ssl-images-amazon.com/images/P/2365772137.01.LZZZZZZZ.jpg',
  'superman-batman': 'https://images-na.ssl-images-amazon.com/images/P/1401202500.01.LZZZZZZZ.jpg',
  'all-star-superman': 'https://images-na.ssl-images-amazon.com/images/P/1401209149.01.LZZZZZZZ.jpg',
  'tower-babel': 'https://images-na.ssl-images-amazon.com/images/P/1563895757.01.LZZZZZZZ.jpg',
  'green-lantern-rebirth': 'https://images-na.ssl-images-amazon.com/images/P/1401218709.01.LZZZZZZZ.jpg',
  'blackest-night': 'https://images-na.ssl-images-amazon.com/images/P/1401227856.01.LZZZZZZZ.jpg',
  flashpoint: 'https://images-na.ssl-images-amazon.com/images/P/1401233376.01.LZZZZZZZ.jpg',
  'dark-nights-metal': 'https://images-na.ssl-images-amazon.com/images/P/1401277373.01.LZZZZZZZ.jpg',
  'death-metal': 'https://images-na.ssl-images-amazon.com/images/P/1779507941.01.LZZZZZZZ.jpg',
  'dark-knight-returns': 'https://images-na.ssl-images-amazon.com/images/P/1401263119.01.LZZZZZZZ.jpg',
  'red-son': 'https://images-na.ssl-images-amazon.com/images/P/9750839536.01.LZZZZZZZ.jpg',
  'kingdom-come': 'https://images-na.ssl-images-amazon.com/images/P/1563893177.01.LZZZZZZZ.jpg',
  'new-frontier': 'https://images-na.ssl-images-amazon.com/images/P/1779526261.01.LZZZZZZZ.jpg',
  'crisis-infinite-earths': 'https://images-na.ssl-images-amazon.com/images/P/1596873434.01.LZZZZZZZ.jpg',
  watchmen: 'https://images-na.ssl-images-amazon.com/images/P/2809406413.01.LZZZZZZZ.jpg',
  'swamp-thing': 'https://images-na.ssl-images-amazon.com/images/P/0857685201.01.LZZZZZZZ.jpg',
  'authority-relentless': 'https://images-na.ssl-images-amazon.com/images/P/179950199X.01.LZZZZZZZ.jpg',
  'last-halloween': 'https://images-na.ssl-images-amazon.com/images/P/1799505979.01.LZZZZZZZ.jpg',
  'absolute-martian-manhunter-1': 'https://images-na.ssl-images-amazon.com/images/P/1799505219.01.LZZZZZZZ.jpg',
  'absolute-green-lantern-1': 'https://images-na.ssl-images-amazon.com/images/P/1799505553.01.LZZZZZZZ.jpg',
  'absolute-flash-1': 'https://images-na.ssl-images-amazon.com/images/P/1799505197.01.LZZZZZZZ.jpg',
  'fantastic-four-unthinkable': 'https://images-na.ssl-images-amazon.com/images/P/1302962949.01.LZZZZZZZ.jpg',
};
