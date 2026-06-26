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

export type SummerMove = { p: string; pos: string; mv: string; fee: string; type: 'in' | 'out' | 'rumor'; when: string };

export const summer26: SummerMove[] = [
  { p: 'Víctor Munoz', pos: 'LW', mv: 'Osasuna', fee: '€40m', type: 'in', when: 'Confirmed signing' },
  { p: 'Mohamed Salah', pos: 'RW', mv: 'Departed (MLS linked)', fee: '—', type: 'out', when: 'Left end of season' },
  { p: 'Ibrahima Konaté', pos: 'CB', mv: 'Real Madrid', fee: 'Free', type: 'out', when: 'Closing on move' },
  { p: 'Andy Robertson', pos: 'LB', mv: 'Exit expected', fee: '—', type: 'out', when: 'Leaving in rebuild' },
  { p: 'Bradley Barcola', pos: 'W', mv: 'PSG', fee: '~€80m+', type: 'rumor', when: 'Shortlisted · Arsenal rivalling' },
  { p: 'Yan Diomande', pos: 'RW', mv: 'RB Leipzig', fee: '~€100–130m', type: 'rumor', when: 'Top wing target' },
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

export const TABS = [
  { v: 'now', label: 'The Verdict' },
  { v: 'history', label: 'History' },
  { v: 'squad', label: 'Squad & XI' },
  { v: 'transfers', label: 'Transfers' },
  { v: 'club', label: 'Club & Rivals' },
  { v: 'study', label: 'Study Mode' },
] as const;

export type TabId = (typeof TABS)[number]['v'];
