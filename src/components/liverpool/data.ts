// ─── Liverpool FC 25/26 Catch-Up Hub — data ──────────────────────────────────
// Ported verbatim from the standalone hub. Stats & transfers current to June 2026.

export type Pos = 'GK' | 'DF' | 'MF' | 'FW';

// 3-letter nat codes → full country name (for <abbr> tooltips).
export const NAT: Record<string, string> = {
  BRA: 'Brazil',
  GEO: 'Georgia',
  ENG: 'England',
  HUN: 'Hungary',
  NED: 'Netherlands',
  FRA: 'France',
  NIR: 'Northern Ireland',
  ITA: 'Italy',
  SCO: 'Scotland',
  JPN: 'Japan',
  GER: 'Germany',
  ARG: 'Argentina',
  EGY: 'Egypt',
  SWE: 'Sweden',
  WAL: 'Wales',
  IRL: 'Republic of Ireland',
  ESP: 'Spain',
  POR: 'Portugal',
  URU: 'Uruguay',
  SEN: 'Senegal',
  COL: 'Colombia',
  BEL: 'Belgium',
  NOR: 'Norway',
  DEN: 'Denmark',
  FIN: 'Finland',
  POL: 'Poland',
  CZE: 'Czech Republic',
  CMR: 'Cameroon',
  ZIM: 'Zimbabwe',
  AUS: 'Australia',
  RSA: 'South Africa',
};

export type Player = {
  n: number;
  name: string;
  pos: Pos;
  posName: string;
  nat: string;
  from: string;
  fee: string;
  when: string;
  apps: number;
  note?: string;
};

export const squad: Player[] = [
  // GK
  { n: 1, name: 'Alisson Becker', pos: 'GK', posName: 'Goalkeeper', nat: 'BRA', from: 'Roma', fee: '£66.8m', when: '2018', apps: 332, note: '3rd captain' },
  { n: 25, name: 'Giorgi Mamardashvili', pos: 'GK', posName: 'Goalkeeper', nat: 'GEO', from: 'Valencia', fee: '£25m', when: 'Jul 2025', apps: 18 },
  { n: 28, name: 'Freddie Woodman', pos: 'GK', posName: 'Goalkeeper', nat: 'ENG', from: 'Preston North End', fee: 'Free', when: 'Jul 2025', apps: 3 },
  { n: 41, name: 'Ármin Pécsi', pos: 'GK', posName: 'Goalkeeper', nat: 'HUN', from: 'Puskás Akadémia', fee: '£1.5m', when: 'Jun 2025', apps: 0 },
  // DF
  { n: 2, name: 'Joe Gomez', pos: 'DF', posName: 'Centre-back / RB', nat: 'ENG', from: 'Charlton', fee: '£3.5m', when: '2015', apps: 271, note: '5th captain' },
  { n: 4, name: 'Virgil van Dijk', pos: 'DF', posName: 'Centre-back', nat: 'NED', from: 'Southampton', fee: '£75m', when: '2018', apps: 370, note: 'Captain' },
  { n: 5, name: 'Ibrahima Konaté', pos: 'DF', posName: 'Centre-back', nat: 'FRA', from: 'RB Leipzig', fee: '£36m', when: '2021', apps: 179, note: '→ Real Madrid ’26' },
  { n: 6, name: 'Milos Kerkez', pos: 'DF', posName: 'Left-back', nat: 'HUN', from: 'Bournemouth', fee: '£40m', when: 'Jun 2025', apps: 44 },
  { n: 12, name: 'Conor Bradley', pos: 'DF', posName: 'Right-back', nat: 'NIR', from: 'Academy', fee: '—', when: 'Academy', apps: 78 },
  { n: 15, name: 'Giovanni Leoni', pos: 'DF', posName: 'Centre-back', nat: 'ITA', from: 'Parma', fee: '£26m', when: 'Aug 2025', apps: 1 },
  { n: 26, name: 'Andy Robertson', pos: 'DF', posName: 'Left-back', nat: 'SCO', from: 'Hull City', fee: '£8m', when: '2017', apps: 376, note: 'Vice-captain' },
  { n: 30, name: 'Jeremie Frimpong', pos: 'DF', posName: 'Right wing-back', nat: 'NED', from: 'Bayer Leverkusen', fee: '£29.5m', when: 'Jun 2025', apps: 32 },
  // MF
  { n: 3, name: 'Wataru Endo', pos: 'MF', posName: 'Defensive mid', nat: 'JPN', from: 'VfB Stuttgart', fee: '£16m', when: '2023', apps: 87 },
  { n: 7, name: 'Florian Wirtz', pos: 'MF', posName: 'Attacking mid', nat: 'GER', from: 'Bayer Leverkusen', fee: '£100m', when: 'Jun 2025', apps: 47 },
  { n: 8, name: 'Dominik Szoboszlai', pos: 'MF', posName: 'Central / attacking mid', nat: 'HUN', from: 'RB Leipzig', fee: '£60m', when: '2023', apps: 143 },
  { n: 10, name: 'Alexis Mac Allister', pos: 'MF', posName: 'Central midfield', nat: 'ARG', from: 'Brighton', fee: '£35m', when: '2023', apps: 146 },
  { n: 17, name: 'Curtis Jones', pos: 'MF', posName: 'Central midfield', nat: 'ENG', from: 'Academy', fee: '—', when: 'Academy', apps: 224 },
  { n: 38, name: 'Ryan Gravenberch', pos: 'MF', posName: 'Defensive / deep mid', nat: 'NED', from: 'Bayern Munich', fee: '£34m', when: '2023', apps: 133 },
  { n: 42, name: 'Trey Nyoni', pos: 'MF', posName: 'Central midfield', nat: 'ENG', from: 'Academy', fee: '—', when: 'Academy', apps: 19 },
  // FW
  { n: 9, name: 'Alexander Isak', pos: 'FW', posName: 'Striker', nat: 'SWE', from: 'Newcastle United', fee: '£125m', when: 'Sep 2025', apps: 21, note: 'British record' },
  { n: 11, name: 'Mohamed Salah', pos: 'FW', posName: 'Right winger', nat: 'EGY', from: 'Roma', fee: '£36.9m', when: '2017', apps: 440, note: 'Left end of ’26 · 4th captain' },
  { n: 14, name: 'Federico Chiesa', pos: 'FW', posName: 'Winger / forward', nat: 'ITA', from: 'Juventus', fee: '£10m', when: '2024', apps: 47 },
  { n: 18, name: 'Cody Gakpo', pos: 'FW', posName: 'Left winger / forward', nat: 'NED', from: 'PSV Eindhoven', fee: '£37m', when: '2023', apps: 176 },
  { n: 22, name: 'Hugo Ekitike', pos: 'FW', posName: 'Striker', nat: 'FRA', from: 'Eintracht Frankfurt', fee: '£69m', when: 'Jul 2025', apps: 45, note: 'Top scorer ’26 (17)' },
  { n: 73, name: 'Rio Ngumoha', pos: 'FW', posName: 'Winger', nat: 'ENG', from: 'Academy', fee: '—', when: 'Academy', apps: 26, note: 'Youngest-ever scorer' },
];

export type CLFinal = { y: string; r: string; city: string; mgr: string };

export const clFinals: CLFinal[] = [
  { y: '1977', r: '3–1 v Borussia Mönchengladbach', city: 'Rome', mgr: 'Bob Paisley' },
  { y: '1978', r: '1–0 v Club Brugge', city: 'London', mgr: 'Bob Paisley' },
  { y: '1981', r: '1–0 v Real Madrid', city: 'Paris', mgr: 'Bob Paisley' },
  { y: '1984', r: '1–1 (4–2 pens) v Roma', city: 'Rome', mgr: 'Joe Fagan' },
  { y: '2005', r: '3–3 (3–2 pens) v AC Milan', city: 'Istanbul', mgr: 'Rafa Benítez' },
  { y: '2019', r: '2–0 v Tottenham Hotspur', city: 'Madrid', mgr: 'Jürgen Klopp' },
];

export type Legend = { n: string; d: string };

export const legends: Legend[] = [
  { n: 'Steven Gerrard', d: 'One-club captain, 710 games. Dragged the team to the Miracle of Istanbul in 2005.' },
  { n: 'Kenny Dalglish', d: "'King Kenny' — legendary No. 7, then title-winning manager. The club's greatest icon to many." },
  { n: 'Ian Rush', d: 'Record goalscorer with 346. The deadliest finisher of the dynasty years.' },
  { n: 'Mohamed Salah', d: '2nd all-time scorer (257). The 2017–26 talisman who fired the 2020 & 2025 titles.' },
  { n: 'Jamie Carragher', d: 'Local CB, 737 games of pure commitment. Now the voice of the club on TV.' },
  { n: 'Bill Shankly', d: 'The founding father. Built the modern club, the Boot Room and the all-red kit.' },
  { n: 'Bob Paisley', d: 'Most decorated British manager: 3 European Cups & 6 titles in 9 years.' },
  { n: 'Jürgen Klopp', d: 'Ended the title drought (2020) and won the 2019 Champions League. A modern legend.' },
  { n: 'Virgil van Dijk', d: 'The captain. Arguably the best defender of his generation since arriving in 2018.' },
];

export type TransferIn = { p: string; pos: string; from: string; fee: string; when: string };

export const in2526: TransferIn[] = [
  { p: 'Alexander Isak', pos: 'ST', from: 'Newcastle United', fee: '£125m', when: '1 Sep 2025' },
  { p: 'Florian Wirtz', pos: 'AM', from: 'Bayer Leverkusen', fee: '£100m', when: '20 Jun 2025' },
  { p: 'Hugo Ekitike', pos: 'ST', from: 'Eintracht Frankfurt', fee: '£69m', when: '23 Jul 2025' },
  { p: 'Milos Kerkez', pos: 'LB', from: 'Bournemouth', fee: '£40m', when: '26 Jun 2025' },
  { p: 'Jeremie Frimpong', pos: 'RWB', from: 'Bayer Leverkusen', fee: '£29.5m', when: '1 Jun 2025' },
  { p: 'Giovanni Leoni', pos: 'CB', from: 'Parma', fee: '£26m', when: '15 Aug 2025' },
  { p: 'Giorgi Mamardashvili', pos: 'GK', from: 'Valencia', fee: '£25m', when: '1 Jul 2025' },
  { p: 'Ármin Pécsi', pos: 'GK', from: 'Puskás Akadémia', fee: '£1.5m', when: '7 Jun 2025' },
  { p: 'Freddie Woodman', pos: 'GK', from: 'Preston North End', fee: 'Free', when: '1 Jul 2025' },
];

export type TransferOut = { p: string; pos: string; to: string; fee: string; when: string };

export const out2526: TransferOut[] = [
  { p: 'Luis Díaz', pos: 'LW', to: 'Bayern Munich', fee: '£60m', when: '30 Jul 2025' },
  { p: 'Darwin Núñez', pos: 'ST', to: 'Al-Hilal', fee: '£46.2m', when: '9 Aug 2025' },
  { p: 'Jarell Quansah', pos: 'CB', to: 'Bayer Leverkusen', fee: '£30m', when: '2 Jul 2025' },
  { p: 'Ben Doak', pos: 'RW', to: 'Bournemouth', fee: '£20m', when: '18 Aug 2025' },
  { p: 'Caoimhín Kelleher', pos: 'GK', to: 'Brentford', fee: '£12.5m', when: '3 Jun 2025' },
  { p: 'Tyler Morton', pos: 'CM', to: 'Lyon', fee: '£10m', when: '5 Aug 2025' },
  { p: 'Trent Alexander-Arnold', pos: 'RB', to: 'Real Madrid', fee: '£8.4m', when: '1 Jun 2025' },
  { p: 'Nat Phillips', pos: 'CB', to: 'West Brom', fee: '£3m', when: '23 Jun 2025' },
];

export type SummerMove = { p: string; pos: string; mv: string; fee: string; type: 'in' | 'out' | 'rumor' | 'miss'; when: string };

export const summer26: SummerMove[] = [
  { p: 'Víctor Munoz', pos: 'LW', mv: 'Osasuna', fee: '€40m', type: 'in', when: 'Confirmed signing' },
  { p: 'Mohamed Salah', pos: 'RW', mv: 'Departed (MLS linked)', fee: '—', type: 'out', when: 'Left end of season' },
  { p: 'Ibrahima Konaté', pos: 'CB', mv: 'Real Madrid', fee: 'Free', type: 'out', when: 'Closing on move' },
  { p: 'Andy Robertson', pos: 'LB', mv: 'Exit expected', fee: '—', type: 'out', when: 'Leaving in rebuild' },
  { p: 'Bradley Barcola', pos: 'W', mv: 'PSG', fee: '~€80m+', type: 'rumor', when: 'Shortlisted · Arsenal rivalling' },
  { p: 'Yan Diomande', pos: 'RW', mv: 'Signed for PSG (from RB Leipzig)', fee: '~€100m', type: 'miss', when: 'Liverpool missed out' },
  { p: 'Eduardo Camavinga', pos: 'CM', mv: 'Real Madrid', fee: 'TBD', type: 'rumor', when: 'Midfield target · contact made' },
  { p: 'Ayyoub Bouaddi', pos: 'CM', mv: 'Lille', fee: 'TBD', type: 'rumor', when: 'Young midfield option' },
];

export type Trophy = { n: string; t: string; sub: string };

export const trophies: Trophy[] = [
  { n: '20', t: 'League Titles', sub: 'Joint English record · last in 2024-25' },
  { n: '6', t: 'European Cups', sub: "English record · '77 '78 '81 '84 '05 '19" },
  { n: '8', t: 'FA Cups', sub: 'Last in 2022' },
  { n: '10', t: 'League Cups', sub: 'English record · last in 2024' },
  { n: '3', t: 'UEFA Cups', sub: "'73 '76 '01 · English record" },
  { n: '4', t: 'UEFA Super Cups', sub: 'English record' },
  { n: '1', t: 'Club World Cup', sub: '2019' },
  { n: '16', t: 'Community Shields', sub: 'Shared & outright' },
];

export type RecordCard = { big: string; title: string; body: string };

export const records: RecordCard[] = [
  { big: '857', title: 'Appearances', body: 'Ian Callaghan (1958–78) — the most by any Liverpool player.' },
  { big: '346', title: 'Goals', body: "Ian Rush — the club's all-time record goalscorer." },
  { big: '257', title: 'Goals', body: 'Mohamed Salah (2017–26) — 2nd all-time, in just 440 games.' },
  { big: '9', title: "Managers' titles", body: "Paisley, Fagan & Dalglish drove the '70s–'80s dynasty." },
];

// League title years — bold the 2020 & 2025 (Premier League era) titles.
export const titleYears: { year: string; gold?: boolean }[] = [
  ...['1901', '1906', '1922', '1923', '1947', '1964', '1966', '1973', '1976', '1977',
    '1979', '1980', '1982', '1983', '1984', '1986', '1988', '1990'].map((year) => ({ year })),
  { year: '2020', gold: true },
  { year: '2025', gold: true },
];

export type StatCell = { num: string; lbl: string; gold?: boolean };

export const verdictStats: StatCell[] = [
  { num: '5th', lbl: 'Premier League finish' },
  { num: '60', lbl: 'Points (25 behind Arsenal)', gold: true },
  { num: '0', lbl: 'Trophies won' },
  { num: 'QF', lbl: 'Champions League exit (PSG)' },
];

export type XISpot = { n: number; nm: string; ps: string; x: number; y: number; gk?: boolean };

export const xi: XISpot[] = [
  { n: 1, nm: 'Alisson', ps: 'GK', x: 50, y: 90, gk: true },
  { n: 12, nm: 'Bradley', ps: 'RB', x: 84, y: 70 },
  { n: 5, nm: 'Konaté', ps: 'CB', x: 62, y: 74 },
  { n: 4, nm: 'Van Dijk', ps: 'CB', x: 38, y: 74 },
  { n: 6, nm: 'Kerkez', ps: 'LB', x: 16, y: 70 },
  { n: 38, nm: 'Gravenberch', ps: 'DM', x: 38, y: 54 },
  { n: 10, nm: 'Mac Allister', ps: 'CM', x: 62, y: 54 },
  { n: 8, nm: 'Szoboszlai', ps: 'RW', x: 82, y: 34 },
  { n: 7, nm: 'Wirtz', ps: 'AM', x: 50, y: 36 },
  { n: 18, nm: 'Gakpo', ps: 'LW', x: 18, y: 34 },
  { n: 22, nm: 'Ekitike', ps: 'ST', x: 50, y: 16 },
];

// ─── Liverpool's Greatest — official 100 (2026 fan + panel vote) ──────────────
// Ranks 14–100 are the officially-revealed positions (source: liverpoolfc.com).
// Ranks 1–13 are NOT yet revealed (top-five/winner reveal in early July 2026):
// the eight names that appeared on every ballot are locked into this tier, and
// the order shown for 1–13 is an editorial prediction, flagged `predicted`.

export type Great = {
  rank: number;
  name: string;
  pos: Pos;
  posName: string;
  nat: string;
  era: string;
  note: string;
  predicted?: boolean; // true = top-13 placement is inferred, not yet revealed
};

export const greats: Great[] = [
  // ── Top 13 — inferred order, official reveal early July 2026 ──
  { rank: 1, name: 'Kenny Dalglish', pos: 'FW', posName: 'Forward', nat: 'SCO', era: '1977–1990', note: "'King Kenny' — the club's greatest icon. A genius link-up forward with a low centre of gravity and a feel for the killer pass; won three European Cups, then the 1986 Double as player-manager.", predicted: true },
  { rank: 2, name: 'Steven Gerrard', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '1998–2015', note: 'A one-club talisman across 710 games — a box-to-box driving force with a thunderous long-range shot, and the man who dragged the team to the 2005 Istanbul miracle.', predicted: true },
  { rank: 3, name: 'Ian Rush', pos: 'FW', posName: 'Striker', nat: 'WAL', era: '1980–1996', note: "The club's record goalscorer with 346. A ruthless, relentless-pressing striker whose telepathic link with Dalglish defined the 1980s dynasty.", predicted: true },
  { rank: 4, name: 'Mohamed Salah', pos: 'FW', posName: 'Right winger', nat: 'EGY', era: '2017–2026', note: "The 'Egyptian King' — 2nd all-time scorer with 257 in just 440 games. A cut-inside right winger and penalty machine who fired the 2020 and 2025 titles.", predicted: true },
  { rank: 5, name: 'Graeme Souness', pos: 'MF', posName: 'Midfielder', nat: 'SCO', era: '1978–1984', note: 'The midfield general — snarling aggression, a sumptuous range of passing and ferocious leadership. Captained the side through its early-1980s European dominance.', predicted: true },
  { rank: 6, name: 'John Barnes', pos: 'FW', posName: 'Winger', nat: 'ENG', era: '1987–1997', note: 'A mesmeric, gliding winger with electric feet. At his 1987–90 peak the best player in England — two titles plus the 1988 FWA and PFA awards.', predicted: true },
  { rank: 7, name: 'Billy Liddell', pos: 'FW', posName: 'Winger / forward', nat: 'SCO', era: '1938–1961', note: "'Liddellpool' — the side was half-named after him. A powerful, two-footed winger-forward and devoted one-club man across 22 years.", predicted: true },
  { rank: 8, name: 'Virgil van Dijk', pos: 'DF', posName: 'Centre-back', nat: 'NED', era: '2018–', note: 'The captain and defensive cornerstone since 2018 — dominant in the air, serene on the ball and quick across the ground. Arguably the best centre-back of his era.', predicted: true },
  { rank: 9, name: 'Alan Hansen', pos: 'DF', posName: 'Centre-back', nat: 'SCO', era: '1977–1991', note: 'An elegant, ball-playing centre-half who defended by reading the game rather than by force — the libero of the all-conquering sides, with eight league titles.', predicted: true },
  { rank: 10, name: 'Robbie Fowler', pos: 'FW', posName: 'Striker', nat: 'ENG', era: '1993–2007', note: "'God' to the Kop — the most natural finisher the academy has produced, lethal off either foot and famed for lightning-quick goals.", predicted: true },
  { rank: 11, name: 'Roger Hunt', pos: 'FW', posName: 'Striker', nat: 'ENG', era: '1959–1969', note: "'Sir Roger' — the club's record league goalscorer and a 1966 World Cup winner. A tireless runner and clinical finisher who powered the Shankly revival.", predicted: true },
  { rank: 12, name: 'Ray Clemence', pos: 'GK', posName: 'Goalkeeper', nat: 'ENG', era: '1967–1981', note: 'A commanding sweeper-keeper behind the great back lines — superb positioning and reflexes over more than 650 games, with three European Cups and five titles.', predicted: true },
  { rank: 13, name: 'Ian Callaghan', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '1960–1978', note: "The club's appearance record-holder with 857 games over 18 years — a tireless, impeccably professional winger-turned-midfielder.", predicted: true },

  // ── 14–100 — officially revealed ──
  { rank: 14, name: 'Kevin Keegan', pos: 'FW', posName: 'Forward', nat: 'ENG', era: '1971–1977', note: 'A dynamic, all-action forward and the face of the Shankly-to-Paisley era; won the 1977 European Cup, then back-to-back Ballons d’Or after leaving for Hamburg.' },
  { rank: 15, name: 'Luis Suárez', pos: 'FW', posName: 'Striker', nat: 'URU', era: '2011–2014', note: 'A relentless, ingenious and combustible striker. His 31-goal 2013–14 season nearly delivered the title and earned the European Golden Shoe.' },
  { rank: 16, name: 'Alisson Becker', pos: 'GK', posName: 'Goalkeeper', nat: 'BRA', era: '2018–', note: 'A modern sweeper-keeper — elite shot-stopping, command and distribution. Pivotal to the 2019 Champions League and 2020 title; even headed a 95th-minute winner at Newcastle.' },
  { rank: 17, name: 'Emlyn Hughes', pos: 'DF', posName: 'Defender', nat: 'ENG', era: '1967–1979', note: "'Crazy Horse' — a barnstorming, versatile defender and inspirational captain who lifted two European Cups." },
  { rank: 18, name: 'Phil Neal', pos: 'DF', posName: 'Right-back', nat: 'ENG', era: '1974–1985', note: 'The most decorated English footballer of all — four European Cups and a stack of titles. A near ever-present, ice-cool penalty-taking right-back.' },
  { rank: 19, name: 'Sadio Mané', pos: 'FW', posName: 'Winger', nat: 'SEN', era: '2016–2022', note: 'Electric pace, power and big-game goals on the left of Klopp’s front three; CL 2019 and the 2020 title, later twice African Footballer of the Year.' },
  { rank: 20, name: 'Ian St John', pos: 'FW', posName: 'Forward', nat: 'SCO', era: '1961–1971', note: 'A brave, clever centre-forward signed by Shankly to spark the 1960s rise — and the man who headed the winning goal in the 1965 FA Cup final.' },
  { rank: 21, name: 'Phil Thompson', pos: 'DF', posName: 'Centre-back', nat: 'ENG', era: '1971–1985', note: 'A local, no-nonsense centre-back and European Cup-winning captain; later returned as Houllier’s assistant manager.' },
  { rank: 22, name: 'Roberto Firmino', pos: 'FW', posName: 'Forward', nat: 'BRA', era: '2015–2023', note: 'The selfless false-nine who made Klopp’s front three tick — ferocious pressing, sublime link play and a habit of no-look finishes.' },
  { rank: 23, name: 'Jamie Carragher', pos: 'DF', posName: 'Centre-back', nat: 'ENG', era: '1996–2013', note: 'A one-club defender of total commitment across 737 games, reinvented from full-back to centre-half. Now the voice of the club on TV.' },
  { rank: 24, name: 'Michael Owen', pos: 'FW', posName: 'Striker', nat: 'ENG', era: '1996–2004', note: 'A blistering teenage goal-machine and the 2001 Ballon d’Or winner, whose two late goals won that year’s FA Cup final against Arsenal.' },
  { rank: 25, name: 'Jordan Henderson', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '2011–2023', note: 'The driving, vocal captain who lifted the Champions League and a first league title in 30 years — all relentless running and leadership.' },
  { rank: 26, name: 'Andy Robertson', pos: 'DF', posName: 'Left-back', nat: 'SCO', era: '2017–', note: 'A rampaging, set-piece-delivering left-back who redefined the role; half of the most productive full-back pairing in Premier League history.' },
  { rank: 27, name: 'Ron Yeats', pos: 'DF', posName: 'Centre-back', nat: 'SCO', era: '1961–1971', note: "'The Colossus' — the towering centre-half Shankly built his side around, captaining the 1960s title and FA Cup triumphs." },
  { rank: 28, name: 'Trent Alexander-Arnold', pos: 'DF', posName: 'Right-back', nat: 'ENG', era: '2016–2025', note: 'A local right-back turned elite creator — whipped crosses, raking switches and trademark quick free-kicks. Left for Real Madrid in 2025.' },
  { rank: 29, name: 'Sami Hyypiä', pos: 'DF', posName: 'Centre-back', nat: 'FIN', era: '1999–2009', note: 'A calm, commanding centre-half and aerial force; the cornerstone of the 2001 treble side and a long-serving captain.' },
  { rank: 30, name: 'Steve Heighway', pos: 'FW', posName: 'Winger', nat: 'IRL', era: '1970–1981', note: 'A quick, university-educated winger who terrorised full-backs in the ’70s; later the academy director who developed Gerrard, Owen and Carragher.' },
  { rank: 31, name: 'Gordon Hodgson', pos: 'FW', posName: 'Forward', nat: 'RSA', era: '1925–1936', note: 'A prolific inter-war centre-forward with a fierce shot — 241 goals, long the club record.' },
  { rank: 32, name: 'Elisha Scott', pos: 'GK', posName: 'Goalkeeper', nat: 'NIR', era: '1912–1934', note: 'A fearless, agile keeper revered over 22 years; the great rival-friend of Everton’s Dixie Dean and a 1920s title winner.' },
  { rank: 33, name: 'Ronnie Whelan', pos: 'MF', posName: 'Midfielder', nat: 'IRL', era: '1981–1994', note: 'A smart, two-footed Irish midfielder with an eye for important goals; a fixture of the dominant 1980s sides.' },
  { rank: 34, name: 'Terry McDermott', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '1974–1982', note: 'A stylish, late-arriving goalscoring midfielder; in 1980 the first player to win the PFA and FWA awards in the same season.' },
  { rank: 35, name: 'Mark Lawrenson', pos: 'DF', posName: 'Centre-back', nat: 'IRL', era: '1981–1988', note: 'A quick, elegant and versatile defender — the ideal foil to Hansen until injury cut him short.' },
  { rank: 36, name: 'Ray Kennedy', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '1974–1982', note: 'An Arsenal striker reinvented by Paisley into a goalscoring left-sided midfielder — a key man of the European Cup era.' },
  { rank: 37, name: 'Tommy Smith', pos: 'DF', posName: 'Defender', nat: 'ENG', era: '1962–1978', note: "'The Anfield Iron' — Shankly’s hard-as-nails enforcer who, fittingly, headed a goal in the 1977 European Cup final." },
  { rank: 38, name: 'Steve McManaman', pos: 'MF', posName: 'Winger', nat: 'ENG', era: '1990–1999', note: 'A gangly, gliding dribbler who carried the ball at pace from midfield; a creative fans’ favourite of the ’90s.' },
  { rank: 39, name: 'Alan Kennedy', pos: 'DF', posName: 'Left-back', nat: 'ENG', era: '1978–1985', note: 'An attacking left-back who wrote himself into folklore — the winning goal in the 1981 European Cup final and the decisive penalty in 1984.' },
  { rank: 40, name: 'Harry Chambers', pos: 'FW', posName: 'Forward', nat: 'ENG', era: '1915–1928', note: "'Smiler' — a sharp inside-forward and the top scorer of the back-to-back 1922 and 1923 champions." },
  { rank: 41, name: 'Steve Nicol', pos: 'DF', posName: 'Defender', nat: 'SCO', era: '1981–1995', note: 'A supremely versatile defender who filled in almost anywhere; the 1989 FWA Player of the Year.' },
  { rank: 42, name: 'Bruce Grobbelaar', pos: 'GK', posName: 'Goalkeeper', nat: 'ZIM', era: '1981–1994', note: 'A flamboyant, acrobatic and unpredictable keeper whose famous “spaghetti legs” helped win the 1984 European Cup shootout in Rome.' },
  { rank: 43, name: 'Jan Mølby', pos: 'MF', posName: 'Midfielder', nat: 'DEN', era: '1984–1996', note: 'A cultured Dane with a wand of a left foot and a near-perfect penalty record; the deep-lying passer of the 1986 Double side.' },
  { rank: 44, name: 'Fernando Torres', pos: 'FW', posName: 'Striker', nat: 'ESP', era: '2007–2011', note: "'El Niño' — a thrilling, lightning-quick centre-forward with ice-cold finishing, before a British-record sale to Chelsea." },
  { rank: 45, name: 'Chris Lawler', pos: 'DF', posName: 'Right-back', nat: 'ENG', era: '1960–1975', note: "'The Silent Knight' — an attacking full-back with an uncanny knack for goals from defence in the Shankly years." },
  { rank: 46, name: 'Steve McMahon', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '1985–1991', note: 'A combative, driving central midfielder with a fine shot — the snarling engine of the late-’80s title sides.' },
  { rank: 47, name: 'Alex Raisbeck', pos: 'DF', posName: 'Centre-half', nat: 'SCO', era: '1898–1909', note: 'A dashing, dominant centre-half — the first great Liverpool defender and captain of the 1901 and 1906 champions.' },
  { rank: 48, name: 'James Milner', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '2015–2023', note: 'A relentless, ultra-professional utility man — midfield, either full-back, penalties — and a CL and PL winner deep into his 30s.' },
  { rank: 49, name: 'Jimmy Case', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '1975–1981', note: 'A fearsome competitor with one of the hardest shots the club has seen; three European Cups from the right of midfield.' },
  { rank: 50, name: 'John Toshack', pos: 'FW', posName: 'Striker', nat: 'WAL', era: '1970–1978', note: 'A brilliant aerial target man whose telepathic partnership with Keegan tormented defences; later managed Wales and Real Madrid.' },
  { rank: 51, name: 'Jack Balmer', pos: 'FW', posName: 'Forward', nat: 'ENG', era: '1935–1952', note: 'A stylish local forward and captain of the 1947 champions; famously scored hat-tricks in three consecutive games.' },
  { rank: 52, name: 'Donald MacKinlay', pos: 'DF', posName: 'Full-back', nat: 'SCO', era: '1910–1929', note: 'A long-serving, two-footed full-back and the captain of the 1922 and 1923 title-winning sides.' },
  { rank: 53, name: 'Peter Beardsley', pos: 'FW', posName: 'Forward', nat: 'ENG', era: '1987–1991', note: 'An inventive, deep-lying forward whose vision and dribbling lit up the swashbuckling 1988 title side.' },
  { rank: 54, name: 'Xabi Alonso', pos: 'MF', posName: 'Midfielder', nat: 'ESP', era: '2004–2009', note: 'A metronomic deep-lying playmaker with extraordinary range; scored the rebound equaliser in the 2005 Istanbul comeback.' },
  { rank: 55, name: 'Divock Origi', pos: 'FW', posName: 'Striker', nat: 'BEL', era: '2014–2022', note: 'The ultimate cult hero — the 96th-minute derby winner, the quick corner against Barcelona and the clincher in the 2019 final.' },
  { rank: 56, name: 'Jamie Redknapp', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '1991–2002', note: 'A composed, elegant passer and captain of the ’90s whose career was repeatedly disrupted by injury.' },
  { rank: 57, name: 'Diogo Jota', pos: 'FW', posName: 'Forward', nat: 'POR', era: '2020–2025', note: 'A clever, two-footed finisher with razor movement. The club retired his No. 20 across every level after his death in 2025.' },
  { rank: 58, name: 'Bob Paisley', pos: 'DF', posName: 'Wing-half', nat: 'ENG', era: '1939–1954', note: 'A title-winning wing-half and quiet backroom man who became the most decorated British manager — three European Cups in nine years.' },
  { rank: 59, name: 'Sammy Lee', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '1978–1986', note: 'A tenacious, energetic local midfielder of the European Cup era; later a long-serving coach at the club.' },
  { rank: 60, name: 'Ephraim Longworth', pos: 'DF', posName: 'Full-back', nat: 'ENG', era: '1910–1928', note: 'A dependable, sporting full-back and captain across the 1922 and 1923 title wins; the club’s first England captain.' },
  { rank: 61, name: 'Craig Johnston', pos: 'MF', posName: 'Midfielder', nat: 'AUS', era: '1981–1988', note: 'A buccaneering, high-energy midfielder who retired early — and later invented the Adidas Predator boot.' },
  { rank: 62, name: 'Peter Thompson', pos: 'FW', posName: 'Winger', nat: 'ENG', era: '1963–1973', note: 'A dazzling, two-footed winger and one of the most exciting dribblers of the Shankly 1960s.' },
  { rank: 63, name: 'John Arne Riise', pos: 'DF', posName: 'Left-back', nat: 'NOR', era: '2001–2008', note: 'A marauding left-back with a ferociously powerful left foot — a genuine thunderbolt specialist of the 2005 European run.' },
  { rank: 64, name: 'Pepe Reina', pos: 'GK', posName: 'Goalkeeper', nat: 'ESP', era: '2005–2013', note: 'A superb shot-stopper and pioneering ball-playing keeper; won three straight Premier League Golden Gloves.' },
  { rank: 65, name: 'John Aldridge', pos: 'FW', posName: 'Striker', nat: 'IRL', era: '1987–1989', note: 'A clinical, Scouse penalty-box predator who seamlessly replaced Rush and scored on his full debut.' },
  { rank: 66, name: 'Joe Gomez', pos: 'DF', posName: 'Defender', nat: 'ENG', era: '2015–', note: 'A quick, composed and versatile defender — centre-back or right-back — and a long servant since arriving as a teenager.' },
  { rank: 67, name: 'David Fairclough', pos: 'FW', posName: 'Forward', nat: 'ENG', era: '1975–1983', note: "The original 'Supersub' — a pacey forward famous for game-changing goals off the bench, none bigger than against Saint-Étienne in 1977." },
  { rank: 68, name: 'Fabinho', pos: 'MF', posName: 'Defensive mid', nat: 'BRA', era: '2018–2023', note: "'The Lighthouse' — a positionally peerless holding midfielder who shielded the defence through the CL and PL wins." },
  { rank: 69, name: 'Georginio Wijnaldum', pos: 'MF', posName: 'Midfielder', nat: 'NED', era: '2016–2021', note: 'An unflappable big-game midfielder; his two goals off the bench completed the 4–0 Barcelona comeback in 2019.' },
  { rank: 70, name: 'Albert Stubbins', pos: 'FW', posName: 'Forward', nat: 'ENG', era: '1946–1953', note: 'A popular, quick centre-forward of the 1947 champions — and one of the faces on the Beatles’ Sgt. Pepper cover.' },
  { rank: 71, name: 'Emile Heskey', pos: 'FW', posName: 'Forward', nat: 'ENG', era: '2000–2004', note: 'A powerful, selfless forward whose strength and hold-up play were central to the 2001 cup treble.' },
  { rank: 72, name: 'Joel Matip', pos: 'DF', posName: 'Centre-back', nat: 'CMR', era: '2016–2024', note: 'A tall, ball-carrying centre-back who would stride out of defence with it; a CL and PL winner.' },
  { rank: 73, name: 'Tom Bromilow', pos: 'MF', posName: 'Wing-half', nat: 'ENG', era: '1919–1930', note: 'A cultured, intelligent wing-half and the creative hub of the back-to-back 1920s champions.' },
  { rank: 74, name: 'Dietmar Hamann', pos: 'MF', posName: 'Defensive mid', nat: 'GER', era: '1999–2006', note: 'A disciplined holding midfielder whose half-time introduction in Istanbul 2005 turned the final around.' },
  { rank: 75, name: "Alan A'Court", pos: 'FW', posName: 'Winger', nat: 'ENG', era: '1952–1964', note: 'A direct, loyal winger who served through the Second Division years and into the First, and played at the 1958 World Cup.' },
  { rank: 76, name: 'Luis Díaz', pos: 'FW', posName: 'Winger', nat: 'COL', era: '2022–2025', note: 'A direct, fearless and high-pressing winger with flair and end product; sold to Bayern Munich in 2025.' },
  { rank: 77, name: 'Ronnie Moran', pos: 'DF', posName: 'Full-back', nat: 'ENG', era: '1952–1965', note: 'A tough full-back, then a Boot Room cornerstone for decades — the bawling sergeant-major of the dynasty’s coaching staff.' },
  { rank: 78, name: 'Tommy Lawrence', pos: 'GK', posName: 'Goalkeeper', nat: 'SCO', era: '1958–1971', note: "'The Flying Pig' — an early sweeper-keeper who patrolled behind Shankly’s high line in the 1960s." },
  { rank: 79, name: 'Daniel Sturridge', pos: 'FW', posName: 'Striker', nat: 'ENG', era: '2013–2019', note: 'A wonderfully clinical, two-footed striker; the lethal “SAS” partnership with Suárez in 2013–14.' },
  { rank: 80, name: 'Ray Houghton', pos: 'MF', posName: 'Midfielder', nat: 'IRL', era: '1987–1992', note: 'A busy, hard-running wide midfielder of the 1988 and 1990 title-winning sides.' },
  { rank: 81, name: 'Dirk Kuyt', pos: 'FW', posName: 'Forward', nat: 'NED', era: '2006–2012', note: 'A tireless, selfless forward who reinvented himself as a right-sided runner — and scored a derby hat-trick against Everton.' },
  { rank: 82, name: 'Matt Busby', pos: 'MF', posName: 'Wing-half', nat: 'SCO', era: '1936–1939', note: 'A thoughtful wing-half of the late ’30s — far better remembered as the manager who built Manchester United.' },
  { rank: 83, name: 'Vladimír Šmicer', pos: 'MF', posName: 'Midfielder', nat: 'CZE', era: '1999–2005', note: 'A skilful, underrated wide midfielder whose goal lit the 2005 Istanbul comeback — in his final game for the club.' },
  { rank: 84, name: 'Gerry Byrne', pos: 'DF', posName: 'Full-back', nat: 'ENG', era: '1955–1969', note: 'A tough, dependable full-back who played almost all of the 1965 FA Cup final win with a broken collarbone.' },
  { rank: 85, name: 'Phil Taylor', pos: 'MF', posName: 'Wing-half', nat: 'ENG', era: '1936–1954', note: 'An elegant wing-half and captain of the late ’40s; later the manager immediately before Shankly.' },
  { rank: 86, name: 'Jerzy Dudek', pos: 'GK', posName: 'Goalkeeper', nat: 'POL', era: '2001–2007', note: 'The hero of Istanbul — the late double-save on Shevchenko and the “spaghetti legs” that won the 2005 shootout.' },
  { rank: 87, name: 'Philippe Coutinho', pos: 'MF', posName: 'Attacking mid', nat: 'BRA', era: '2013–2018', note: "'The Little Magician' — a dazzling playmaker with a trademark long-range thunderbolt; sold to Barcelona for a then-club-record fee." },
  { rank: 88, name: 'Sam Raybould', pos: 'FW', posName: 'Forward', nat: 'ENG', era: '1900–1907', note: 'A prolific early-1900s centre-forward — the club’s first true goalscoring star and a 1906 title winner.' },
  { rank: 89, name: 'Jack Parkinson', pos: 'FW', posName: 'Forward', nat: 'ENG', era: '1902–1914', note: 'A sharp local goalscorer of the Edwardian era and a 1906 champion.' },
  { rank: 90, name: 'David Johnson', pos: 'FW', posName: 'Forward', nat: 'ENG', era: '1976–1982', note: 'A busy, two-spell Scouse forward and a title winner who also turned out for Everton.' },
  { rank: 91, name: 'Danny Murphy', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '1997–2004', note: 'A clever, set-piece-capable midfielder — remembered for a knack of scoring winners at Old Trafford.' },
  { rank: 92, name: 'Dick Forshaw', pos: 'FW', posName: 'Inside-forward', nat: 'ENG', era: '1919–1927', note: 'A versatile inside-forward of the back-to-back 1920s champions — who later won the title with Everton too.' },
  { rank: 93, name: 'Curtis Jones', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '2019–', note: 'A composed, press-resistant local academy graduate who grew into a trusted rotation midfielder.' },
  { rank: 94, name: 'Lucas Leiva', pos: 'MF', posName: 'Defensive mid', nat: 'BRA', era: '2007–2017', note: 'A much-loved holding midfielder who reinvented himself as a screening anchor across a decade of service.' },
  { rank: 95, name: 'Adam Lallana', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '2014–2020', note: 'A neat, press-leading and creative midfielder whose quality on the ball helped shape Klopp’s early sides.' },
  { rank: 96, name: 'Bobby Robinson', pos: 'FW', posName: 'Forward', nat: 'ENG', era: '1904–1912', note: 'A reliable inside-forward of the early-1900s sides and a 1906 title winner.' },
  { rank: 97, name: 'Jack Cox', pos: 'FW', posName: 'Winger', nat: 'ENG', era: '1898–1909', note: 'A skilful outside-left and one of the club’s first stars, in the title-winning teams of 1901 and 1906.' },
  { rank: 98, name: 'Luis García', pos: 'FW', posName: 'Forward', nat: 'ESP', era: '2004–2007', note: "A flair forward for the big occasion — scorer of the famous 'ghost goal' against Chelsea that sent Liverpool to Istanbul." },
  { rank: 99, name: 'Dominik Szoboszlai', pos: 'MF', posName: 'Midfielder', nat: 'HUN', era: '2023–', note: 'A dynamic, hard-running box-to-box midfielder and a genuine set-piece weapon — a specialist from direct free-kicks with a fierce long-range shot.' },
  { rank: 100, name: 'Alexis Mac Allister', pos: 'MF', posName: 'Midfielder', nat: 'ARG', era: '2023–', note: 'A World Cup-winning midfielder with elite control and passing — the deep-lying brain anchoring the post-Salah rebuild.' },
];

export const TABS = [
  { v: 'now', label: 'The Verdict' },
  { v: 'history', label: 'History' },
  { v: 'top100', label: 'Top 100' },
  { v: 'squad', label: 'Squad & XI' },
  { v: 'transfers', label: 'Transfers' },
  { v: 'club', label: 'Club & Rivals' },
  { v: 'study', label: 'Study Mode' },
] as const;

export type TabId = (typeof TABS)[number]['v'];
