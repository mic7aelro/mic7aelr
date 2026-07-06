// ─── Liverpool FC 25/26 Catch-Up Hub - data ──────────────────────────────────
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
  { n: 12, name: 'Conor Bradley', pos: 'DF', posName: 'Right-back', nat: 'NIR', from: 'Academy', fee: '-', when: 'Academy', apps: 78 },
  { n: 15, name: 'Giovanni Leoni', pos: 'DF', posName: 'Centre-back', nat: 'ITA', from: 'Parma', fee: '£26m', when: 'Aug 2025', apps: 1 },
  { n: 26, name: 'Andy Robertson', pos: 'DF', posName: 'Left-back', nat: 'SCO', from: 'Hull City', fee: '£8m', when: '2017', apps: 376, note: 'Vice-captain' },
  { n: 30, name: 'Jeremie Frimpong', pos: 'DF', posName: 'Right wing-back', nat: 'NED', from: 'Bayer Leverkusen', fee: '£29.5m', when: 'Jun 2025', apps: 32 },
  // MF
  { n: 3, name: 'Wataru Endo', pos: 'MF', posName: 'Defensive mid', nat: 'JPN', from: 'VfB Stuttgart', fee: '£16m', when: '2023', apps: 87 },
  { n: 7, name: 'Florian Wirtz', pos: 'MF', posName: 'Attacking mid', nat: 'GER', from: 'Bayer Leverkusen', fee: '£100m', when: 'Jun 2025', apps: 47 },
  { n: 8, name: 'Dominik Szoboszlai', pos: 'MF', posName: 'Central / attacking mid', nat: 'HUN', from: 'RB Leipzig', fee: '£60m', when: '2023', apps: 143 },
  { n: 10, name: 'Alexis Mac Allister', pos: 'MF', posName: 'Central midfield', nat: 'ARG', from: 'Brighton', fee: '£35m', when: '2023', apps: 146 },
  { n: 17, name: 'Curtis Jones', pos: 'MF', posName: 'Central midfield', nat: 'ENG', from: 'Academy', fee: '-', when: 'Academy', apps: 224 },
  { n: 38, name: 'Ryan Gravenberch', pos: 'MF', posName: 'Defensive / deep mid', nat: 'NED', from: 'Bayern Munich', fee: '£34m', when: '2023', apps: 133 },
  { n: 42, name: 'Trey Nyoni', pos: 'MF', posName: 'Central midfield', nat: 'ENG', from: 'Academy', fee: '-', when: 'Academy', apps: 19 },
  // FW
  { n: 9, name: 'Alexander Isak', pos: 'FW', posName: 'Striker', nat: 'SWE', from: 'Newcastle United', fee: '£125m', when: 'Sep 2025', apps: 21, note: 'British record' },
  { n: 11, name: 'Mohamed Salah', pos: 'FW', posName: 'Right winger', nat: 'EGY', from: 'Roma', fee: '£36.9m', when: '2017', apps: 440, note: 'Left end of ’26 · 4th captain' },
  { n: 14, name: 'Federico Chiesa', pos: 'FW', posName: 'Winger / forward', nat: 'ITA', from: 'Juventus', fee: '£10m', when: '2024', apps: 47 },
  { n: 18, name: 'Cody Gakpo', pos: 'FW', posName: 'Left winger / forward', nat: 'NED', from: 'PSV Eindhoven', fee: '£37m', when: '2023', apps: 176 },
  { n: 22, name: 'Hugo Ekitike', pos: 'FW', posName: 'Striker', nat: 'FRA', from: 'Eintracht Frankfurt', fee: '£69m', when: 'Jul 2025', apps: 45, note: 'Top scorer ’26 (17)' },
  { n: 73, name: 'Rio Ngumoha', pos: 'FW', posName: 'Winger', nat: 'ENG', from: 'Academy', fee: '-', when: 'Academy', apps: 26, note: 'Youngest-ever scorer' },
];

// ─── Full career records (Wikipedia infobox: domestic-league apps & goals) ───
// Only for players who are both in the current squad AND the all-time Top 100.
export type CareerRow = { years: string; team: string; apps: number; goals: number; loan?: boolean };
export type Career = { senior: CareerRow[]; intl: CareerRow[] };

export const careers: Record<string, Career> = {
  'Mohamed Salah': {
    senior: [
      { years: '2010-2012', team: 'Al Mokawloon', apps: 40, goals: 11 },
      { years: '2012-2014', team: 'Basel', apps: 47, goals: 9 },
      { years: '2014-2016', team: 'Chelsea', apps: 13, goals: 2 },
      { years: '2015', team: 'Fiorentina (loan)', apps: 16, goals: 6, loan: true },
      { years: '2015-2016', team: 'Roma (loan)', apps: 34, goals: 14, loan: true },
      { years: '2016-2017', team: 'Roma', apps: 31, goals: 15 },
      { years: '2017-2026', team: 'Liverpool', apps: 315, goals: 191 },
    ],
    intl: [
      { years: '2010-2011', team: 'Egypt U20', apps: 11, goals: 3 },
      { years: '2011-2012', team: 'Egypt U23', apps: 11, goals: 4 },
      { years: '2011-', team: 'Egypt', apps: 120, goals: 68 },
    ],
  },
  'Virgil van Dijk': {
    senior: [
      { years: '2011-2013', team: 'Groningen', apps: 62, goals: 7 },
      { years: '2013-2015', team: 'Celtic', apps: 76, goals: 9 },
      { years: '2015-2018', team: 'Southampton', apps: 67, goals: 4 },
      { years: '2018-', team: 'Liverpool', apps: 272, goals: 27 },
    ],
    intl: [
      { years: '2011', team: 'Netherlands U19', apps: 1, goals: 0 },
      { years: '2011-2013', team: 'Netherlands U21', apps: 3, goals: 0 },
      { years: '2015-', team: 'Netherlands', apps: 96, goals: 13 },
    ],
  },
  'Alisson Becker': {
    senior: [
      { years: '2013-2016', team: 'Internacional', apps: 80, goals: 0 },
      { years: '2016-2018', team: 'Roma', apps: 37, goals: 0 },
      { years: '2018-', team: 'Liverpool', apps: 255, goals: 1 },
    ],
    intl: [
      { years: '2009', team: 'Brazil U17', apps: 3, goals: 0 },
      { years: '2013', team: 'Brazil U20', apps: 5, goals: 0 },
      { years: '2015-', team: 'Brazil', apps: 82, goals: 0 },
    ],
  },
  'Andy Robertson': {
    senior: [
      { years: '2012-2013', team: "Queen's Park", apps: 34, goals: 2 },
      { years: '2013-2014', team: 'Dundee United', apps: 36, goals: 3 },
      { years: '2014-2017', team: 'Hull City', apps: 99, goals: 3 },
      { years: '2017-', team: 'Liverpool', apps: 275, goals: 11 },
    ],
    intl: [
      { years: '2013-2015', team: 'Scotland U21', apps: 4, goals: 0 },
      { years: '2014-', team: 'Scotland', apps: 97, goals: 4 },
    ],
  },
  'Joe Gomez': {
    senior: [
      { years: '2014-2015', team: 'Charlton Athletic', apps: 21, goals: 0 },
      { years: '2015-', team: 'Liverpool', apps: 170, goals: 0 },
    ],
    intl: [
      { years: '2012', team: 'England U16', apps: 2, goals: 0 },
      { years: '2013-2014', team: 'England U17', apps: 19, goals: 0 },
      { years: '2014-2015', team: 'England U19', apps: 4, goals: 0 },
      { years: '2015-2017', team: 'England U21', apps: 7, goals: 0 },
      { years: '2017-2024', team: 'England', apps: 15, goals: 0 },
    ],
  },
  'Curtis Jones': {
    senior: [
      { years: '2018-', team: 'Liverpool', apps: 153, goals: 11 },
    ],
    intl: [
      { years: '2016-2017', team: 'England U16', apps: 4, goals: 1 },
      { years: '2017', team: 'England U17', apps: 3, goals: 0 },
      { years: '2018-2019', team: 'England U18', apps: 11, goals: 1 },
      { years: '2019', team: 'England U19', apps: 4, goals: 0 },
      { years: '2020-2023', team: 'England U21', apps: 20, goals: 5 },
      { years: '2024-', team: 'England', apps: 6, goals: 1 },
    ],
  },
  'Dominik Szoboszlai': {
    senior: [
      { years: '2017-2018', team: 'FC Liefering', apps: 42, goals: 16 },
      { years: '2018-2021', team: 'Red Bull Salzburg', apps: 56, goals: 16 },
      { years: '2021-2023', team: 'RB Leipzig', apps: 62, goals: 12 },
      { years: '2023-', team: 'Liverpool', apps: 105, goals: 15 },
    ],
    intl: [
      { years: '2016-2017', team: 'Hungary U17', apps: 10, goals: 3 },
      { years: '2016-2018', team: 'Hungary U19', apps: 5, goals: 2 },
      { years: '2017-2018', team: 'Hungary U21', apps: 8, goals: 2 },
      { years: '2019-', team: 'Hungary', apps: 65, goals: 18 },
    ],
  },
  'Alexis Mac Allister': {
    senior: [
      { years: '2016-2019', team: 'Argentinos Juniors', apps: 56, goals: 8 },
      { years: '2019-2023', team: 'Brighton & Hove Albion', apps: 98, goals: 16 },
      { years: '2019', team: 'Argentinos Juniors (loan)', apps: 10, goals: 2, loan: true },
      { years: '2019-2020', team: 'Boca Juniors (loan)', apps: 13, goals: 1, loan: true },
      { years: '2023-', team: 'Liverpool', apps: 105, goals: 12 },
    ],
    intl: [
      { years: '2020-2021', team: 'Argentina U23', apps: 9, goals: 5 },
      { years: '2019-', team: 'Argentina', apps: 50, goals: 6 },
    ],
  },
  'Steven Gerrard': {
    senior: [
      { years: '1998-2015', team: 'Liverpool', apps: 504, goals: 120 },
      { years: '2015-2016', team: 'LA Galaxy', apps: 34, goals: 5 },
    ],
    intl: [
      { years: '1999-2000', team: 'England U21', apps: 4, goals: 1 },
      { years: '2000-2014', team: 'England', apps: 114, goals: 21 },
    ],
  },
  'Kenny Dalglish': {
    senior: [
      { years: '1969-1977', team: 'Celtic', apps: 204, goals: 111 },
      { years: '1977-1990', team: 'Liverpool', apps: 355, goals: 118 },
    ],
    intl: [
      { years: '1971-1986', team: 'Scotland', apps: 102, goals: 30 },
    ],
  },
  'Ian Rush': {
    senior: [
      { years: '1978-1980', team: 'Chester City', apps: 34, goals: 14 },
      { years: '1980-1986', team: 'Liverpool', apps: 182, goals: 109 },
      { years: '1986-1988', team: 'Juventus', apps: 29, goals: 7 },
      { years: '1986-1987', team: 'Liverpool (loan)', apps: 42, goals: 30, loan: true },
      { years: '1988-1996', team: 'Liverpool', apps: 245, goals: 90 },
      { years: '1996-1997', team: 'Leeds United', apps: 36, goals: 3 },
      { years: '1997-1998', team: 'Newcastle United', apps: 10, goals: 0 },
      { years: '1998-1999', team: 'Wrexham', apps: 17, goals: 0 },
    ],
    intl: [
      { years: '1980-1996', team: 'Wales', apps: 73, goals: 28 },
    ],
  },
  'John Barnes': {
    senior: [
      { years: '1981-1987', team: 'Watford', apps: 233, goals: 65 },
      { years: '1987-1997', team: 'Liverpool', apps: 314, goals: 84 },
      { years: '1997-1999', team: 'Newcastle United', apps: 27, goals: 6 },
      { years: '1999', team: 'Charlton Athletic', apps: 12, goals: 0 },
    ],
    intl: [
      { years: '1983-1995', team: 'England', apps: 79, goals: 11 },
    ],
  },
  'Graeme Souness': {
    senior: [
      { years: '1972-1978', team: 'Middlesbrough', apps: 201, goals: 22 },
      { years: '1978-1984', team: 'Liverpool', apps: 247, goals: 38 },
      { years: '1984-1986', team: 'Sampdoria', apps: 56, goals: 8 },
      { years: '1986-1991', team: 'Rangers', apps: 50, goals: 3 },
    ],
    intl: [
      { years: '1974-1986', team: 'Scotland', apps: 54, goals: 4 },
    ],
  },
  'Alan Hansen': {
    senior: [
      { years: '1973-1977', team: 'Partick Thistle', apps: 86, goals: 6 },
      { years: '1977-1991', team: 'Liverpool', apps: 434, goals: 8 },
    ],
    intl: [
      { years: '1979-1987', team: 'Scotland', apps: 26, goals: 0 },
    ],
  },
  'Roger Hunt': {
    senior: [
      { years: '1959-1969', team: 'Liverpool', apps: 404, goals: 244 },
      { years: '1969-1972', team: 'Bolton Wanderers', apps: 76, goals: 24 },
    ],
    intl: [
      { years: '1962-1969', team: 'England', apps: 34, goals: 18 },
    ],
  },
  'Ian Callaghan': {
    senior: [
      { years: '1959-1978', team: 'Liverpool', apps: 640, goals: 49 },
      { years: '1978', team: 'Fort Lauderdale Strikers', apps: 20, goals: 0 },
      { years: '1978-1981', team: 'Swansea City', apps: 76, goals: 1 },
      { years: '1981', team: 'Crewe Alexandra', apps: 15, goals: 0 },
    ],
    intl: [
      { years: '1966-1977', team: 'England', apps: 4, goals: 0 },
    ],
  },
  'Billy Liddell': {
    senior: [
      { years: '1938-1961', team: 'Liverpool', apps: 492, goals: 215 },
    ],
    intl: [
      { years: '1946-1955', team: 'Scotland', apps: 28, goals: 6 },
    ],
  },
  'Robbie Fowler': {
    senior: [
      { years: '1993-2001', team: 'Liverpool', apps: 236, goals: 120 },
      { years: '2001-2003', team: 'Leeds United', apps: 30, goals: 14 },
      { years: '2003-2006', team: 'Manchester City', apps: 80, goals: 21 },
      { years: '2006-2007', team: 'Liverpool', apps: 30, goals: 8 },
      { years: '2007-2008', team: 'Cardiff City', apps: 13, goals: 4 },
      { years: '2009-2010', team: 'North Queensland Fury', apps: 26, goals: 9 },
      { years: '2010-2011', team: 'Perth Glory', apps: 28, goals: 9 },
    ],
    intl: [
      { years: '1996-2002', team: 'England', apps: 26, goals: 7 },
    ],
  },
  'Ray Clemence': {
    senior: [
      { years: '1965-1967', team: 'Scunthorpe United', apps: 48, goals: 0 },
      { years: '1967-1981', team: 'Liverpool', apps: 470, goals: 0 },
      { years: '1981-1988', team: 'Tottenham Hotspur', apps: 240, goals: 0 },
    ],
    intl: [
      { years: '1972-1983', team: 'England', apps: 61, goals: 0 },
    ],
  },
  'Kevin Keegan': {
    senior: [
      { years: '1968-1971', team: 'Scunthorpe United', apps: 124, goals: 18 },
      { years: '1971-1977', team: 'Liverpool', apps: 230, goals: 68 },
      { years: '1977-1980', team: 'Hamburger SV', apps: 90, goals: 32 },
      { years: '1980-1982', team: 'Southampton', apps: 68, goals: 37 },
      { years: '1982-1984', team: 'Newcastle United', apps: 78, goals: 48 },
    ],
    intl: [
      { years: '1972-1982', team: 'England', apps: 63, goals: 21 },
    ],
  },
  'Luis Suárez': {
    senior: [
      { years: '2005-2006', team: 'Nacional', apps: 27, goals: 10 },
      { years: '2006-2007', team: 'Groningen', apps: 29, goals: 10 },
      { years: '2007-2011', team: 'Ajax', apps: 110, goals: 81 },
      { years: '2011-2014', team: 'Liverpool', apps: 110, goals: 69 },
      { years: '2014-2020', team: 'Barcelona', apps: 191, goals: 147 },
      { years: '2020-2022', team: 'Atlético Madrid', apps: 67, goals: 32 },
      { years: '2023-2024', team: 'Grêmio', apps: 45, goals: 24 },
      { years: '2024-', team: 'Inter Miami', apps: 66, goals: 36 },
    ],
    intl: [
      { years: '2007-2024', team: 'Uruguay', apps: 143, goals: 69 },
    ],
  },
  'Emlyn Hughes': {
    senior: [
      { years: '1964-1967', team: 'Blackpool', apps: 28, goals: 0 },
      { years: '1967-1979', team: 'Liverpool', apps: 474, goals: 35 },
      { years: '1979-1981', team: 'Wolverhampton Wanderers', apps: 58, goals: 2 },
      { years: '1981-1983', team: 'Rotherham United', apps: 56, goals: 6 },
      { years: '1983-1984', team: 'Swansea City', apps: 7, goals: 0 },
    ],
    intl: [
      { years: '1969-1980', team: 'England', apps: 62, goals: 1 },
    ],
  },
  'Phil Neal': {
    senior: [
      { years: '1967-1974', team: 'Northampton Town', apps: 187, goals: 28 },
      { years: '1974-1985', team: 'Liverpool', apps: 455, goals: 41 },
      { years: '1985-1989', team: 'Bolton Wanderers', apps: 64, goals: 3 },
    ],
    intl: [
      { years: '1976-1983', team: 'England', apps: 50, goals: 5 },
    ],
  },
  'Sadio Mané': {
    senior: [
      { years: '2011-2012', team: 'Metz', apps: 22, goals: 2 },
      { years: '2012-2014', team: 'Red Bull Salzburg', apps: 63, goals: 31 },
      { years: '2014-2016', team: 'Southampton', apps: 67, goals: 21 },
      { years: '2016-2022', team: 'Liverpool', apps: 196, goals: 90 },
      { years: '2022-2023', team: 'Bayern Munich', apps: 25, goals: 7 },
      { years: '2023-', team: 'Al-Nassr', apps: 89, goals: 37 },
    ],
    intl: [
      { years: '2012-', team: 'Senegal', apps: 132, goals: 55 },
    ],
  },
  'Ian St John': {
    senior: [
      { years: '1956-1961', team: 'Motherwell', apps: 113, goals: 80 },
      { years: '1961-1971', team: 'Liverpool', apps: 336, goals: 95 },
      { years: '1971-1972', team: 'Coventry City', apps: 18, goals: 3 },
      { years: '1972-1973', team: 'Tranmere Rovers', apps: 9, goals: 1 },
    ],
    intl: [
      { years: '1959-1965', team: 'Scotland', apps: 21, goals: 9 },
    ],
  },
  'Phil Thompson': {
    senior: [
      { years: '1971-1984', team: 'Liverpool', apps: 340, goals: 7 },
      { years: '1984-1986', team: 'Sheffield United', apps: 37, goals: 0 },
    ],
    intl: [
      { years: '1976-1982', team: 'England', apps: 42, goals: 1 },
    ],
  },
  'Roberto Firmino': {
    senior: [
      { years: '2009-2011', team: 'Figueirense', apps: 38, goals: 8 },
      { years: '2011-2015', team: 'TSG Hoffenheim', apps: 140, goals: 38 },
      { years: '2015-2023', team: 'Liverpool', apps: 256, goals: 82 },
      { years: '2023-2025', team: 'Al-Ahli', apps: 49, goals: 14 },
      { years: '2025-', team: 'Al-Sadd', apps: 21, goals: 13 },
    ],
    intl: [
      { years: '2014-2021', team: 'Brazil', apps: 55, goals: 17 },
    ],
  },
  'Jamie Carragher': {
    senior: [
      { years: '1996-2013', team: 'Liverpool', apps: 508, goals: 3 },
    ],
    intl: [
      { years: '1999-2010', team: 'England', apps: 38, goals: 0 },
    ],
  },
  'Michael Owen': {
    senior: [
      { years: '1996-2004', team: 'Liverpool', apps: 216, goals: 118 },
      { years: '2004-2005', team: 'Real Madrid', apps: 36, goals: 13 },
      { years: '2005-2009', team: 'Newcastle United', apps: 71, goals: 26 },
      { years: '2009-2012', team: 'Manchester United', apps: 31, goals: 5 },
      { years: '2012-2013', team: 'Stoke City', apps: 8, goals: 1 },
    ],
    intl: [
      { years: '1998-2008', team: 'England', apps: 89, goals: 40 },
    ],
  },
  'Jordan Henderson': {
    senior: [
      { years: '2008-2011', team: 'Sunderland', apps: 71, goals: 4 },
      { years: '2009', team: 'Coventry City (loan)', apps: 10, goals: 1, loan: true },
      { years: '2011-2023', team: 'Liverpool', apps: 360, goals: 29 },
      { years: '2023-2024', team: 'Al-Ettifaq', apps: 17, goals: 0 },
      { years: '2024-2025', team: 'Ajax', apps: 37, goals: 1 },
      { years: '2025-', team: 'Brentford', apps: 32, goals: 1 },
    ],
    intl: [
      { years: '2010-', team: 'England', apps: 91, goals: 3 },
    ],
  },
  'Ron Yeats': {
    senior: [
      { years: '1957-1961', team: 'Dundee United', apps: 96, goals: 1 },
      { years: '1961-1971', team: 'Liverpool', apps: 358, goals: 13 },
      { years: '1971-1974', team: 'Tranmere Rovers', apps: 97, goals: 5 },
    ],
    intl: [
      { years: '1964', team: 'Scotland', apps: 2, goals: 0 },
    ],
  },
  'Trent Alexander-Arnold': {
    senior: [
      { years: '2016-2025', team: 'Liverpool', apps: 259, goals: 18 },
      { years: '2025-', team: 'Real Madrid', apps: 21, goals: 0 },
    ],
    intl: [
      { years: '2018-', team: 'England', apps: 34, goals: 4 },
    ],
  },
  'Sami Hyypiä': {
    senior: [
      { years: '1992-1995', team: 'MyPa', apps: 96, goals: 8 },
      { years: '1995-1999', team: 'Willem II', apps: 100, goals: 3 },
      { years: '1999-2009', team: 'Liverpool', apps: 318, goals: 22 },
      { years: '2009-2011', team: 'Bayer Leverkusen', apps: 53, goals: 3 },
    ],
    intl: [
      { years: '1992-2010', team: 'Finland', apps: 105, goals: 5 },
    ],
  },
  'Steve Heighway': {
    senior: [
      { years: '1970-1981', team: 'Liverpool', apps: 444, goals: 76 },
      { years: '1981', team: 'Minnesota Kicks', apps: 26, goals: 19 },
    ],
    intl: [
      { years: '1970-1981', team: 'Republic of Ireland', apps: 26, goals: 0 },
    ],
  },
  'Gordon Hodgson': {
    senior: [
      { years: '1925-1936', team: 'Liverpool', apps: 358, goals: 233 },
      { years: '1936-1937', team: 'Aston Villa', apps: 28, goals: 11 },
      { years: '1937-1939', team: 'Leeds United', apps: 81, goals: 51 },
    ],
    intl: [
      { years: '1924', team: 'South Africa', apps: 2, goals: 0 },
      { years: '1930-1931', team: 'England', apps: 3, goals: 1 },
    ],
  },
  'Elisha Scott': {
    senior: [
      { years: '1912-1915', team: 'Liverpool', apps: 28, goals: 0 },
      { years: '1919-1934', team: 'Liverpool', apps: 402, goals: 0 },
    ],
    intl: [
      { years: '1920-1936', team: 'Ireland (IFA)', apps: 31, goals: 0 },
    ],
  },
  'Ronnie Whelan': {
    senior: [
      { years: '1977-1979', team: 'Home Farm', apps: 45, goals: 7 },
      { years: '1979-1994', team: 'Liverpool', apps: 362, goals: 46 },
      { years: '1994-1996', team: 'Southend United', apps: 34, goals: 1 },
    ],
    intl: [
      { years: '1981-1995', team: 'Republic of Ireland', apps: 53, goals: 3 },
    ],
  },
  'Terry McDermott': {
    senior: [
      { years: '1969-1973', team: 'Bury', apps: 90, goals: 8 },
      { years: '1973-1974', team: 'Newcastle United', apps: 56, goals: 6 },
      { years: '1974-1982', team: 'Liverpool', apps: 232, goals: 54 },
      { years: '1982-1984', team: 'Newcastle United', apps: 74, goals: 12 },
      { years: '1985-1987', team: 'APOEL', apps: 50, goals: 1 },
    ],
    intl: [
      { years: '1977-1982', team: 'England', apps: 25, goals: 3 },
    ],
  },
  'Mark Lawrenson': {
    senior: [
      { years: '1974-1977', team: 'Preston North End', apps: 73, goals: 2 },
      { years: '1977-1981', team: 'Brighton & Hove Albion', apps: 152, goals: 5 },
      { years: '1981-1988', team: 'Liverpool', apps: 332, goals: 11 },
      { years: '1989', team: 'Tampa Bay Rowdies', apps: 20, goals: 3 },
    ],
    intl: [
      { years: '1977-1987', team: 'Republic of Ireland', apps: 39, goals: 5 },
    ],
  },
  'Ray Kennedy': {
    senior: [
      { years: '1968-1974', team: 'Arsenal', apps: 213, goals: 71 },
      { years: '1974-1982', team: 'Liverpool', apps: 393, goals: 72 },
      { years: '1982-1983', team: 'Swansea City', apps: 51, goals: 2 },
      { years: '1983-1984', team: 'Hartlepool United', apps: 24, goals: 3 },
    ],
    intl: [
      { years: '1976-1980', team: 'England', apps: 17, goals: 3 },
    ],
  },
  'Tommy Smith': {
    senior: [
      { years: '1962-1978', team: 'Liverpool', apps: 467, goals: 36 },
      { years: '1976', team: 'Tampa Bay Rowdies', apps: 17, goals: 0 },
      { years: '1978-1979', team: 'Swansea City', apps: 36, goals: 2 },
    ],
    intl: [
      { years: '1971', team: 'England', apps: 1, goals: 0 },
    ],
  },
  'Steve McManaman': {
    senior: [
      { years: '1990-1999', team: 'Liverpool', apps: 272, goals: 46 },
      { years: '1999-2003', team: 'Real Madrid', apps: 94, goals: 8 },
      { years: '2003-2005', team: 'Manchester City', apps: 35, goals: 0 },
    ],
    intl: [
      { years: '1994-2001', team: 'England', apps: 37, goals: 3 },
    ],
  },
  'Alan Kennedy': {
    senior: [
      { years: '1972-1978', team: 'Newcastle United', apps: 158, goals: 9 },
      { years: '1978-1986', team: 'Liverpool', apps: 251, goals: 15 },
      { years: '1986-1987', team: 'Sunderland', apps: 54, goals: 2 },
      { years: '1987', team: 'Wigan Athletic', apps: 22, goals: 0 },
      { years: '1989-1990', team: 'Wrexham', apps: 16, goals: 0 },
    ],
    intl: [
      { years: '1984', team: 'England', apps: 2, goals: 0 },
    ],
  },
  'Harry Chambers': {
    senior: [
      { years: '1915-1928', team: 'Liverpool', apps: 339, goals: 151 },
      { years: '1928-1929', team: 'West Bromwich Albion', apps: 40, goals: 4 },
    ],
    intl: [
      { years: '1921-1923', team: 'England', apps: 8, goals: 5 },
    ],
  },
  'Steve Nicol': {
    senior: [
      { years: '1979-1981', team: 'Ayr United', apps: 70, goals: 7 },
      { years: '1981-1994', team: 'Liverpool', apps: 343, goals: 36 },
      { years: '1994-1996', team: 'Notts County', apps: 32, goals: 2 },
      { years: '1996-1998', team: 'Sheffield Wednesday', apps: 49, goals: 0 },
    ],
    intl: [
      { years: '1984-1992', team: 'Scotland', apps: 27, goals: 0 },
    ],
  },
  'Bruce Grobbelaar': {
    senior: [
      { years: '1979-1981', team: 'Vancouver Whitecaps', apps: 24, goals: 0 },
      { years: '1979-1980', team: 'Crewe Alexandra (loan)', apps: 24, goals: 1, loan: true },
      { years: '1981-1994', team: 'Liverpool', apps: 440, goals: 0 },
      { years: '1994-1996', team: 'Southampton', apps: 32, goals: 0 },
      { years: '1996-1997', team: 'Plymouth Argyle', apps: 36, goals: 0 },
    ],
    intl: [
      { years: '1977-1998', team: 'Zimbabwe', apps: 33, goals: 0 },
    ],
  },
  'Jan Mølby': {
    senior: [
      { years: '1981-1982', team: 'Kolding', apps: 40, goals: 0 },
      { years: '1982-1984', team: 'Ajax', apps: 57, goals: 11 },
      { years: '1984-1996', team: 'Liverpool', apps: 218, goals: 44 },
      { years: '1996-1998', team: 'Swansea City', apps: 41, goals: 8 },
    ],
    intl: [
      { years: '1982-1990', team: 'Denmark', apps: 33, goals: 2 },
    ],
  },
  'Fernando Torres': {
    senior: [
      { years: '2001-2007', team: 'Atlético Madrid', apps: 214, goals: 82 },
      { years: '2007-2011', team: 'Liverpool', apps: 102, goals: 65 },
      { years: '2011-2015', team: 'Chelsea', apps: 110, goals: 20 },
      { years: '2014-2015', team: 'AC Milan', apps: 10, goals: 1 },
      { years: '2015-2018', team: 'Atlético Madrid', apps: 107, goals: 27 },
      { years: '2018-2019', team: 'Sagan Tosu', apps: 35, goals: 5 },
    ],
    intl: [
      { years: '2003-2014', team: 'Spain', apps: 110, goals: 38 },
    ],
  },
  'Chris Lawler': {
    senior: [
      { years: '1960-1975', team: 'Liverpool', apps: 406, goals: 41 },
      { years: '1975-1977', team: 'Portsmouth', apps: 36, goals: 0 },
      { years: '1977-1978', team: 'Stockport County', apps: 36, goals: 3 },
    ],
    intl: [
      { years: '1971', team: 'England', apps: 4, goals: 1 },
    ],
  },
  'Steve McMahon': {
    senior: [
      { years: '1979-1983', team: 'Everton', apps: 100, goals: 11 },
      { years: '1983-1985', team: 'Aston Villa', apps: 75, goals: 7 },
      { years: '1985-1991', team: 'Liverpool', apps: 204, goals: 29 },
      { years: '1991-1994', team: 'Manchester City', apps: 87, goals: 1 },
      { years: '1994-1998', team: 'Swindon Town', apps: 42, goals: 0 },
    ],
    intl: [
      { years: '1988-1990', team: 'England', apps: 17, goals: 0 },
    ],
  },
  'Alex Raisbeck': {
    senior: [
      { years: '1896-1898', team: 'Hibernian', apps: 25, goals: 3 },
      { years: '1898-1909', team: 'Liverpool', apps: 312, goals: 19 },
      { years: '1909-1914', team: 'Partick Thistle', apps: 113, goals: 7 },
    ],
    intl: [
      { years: '1900-1907', team: 'Scotland', apps: 8, goals: 0 },
    ],
  },
  'James Milner': {
    senior: [
      { years: '2002-2004', team: 'Leeds United', apps: 48, goals: 5 },
      { years: '2004-2008', team: 'Newcastle United', apps: 94, goals: 6 },
      { years: '2005-2006', team: 'Aston Villa (loan)', apps: 27, goals: 1, loan: true },
      { years: '2008-2010', team: 'Aston Villa', apps: 73, goals: 11 },
      { years: '2010-2015', team: 'Manchester City', apps: 147, goals: 13 },
      { years: '2015-2023', team: 'Liverpool', apps: 230, goals: 19 },
      { years: '2023-', team: 'Brighton & Hove Albion', apps: 39, goals: 1 },
    ],
    intl: [
      { years: '2009-2016', team: 'England', apps: 61, goals: 1 },
    ],
  },
  'Jimmy Case': {
    senior: [
      { years: '1973-1981', team: 'Liverpool', apps: 186, goals: 23 },
      { years: '1981-1985', team: 'Brighton & Hove Albion', apps: 127, goals: 10 },
      { years: '1985-1991', team: 'Southampton', apps: 215, goals: 10 },
      { years: '1991-1992', team: 'AFC Bournemouth', apps: 40, goals: 1 },
      { years: '1992-1993', team: 'Halifax Town', apps: 21, goals: 2 },
    ],
    intl: [
      { years: '1976', team: 'England U23', apps: 1, goals: 1 },
    ],
  },
  'John Toshack': {
    senior: [
      { years: '1965-1970', team: 'Cardiff City', apps: 162, goals: 74 },
      { years: '1970-1978', team: 'Liverpool', apps: 172, goals: 74 },
      { years: '1978-1984', team: 'Swansea City', apps: 63, goals: 24 },
    ],
    intl: [
      { years: '1969-1980', team: 'Wales', apps: 40, goals: 13 },
    ],
  },
  'Jack Balmer': {
    senior: [
      { years: '1935-1952', team: 'Liverpool', apps: 289, goals: 98 },
    ],
    intl: [
      { years: '1939', team: 'England', apps: 1, goals: 1 },
    ],
  },
  'Donald MacKinlay': {
    senior: [
      { years: '1910-1929', team: 'Liverpool', apps: 393, goals: 34 },
    ],
    intl: [
      { years: '1922', team: 'Scotland', apps: 2, goals: 0 },
    ],
  },
  'Peter Beardsley': {
    senior: [
      { years: '1979-1982', team: 'Carlisle United', apps: 104, goals: 22 },
      { years: '1983-1987', team: 'Newcastle United', apps: 147, goals: 61 },
      { years: '1987-1991', team: 'Liverpool', apps: 131, goals: 46 },
      { years: '1991-1993', team: 'Everton', apps: 81, goals: 25 },
      { years: '1993-1997', team: 'Newcastle United', apps: 129, goals: 47 },
      { years: '1997-1998', team: 'Bolton Wanderers', apps: 17, goals: 2 },
    ],
    intl: [
      { years: '1986-1996', team: 'England', apps: 59, goals: 9 },
    ],
  },
  'Xabi Alonso': {
    senior: [
      { years: '1999-2004', team: 'Real Sociedad', apps: 114, goals: 9 },
      { years: '2000-2001', team: 'Eibar (loan)', apps: 14, goals: 0, loan: true },
      { years: '2004-2009', team: 'Liverpool', apps: 143, goals: 15 },
      { years: '2009-2014', team: 'Real Madrid', apps: 158, goals: 4 },
      { years: '2014-2017', team: 'Bayern Munich', apps: 79, goals: 5 },
    ],
    intl: [
      { years: '2003-2014', team: 'Spain', apps: 114, goals: 16 },
    ],
  },
  'Divock Origi': {
    senior: [
      { years: '2012-2014', team: 'Lille', apps: 40, goals: 6 },
      { years: '2014-2022', team: 'Liverpool', apps: 107, goals: 22 },
      { years: '2014-2015', team: 'Lille (loan)', apps: 33, goals: 8, loan: true },
      { years: '2017-2018', team: 'VfL Wolfsburg (loan)', apps: 31, goals: 6, loan: true },
      { years: '2022-2025', team: 'AC Milan', apps: 27, goals: 2 },
      { years: '2023-2024', team: 'Nottingham Forest (loan)', apps: 20, goals: 0, loan: true },
    ],
    intl: [
      { years: '2014-2022', team: 'Belgium', apps: 32, goals: 3 },
    ],
  },
  'Jamie Redknapp': {
    senior: [
      { years: '1990-1991', team: 'AFC Bournemouth', apps: 13, goals: 0 },
      { years: '1991-2002', team: 'Liverpool', apps: 237, goals: 30 },
      { years: '2002-2005', team: 'Tottenham Hotspur', apps: 48, goals: 4 },
      { years: '2005', team: 'Southampton', apps: 16, goals: 0 },
    ],
    intl: [
      { years: '1995-1999', team: 'England', apps: 17, goals: 1 },
    ],
  },
  'Diogo Jota': {
    senior: [
      { years: '2014-2016', team: 'Paços de Ferreira', apps: 41, goals: 14 },
      { years: '2016-2017', team: 'Porto (loan)', apps: 27, goals: 8, loan: true },
      { years: '2017-2018', team: 'Wolverhampton Wanderers (loan)', apps: 44, goals: 17, loan: true },
      { years: '2018-2020', team: 'Wolverhampton Wanderers', apps: 67, goals: 16 },
      { years: '2020-2025', team: 'Liverpool', apps: 123, goals: 47 },
    ],
    intl: [
      { years: '2019-2025', team: 'Portugal', apps: 49, goals: 14 },
    ],
  },
  'Bob Paisley': {
    senior: [
      { years: '1939-1954', team: 'Liverpool', apps: 253, goals: 10 },
    ],
    intl: [],
  },
  'Sammy Lee': {
    senior: [
      { years: '1976-1986', team: 'Liverpool', apps: 197, goals: 13 },
      { years: '1986-1987', team: 'Queens Park Rangers', apps: 30, goals: 0 },
      { years: '1987-1990', team: 'Osasuna', apps: 28, goals: 0 },
    ],
    intl: [
      { years: '1982-1984', team: 'England', apps: 14, goals: 2 },
    ],
  },
  'Ephraim Longworth': {
    senior: [
      { years: '1910-1928', team: 'Liverpool', apps: 371, goals: 0 },
    ],
    intl: [
      { years: '1920-1923', team: 'England', apps: 5, goals: 0 },
    ],
  },
  'Craig Johnston': {
    senior: [
      { years: '1977-1981', team: 'Middlesbrough', apps: 64, goals: 16 },
      { years: '1981-1988', team: 'Liverpool', apps: 190, goals: 30 },
    ],
    intl: [],
  },
  'Peter Thompson': {
    senior: [
      { years: '1960-1963', team: 'Preston North End', apps: 121, goals: 20 },
      { years: '1963-1973', team: 'Liverpool', apps: 323, goals: 42 },
      { years: '1973-1978', team: 'Bolton Wanderers', apps: 117, goals: 2 },
    ],
    intl: [
      { years: '1964-1970', team: 'England', apps: 16, goals: 0 },
    ],
  },
  'John Arne Riise': {
    senior: [
      { years: '1996-1998', team: 'Aalesund', apps: 26, goals: 5 },
      { years: '1998-2001', team: 'Monaco', apps: 44, goals: 4 },
      { years: '2001-2008', team: 'Liverpool', apps: 234, goals: 21 },
      { years: '2008-2011', team: 'Roma', apps: 99, goals: 7 },
      { years: '2011-2014', team: 'Fulham', apps: 87, goals: 0 },
      { years: '2014-2015', team: 'APOEL', apps: 25, goals: 4 },
    ],
    intl: [
      { years: '2000-2013', team: 'Norway', apps: 110, goals: 16 },
    ],
  },
  'Pepe Reina': {
    senior: [
      { years: '2000-2002', team: 'Barcelona', apps: 30, goals: 0 },
      { years: '2002-2005', team: 'Villarreal', apps: 109, goals: 0 },
      { years: '2005-2013', team: 'Liverpool', apps: 285, goals: 0 },
      { years: '2013-2018', team: 'Napoli', apps: 141, goals: 0 },
      { years: '2020-2022', team: 'Lazio', apps: 44, goals: 0 },
      { years: '2022-2024', team: 'Villarreal', apps: 24, goals: 0 },
      { years: '2024-2025', team: 'Como', apps: 12, goals: 0 },
    ],
    intl: [
      { years: '2005-2017', team: 'Spain', apps: 36, goals: 0 },
    ],
  },
  'John Aldridge': {
    senior: [
      { years: '1979-1984', team: 'Newport County', apps: 170, goals: 69 },
      { years: '1984-1987', team: 'Oxford United', apps: 114, goals: 72 },
      { years: '1987-1989', team: 'Liverpool', apps: 83, goals: 50 },
      { years: '1989-1991', team: 'Real Sociedad', apps: 63, goals: 33 },
      { years: '1991-1998', team: 'Tranmere Rovers', apps: 243, goals: 138 },
    ],
    intl: [
      { years: '1986-1996', team: 'Republic of Ireland', apps: 69, goals: 19 },
    ],
  },
  'David Fairclough': {
    senior: [
      { years: '1975-1983', team: 'Liverpool', apps: 98, goals: 34 },
      { years: '1982', team: 'Toronto Blizzard', apps: 20, goals: 4 },
      { years: '1983-1985', team: 'Luzern', apps: 40, goals: 8 },
      { years: '1986-1989', team: 'Beveren', apps: 70, goals: 14 },
    ],
    intl: [],
  },
  'Fabinho': {
    senior: [
      { years: '2013-2015', team: 'Monaco (loan)', apps: 62, goals: 1, loan: true },
      { years: '2015-2018', team: 'Monaco', apps: 105, goals: 22 },
      { years: '2018-2023', team: 'Liverpool', apps: 151, goals: 8 },
      { years: '2023-', team: 'Al-Ittihad', apps: 81, goals: 4 },
    ],
    intl: [
      { years: '2015-', team: 'Brazil', apps: 36, goals: 0 },
    ],
  },
  'Georginio Wijnaldum': {
    senior: [
      { years: '2007-2011', team: 'Feyenoord', apps: 111, goals: 23 },
      { years: '2011-2015', team: 'PSV Eindhoven', apps: 109, goals: 40 },
      { years: '2015-2016', team: 'Newcastle United', apps: 38, goals: 11 },
      { years: '2016-2021', team: 'Liverpool', apps: 179, goals: 16 },
      { years: '2021-2023', team: 'Paris Saint-Germain', apps: 31, goals: 1 },
      { years: '2022-2023', team: 'Roma (loan)', apps: 14, goals: 2, loan: true },
      { years: '2023-', team: 'Al-Ettifaq', apps: 96, goals: 36 },
    ],
    intl: [
      { years: '2011-2024', team: 'Netherlands', apps: 96, goals: 28 },
    ],
  },
  'Albert Stubbins': {
    senior: [
      { years: '1937-1946', team: 'Newcastle United', apps: 27, goals: 5 },
      { years: '1946-1953', team: 'Liverpool', apps: 159, goals: 75 },
    ],
    intl: [
      { years: '1945', team: 'England', apps: 1, goals: 0 },
    ],
  },
  'Emile Heskey': {
    senior: [
      { years: '1994-2000', team: 'Leicester City', apps: 154, goals: 40 },
      { years: '2000-2004', team: 'Liverpool', apps: 150, goals: 39 },
      { years: '2004-2006', team: 'Birmingham City', apps: 68, goals: 14 },
      { years: '2006-2009', team: 'Wigan Athletic', apps: 82, goals: 15 },
      { years: '2009-2012', team: 'Aston Villa', apps: 92, goals: 9 },
      { years: '2012-2014', team: 'Newcastle Jets', apps: 42, goals: 10 },
      { years: '2014-2016', team: 'Bolton Wanderers', apps: 45, goals: 3 },
    ],
    intl: [
      { years: '1999-2010', team: 'England', apps: 62, goals: 7 },
    ],
  },
  'Joel Matip': {
    senior: [
      { years: '2009-2016', team: 'Schalke 04', apps: 194, goals: 17 },
      { years: '2016-2024', team: 'Liverpool', apps: 150, goals: 9 },
    ],
    intl: [
      { years: '2010-2015', team: 'Cameroon', apps: 27, goals: 1 },
    ],
  },
  'Tom Bromilow': {
    senior: [
      { years: '1919-1930', team: 'Liverpool', apps: 341, goals: 11 },
    ],
    intl: [
      { years: '1921-1925', team: 'England', apps: 5, goals: 0 },
    ],
  },
  'Dietmar Hamann': {
    senior: [
      { years: '1993-1998', team: 'Bayern Munich', apps: 105, goals: 6 },
      { years: '1998-1999', team: 'Newcastle United', apps: 23, goals: 4 },
      { years: '1999-2006', team: 'Liverpool', apps: 191, goals: 8 },
      { years: '2006-2009', team: 'Manchester City', apps: 54, goals: 1 },
    ],
    intl: [
      { years: '1997-2005', team: 'Germany', apps: 59, goals: 5 },
    ],
  },
  "Alan A'Court": {
    senior: [
      { years: '1952-1964', team: 'Liverpool', apps: 354, goals: 61 },
      { years: '1964-1966', team: 'Tranmere Rovers', apps: 50, goals: 11 },
    ],
    intl: [
      { years: '1957-1958', team: 'England', apps: 5, goals: 1 },
    ],
  },
  'Luis Díaz': {
    senior: [
      { years: '2016-2017', team: 'Barranquilla', apps: 34, goals: 3 },
      { years: '2017-2019', team: 'Atlético Junior', apps: 67, goals: 15 },
      { years: '2019-2022', team: 'Porto', apps: 77, goals: 26 },
      { years: '2022-2025', team: 'Liverpool', apps: 103, goals: 29 },
      { years: '2025-', team: 'Bayern Munich', apps: 32, goals: 15 },
    ],
    intl: [
      { years: '2018-', team: 'Colombia', apps: 78, goals: 23 },
    ],
  },
  'Ronnie Moran': {
    senior: [
      { years: '1952-1968', team: 'Liverpool', apps: 343, goals: 16 },
    ],
    intl: [],
  },
  'Daniel Sturridge': {
    senior: [
      { years: '2006-2009', team: 'Manchester City', apps: 21, goals: 5 },
      { years: '2009-2013', team: 'Chelsea', apps: 63, goals: 13 },
      { years: '2011', team: 'Bolton Wanderers (loan)', apps: 12, goals: 8, loan: true },
      { years: '2013-2019', team: 'Liverpool', apps: 116, goals: 50 },
      { years: '2018', team: 'West Bromwich Albion (loan)', apps: 6, goals: 0, loan: true },
      { years: '2019-2020', team: 'Trabzonspor', apps: 11, goals: 4 },
    ],
    intl: [
      { years: '2011-2017', team: 'England', apps: 26, goals: 8 },
    ],
  },
  'Ray Houghton': {
    senior: [
      { years: '1982-1985', team: 'Fulham', apps: 129, goals: 16 },
      { years: '1985-1987', team: 'Oxford United', apps: 83, goals: 10 },
      { years: '1987-1992', team: 'Liverpool', apps: 153, goals: 28 },
      { years: '1992-1995', team: 'Aston Villa', apps: 95, goals: 6 },
      { years: '1995-1997', team: 'Crystal Palace', apps: 73, goals: 7 },
      { years: '1997-1999', team: 'Reading', apps: 43, goals: 1 },
    ],
    intl: [
      { years: '1986-1997', team: 'Republic of Ireland', apps: 73, goals: 6 },
    ],
  },
  'Dirk Kuyt': {
    senior: [
      { years: '1998-2003', team: 'Utrecht', apps: 160, goals: 51 },
      { years: '2003-2006', team: 'Feyenoord', apps: 101, goals: 71 },
      { years: '2006-2012', team: 'Liverpool', apps: 208, goals: 51 },
      { years: '2012-2015', team: 'Fenerbahçe', apps: 95, goals: 26 },
      { years: '2015-2017', team: 'Feyenoord', apps: 63, goals: 31 },
    ],
    intl: [
      { years: '2004-2014', team: 'Netherlands', apps: 104, goals: 24 },
    ],
  },
  'Matt Busby': {
    senior: [
      { years: '1928-1936', team: 'Manchester City', apps: 204, goals: 11 },
      { years: '1936-1945', team: 'Liverpool', apps: 115, goals: 3 },
    ],
    intl: [
      { years: '1933', team: 'Scotland', apps: 1, goals: 0 },
    ],
  },
  'Vladimír Šmicer': {
    senior: [
      { years: '1992-1996', team: 'Slavia Prague', apps: 81, goals: 26 },
      { years: '1996-1999', team: 'Lens', apps: 91, goals: 16 },
      { years: '1999-2005', team: 'Liverpool', apps: 121, goals: 10 },
      { years: '2005-2007', team: 'Bordeaux', apps: 28, goals: 3 },
      { years: '2007-2009', team: 'Slavia Prague', apps: 23, goals: 5 },
    ],
    intl: [
      { years: '1994-2006', team: 'Czech Republic', apps: 80, goals: 27 },
    ],
  },
  'Gerry Byrne': {
    senior: [
      { years: '1957-1969', team: 'Liverpool', apps: 274, goals: 2 },
    ],
    intl: [
      { years: '1963-1966', team: 'England', apps: 2, goals: 0 },
    ],
  },
  'Tommy Lawrence': {
    senior: [
      { years: '1957-1971', team: 'Liverpool', apps: 306, goals: 0 },
      { years: '1971-1974', team: 'Tranmere Rovers', apps: 80, goals: 0 },
    ],
    intl: [
      { years: '1963-1969', team: 'Scotland', apps: 3, goals: 0 },
    ],
  },
  'Phil Taylor': {
    senior: [
      { years: '1935-1936', team: 'Bristol Rovers', apps: 21, goals: 2 },
      { years: '1936-1954', team: 'Liverpool', apps: 312, goals: 32 },
    ],
    intl: [
      { years: '1947', team: 'England', apps: 3, goals: 0 },
    ],
  },
  'Jerzy Dudek': {
    senior: [
      { years: '1996-2001', team: 'Feyenoord', apps: 139, goals: 0 },
      { years: '2001-2007', team: 'Liverpool', apps: 127, goals: 0 },
      { years: '2007-2011', team: 'Real Madrid', apps: 2, goals: 0 },
    ],
    intl: [
      { years: '1998-2013', team: 'Poland', apps: 60, goals: 0 },
    ],
  },
  'Philippe Coutinho': {
    senior: [
      { years: '2008-2013', team: 'Inter Milan', apps: 28, goals: 3 },
      { years: '2008-2010', team: 'Vasco da Gama (loan)', apps: 36, goals: 4, loan: true },
      { years: '2012', team: 'Espanyol (loan)', apps: 16, goals: 5, loan: true },
      { years: '2013-2018', team: 'Liverpool', apps: 152, goals: 41 },
      { years: '2018-2022', team: 'Barcelona', apps: 76, goals: 17 },
      { years: '2019-2020', team: 'Bayern Munich (loan)', apps: 23, goals: 8, loan: true },
      { years: '2022-2025', team: 'Aston Villa', apps: 22, goals: 1 },
    ],
    intl: [
      { years: '2010-2022', team: 'Brazil', apps: 68, goals: 21 },
    ],
  },
  'Sam Raybould': {
    senior: [
      { years: '1899-1907', team: 'Liverpool', apps: 211, goals: 120 },
      { years: '1907-1908', team: 'Sunderland', apps: 27, goals: 12 },
      { years: '1908-1909', team: 'Arsenal', apps: 26, goals: 6 },
    ],
    intl: [],
  },
  'David Johnson': {
    senior: [
      { years: '1969-1972', team: 'Everton', apps: 49, goals: 11 },
      { years: '1972-1976', team: 'Ipswich Town', apps: 136, goals: 35 },
      { years: '1976-1982', team: 'Liverpool', apps: 148, goals: 55 },
      { years: '1982-1984', team: 'Everton', apps: 40, goals: 4 },
      { years: '1984-1985', team: 'Preston North End', apps: 24, goals: 3 },
    ],
    intl: [
      { years: '1975-1980', team: 'England', apps: 8, goals: 5 },
    ],
  },
  'Dick Forshaw': {
    senior: [
      { years: '1919-1927', team: 'Liverpool', apps: 266, goals: 117 },
      { years: '1927-1929', team: 'Everton', apps: 42, goals: 8 },
    ],
    intl: [],
  },
  'Lucas Leiva': {
    senior: [
      { years: '2005-2007', team: 'Grêmio', apps: 66, goals: 9 },
      { years: '2007-2017', team: 'Liverpool', apps: 247, goals: 1 },
      { years: '2017-2022', team: 'Lazio', apps: 155, goals: 2 },
      { years: '2022-2023', team: 'Grêmio', apps: 18, goals: 3 },
    ],
    intl: [
      { years: '2007-2013', team: 'Brazil', apps: 24, goals: 0 },
    ],
  },
  'Adam Lallana': {
    senior: [
      { years: '2006-2014', team: 'Southampton', apps: 235, goals: 48 },
      { years: '2014-2020', team: 'Liverpool', apps: 128, goals: 18 },
      { years: '2020-2024', team: 'Brighton & Hove Albion', apps: 95, goals: 3 },
      { years: '2024-2025', team: 'Southampton', apps: 14, goals: 0 },
    ],
    intl: [
      { years: '2013-2018', team: 'England', apps: 34, goals: 3 },
    ],
  },
  'Bobby Robinson': {
    senior: [
      { years: '1897-1898', team: 'Blackpool', apps: 17, goals: 12 },
      { years: '1898-1909', team: 'Liverpool', apps: 327, goals: 72 },
      { years: '1909-1912', team: 'Blackpool', apps: 68, goals: 6 },
    ],
    intl: [
      { years: '1901-1903', team: 'England', apps: 3, goals: 0 },
    ],
  },
  'Jack Cox': {
    senior: [
      { years: '1897-1898', team: 'Blackpool', apps: 17, goals: 12 },
      { years: '1898-1909', team: 'Liverpool', apps: 361, goals: 81 },
    ],
    intl: [
      { years: '1901-1903', team: 'England', apps: 3, goals: 0 },
    ],
  },
  'Luis García': {
    senior: [
      { years: '1997-2002', team: 'Barcelona B', apps: 73, goals: 25 },
      { years: '2002-2003', team: 'Atlético Madrid', apps: 30, goals: 9 },
      { years: '2003-2004', team: 'Barcelona', apps: 25, goals: 4 },
      { years: '2004-2007', team: 'Liverpool', apps: 77, goals: 18 },
      { years: '2007-2009', team: 'Atlético Madrid', apps: 49, goals: 2 },
      { years: '2009-2010', team: 'Racing Santander', apps: 15, goals: 0 },
      { years: '2010-2011', team: 'Panathinaikos', apps: 18, goals: 2 },
    ],
    intl: [
      { years: '2005-2006', team: 'Spain', apps: 18, goals: 4 },
    ],
  },
  'Jack Parkinson': {
    senior: [
      { years: '1903-1914', team: 'Liverpool', apps: 199, goals: 123 },
      { years: '1914-1915', team: 'Bury', apps: 4, goals: 3 },
    ],
    intl: [
      { years: '1910', team: 'England', apps: 2, goals: 0 },
    ],
  },
  'Danny Murphy': {
    senior: [
      { years: '1993-1997', team: 'Crewe Alexandra', apps: 134, goals: 27 },
      { years: '1997-2004', team: 'Liverpool', apps: 170, goals: 25 },
      { years: '2004-2006', team: 'Charlton Athletic', apps: 56, goals: 7 },
      { years: '2006-2007', team: 'Tottenham Hotspur', apps: 22, goals: 1 },
      { years: '2007-2012', team: 'Fulham', apps: 169, goals: 17 },
      { years: '2012-2013', team: 'Blackburn Rovers', apps: 33, goals: 1 },
    ],
    intl: [
      { years: '2001-2003', team: 'England', apps: 9, goals: 1 },
    ],
  },
  'Giorgi Mamardashvili': {
    senior: [
      { years: '2019', team: 'Rustavi (loan)', apps: 28, goals: 0, loan: true },
      { years: '2020-2021', team: 'Locomotive Tbilisi (loan)', apps: 29, goals: 0, loan: true },
      { years: '2021-2025', team: 'Valencia', apps: 127, goals: 0 },
      { years: '2025-', team: 'Liverpool', apps: 10, goals: 0 },
    ],
    intl: [
      { years: '2019-2023', team: 'Georgia U21', apps: 7, goals: 0 },
      { years: '2021-', team: 'Georgia', apps: 38, goals: 0 },
    ],
  },
  'Freddie Woodman': {
    senior: [
      { years: '2014-2022', team: 'Newcastle United', apps: 4, goals: 0 },
      { years: '2015', team: 'Crawley Town (loan)', apps: 11, goals: 0, loan: true },
      { years: '2017', team: 'Kilmarnock (loan)', apps: 14, goals: 0, loan: true },
      { years: '2018', team: 'Aberdeen (loan)', apps: 5, goals: 0, loan: true },
      { years: '2019-2021', team: 'Swansea City (loan)', apps: 88, goals: 0, loan: true },
      { years: '2022-2025', team: 'Preston North End', apps: 127, goals: 0 },
      { years: '2025-', team: 'Liverpool', apps: 3, goals: 0 },
    ],
    intl: [
      { years: '2016-2018', team: 'England U21', apps: 6, goals: 0 },
    ],
  },
  'Ármin Pécsi': {
    senior: [
      { years: '2022-2025', team: 'Puskás Akadémia', apps: 46, goals: 0 },
      { years: '2022-2023', team: 'Csákvár', apps: 18, goals: 0 },
      { years: '2025-', team: 'Liverpool', apps: 0, goals: 0 },
    ],
    intl: [
      { years: '2024-', team: 'Hungary U21', apps: 9, goals: 0 },
      { years: '2026-', team: 'Hungary', apps: 1, goals: 0 },
    ],
  },
  'Ibrahima Konaté': {
    senior: [
      { years: '2017', team: 'Sochaux', apps: 12, goals: 1 },
      { years: '2017-2021', team: 'RB Leipzig', apps: 66, goals: 2 },
      { years: '2021-2026', team: 'Liverpool', apps: 118, goals: 2 },
      { years: '2026-', team: 'Real Madrid', apps: 0, goals: 0 },
    ],
    intl: [
      { years: '2019-2021', team: 'France U21', apps: 13, goals: 0 },
      { years: '2022-', team: 'France', apps: 29, goals: 0 },
    ],
  },
  'Milos Kerkez': {
    senior: [
      { years: '2020-2021', team: 'Győr', apps: 16, goals: 0 },
      { years: '2022-2023', team: 'AZ', apps: 33, goals: 3 },
      { years: '2023-2025', team: 'Bournemouth', apps: 66, goals: 2 },
      { years: '2025-', team: 'Liverpool', apps: 34, goals: 2 },
    ],
    intl: [
      { years: '2021-2022', team: 'Hungary U21', apps: 8, goals: 0 },
      { years: '2022-', team: 'Hungary', apps: 32, goals: 0 },
    ],
  },
  'Conor Bradley': {
    senior: [
      { years: '2021-', team: 'Liverpool', apps: 45, goals: 1 },
      { years: '2022-2023', team: 'Bolton Wanderers (loan)', apps: 41, goals: 5, loan: true },
    ],
    intl: [
      { years: '2021-', team: 'Northern Ireland', apps: 30, goals: 4 },
    ],
  },
  'Giovanni Leoni': {
    senior: [
      { years: '2023-2024', team: 'Padova', apps: 1, goals: 0 },
      { years: '2024', team: 'Sampdoria (loan)', apps: 12, goals: 1, loan: true },
      { years: '2024-2025', team: 'Parma', apps: 17, goals: 1 },
      { years: '2025-', team: 'Liverpool', apps: 0, goals: 0 },
    ],
    intl: [
      { years: '2024-', team: 'Italy U19', apps: 7, goals: 0 },
    ],
  },
  'Jeremie Frimpong': {
    senior: [
      { years: '2019-2021', team: 'Celtic', apps: 36, goals: 3 },
      { years: '2021-2025', team: 'Bayer Leverkusen', apps: 133, goals: 23 },
      { years: '2025-', team: 'Liverpool', apps: 21, goals: 0 },
    ],
    intl: [
      { years: '2021-2022', team: 'Netherlands U21', apps: 6, goals: 7 },
      { years: '2023-', team: 'Netherlands', apps: 15, goals: 1 },
    ],
  },
  'Wataru Endo': {
    senior: [
      { years: '2010-2015', team: 'Shonan Bellmare', apps: 158, goals: 23 },
      { years: '2016-2018', team: 'Urawa Red Diamonds', apps: 75, goals: 5 },
      { years: '2018-2020', team: 'Sint-Truiden', apps: 29, goals: 2 },
      { years: '2019-2020', team: 'VfB Stuttgart (loan)', apps: 21, goals: 1, loan: true },
      { years: '2020-2023', team: 'VfB Stuttgart', apps: 99, goals: 12 },
      { years: '2023-', team: 'Liverpool', apps: 57, goals: 1 },
    ],
    intl: [
      { years: '2015-', team: 'Japan', apps: 73, goals: 4 },
    ],
  },
  'Florian Wirtz': {
    senior: [
      { years: '2020-2025', team: 'Bayer Leverkusen', apps: 140, goals: 35 },
      { years: '2025-', team: 'Liverpool', apps: 33, goals: 5 },
    ],
    intl: [
      { years: '2020-2021', team: 'Germany U21', apps: 6, goals: 2 },
      { years: '2021-', team: 'Germany', apps: 45, goals: 11 },
    ],
  },
  'Ryan Gravenberch': {
    senior: [
      { years: '2018-2022', team: 'Ajax', apps: 72, goals: 7 },
      { years: '2022-2023', team: 'Bayern Munich', apps: 25, goals: 0 },
      { years: '2023-', team: 'Liverpool', apps: 99, goals: 6 },
    ],
    intl: [
      { years: '2020-2023', team: 'Netherlands U21', apps: 11, goals: 1 },
      { years: '2021-', team: 'Netherlands', apps: 31, goals: 1 },
    ],
  },
  'Trey Nyoni': {
    senior: [
      { years: '2023-', team: 'Liverpool', apps: 6, goals: 0 },
    ],
    intl: [
      { years: '2024-', team: 'England U19', apps: 13, goals: 1 },
    ],
  },
  'Alexander Isak': {
    senior: [
      { years: '2016-2017', team: 'AIK', apps: 24, goals: 10 },
      { years: '2017-2019', team: 'Borussia Dortmund', apps: 5, goals: 0 },
      { years: '2019', team: 'Willem II (loan)', apps: 16, goals: 13, loan: true },
      { years: '2019-2022', team: 'Real Sociedad', apps: 105, goals: 33 },
      { years: '2022-2025', team: 'Newcastle United', apps: 86, goals: 54 },
      { years: '2025-', team: 'Liverpool', apps: 14, goals: 3 },
    ],
    intl: [
      { years: '2017-', team: 'Sweden', apps: 62, goals: 18 },
    ],
  },
  'Federico Chiesa': {
    senior: [
      { years: '2016-2022', team: 'Fiorentina', apps: 137, goals: 26 },
      { years: '2020-2022', team: 'Juventus (loan)', apps: 44, goals: 10, loan: true },
      { years: '2022-2024', team: 'Juventus', apps: 54, goals: 11 },
      { years: '2024-', team: 'Liverpool', apps: 32, goals: 2 },
    ],
    intl: [
      { years: '2018-', team: 'Italy', apps: 51, goals: 7 },
    ],
  },
  'Cody Gakpo': {
    senior: [
      { years: '2018-2023', team: 'PSV Eindhoven', apps: 106, goals: 36 },
      { years: '2023-', team: 'Liverpool', apps: 127, goals: 32 },
    ],
    intl: [
      { years: '2019-2021', team: 'Netherlands U21', apps: 13, goals: 7 },
      { years: '2021-', team: 'Netherlands', apps: 54, goals: 24 },
    ],
  },
  'Hugo Ekitike': {
    senior: [
      { years: '2020-2023', team: 'Reims', apps: 26, goals: 10 },
      { years: '2021', team: 'Vejle Boldklub (loan)', apps: 11, goals: 3, loan: true },
      { years: '2022-2023', team: 'Paris Saint-Germain (loan)', apps: 25, goals: 3, loan: true },
      { years: '2023-2024', team: 'Paris Saint-Germain', apps: 1, goals: 0 },
      { years: '2024', team: 'Eintracht Frankfurt (loan)', apps: 14, goals: 4, loan: true },
      { years: '2024-2025', team: 'Eintracht Frankfurt', apps: 33, goals: 15 },
      { years: '2025-', team: 'Liverpool', apps: 28, goals: 11 },
    ],
    intl: [
      { years: '2025-', team: 'France', apps: 8, goals: 2 },
    ],
  },
  'Rio Ngumoha': {
    senior: [
      { years: '2024-', team: 'Liverpool', apps: 19, goals: 2 },
    ],
    intl: [
      { years: '2025-', team: 'England U19', apps: 11, goals: 1 },
      { years: '2026-', team: 'England', apps: 1, goals: 0 },
    ],
  },
};

export type CLFinal = { y: string; r: string; city: string; mgr: string };

export const clFinals: CLFinal[] = [
  { y: '1977', r: '3-1 v Borussia Mönchengladbach', city: 'Rome', mgr: 'Bob Paisley' },
  { y: '1978', r: '1-0 v Club Brugge', city: 'London', mgr: 'Bob Paisley' },
  { y: '1981', r: '1-0 v Real Madrid', city: 'Paris', mgr: 'Bob Paisley' },
  { y: '1984', r: '1-1 (4-2 pens) v Roma', city: 'Rome', mgr: 'Joe Fagan' },
  { y: '2005', r: '3-3 (3-2 pens) v AC Milan', city: 'Istanbul', mgr: 'Rafa Benítez' },
  { y: '2019', r: '2-0 v Tottenham Hotspur', city: 'Madrid', mgr: 'Jürgen Klopp' },
];

export type Legend = { n: string; d: string };

export const legends: Legend[] = [
  { n: 'Steven Gerrard', d: 'One-club captain, 710 games. Dragged the team to the Miracle of Istanbul in 2005.' },
  { n: 'Kenny Dalglish', d: "'King Kenny' - legendary No. 7, then title-winning manager. The club's greatest icon to many." },
  { n: 'Ian Rush', d: 'Record goalscorer with 346. The deadliest finisher of the dynasty years.' },
  { n: 'Mohamed Salah', d: '2nd all-time scorer (257). The 2017-26 talisman who fired the 2020 & 2025 titles.' },
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
  { p: 'Mohamed Salah', pos: 'RW', mv: 'Departed (MLS linked)', fee: '-', type: 'out', when: 'Left end of season' },
  { p: 'Ibrahima Konaté', pos: 'CB', mv: 'Real Madrid', fee: 'Free', type: 'out', when: 'Closing on move' },
  { p: 'Andy Robertson', pos: 'LB', mv: 'Exit expected', fee: '-', type: 'out', when: 'Leaving in rebuild' },
  { p: 'Bradley Barcola', pos: 'W', mv: 'PSG', fee: '~€80m+', type: 'rumor', when: 'Shortlisted · Arsenal rivalling' },
  { p: 'Yan Diomande', pos: 'RW', mv: 'Signed for PSG (from RB Leipzig)', fee: '~€100m', type: 'miss', when: 'Liverpool missed out' },
  { p: 'Eduardo Camavinga', pos: 'CM', mv: 'Real Madrid', fee: 'TBD', type: 'rumor', when: 'Midfield target · contact made' },
  { p: 'Ayyoub Bouaddi', pos: 'CM', mv: 'Lille', fee: 'TBD', type: 'rumor', when: 'Young midfield option' },
];

export type Trophy = { n: string; t: string; sub: string; desc: string };

export const trophies: Trophy[] = [
  {
    n: '20', t: 'League Titles', sub: 'Joint English record · last in 2024-25',
    desc: "England's top-flight championship: 18 First Division titles (1901-1990) plus 2 Premier League titles (2020, 2025) since the top division was rebranded in 1992.",
  },
  {
    n: '6', t: 'European Cups', sub: "English record · '77 '78 '81 '84 '05 '19",
    desc: "Europe's top club competition, running since 1955 and renamed the UEFA Champions League in 1992. All 6 Liverpool wins came under this one trophy, old name and new.",
  },
  {
    n: '8', t: 'FA Cups', sub: 'Last in 2022',
    desc: "The world's oldest football competition, first contested in 1871. A single-elimination knockout open to clubs across every level of the English game.",
  },
  {
    n: '10', t: 'League Cups', sub: 'English record · last in 2024',
    desc: "England's secondary knockout cup, founded in 1960. Has carried various sponsor names over the years, including the Milk Cup, Coca-Cola Cup, Carling Cup and Carabao Cup.",
  },
  {
    n: '3', t: 'UEFA Cups', sub: "'73 '76 '01 · English record",
    desc: "A separate, second-tier European competition, distinct from the European Cup/Champions League. Ran from 1971 to 2009, when it was renamed the UEFA Europa League.",
  },
  {
    n: '4', t: 'UEFA Super Cups', sub: 'English record',
    desc: "A one-off match each August between the reigning European Cup/Champions League winners and the Cup Winners' Cup, later Europa League, winners.",
  },
  {
    n: '1', t: 'Club World Cup', sub: '2019',
    desc: "FIFA's global club competition, contested by champions from each continent. Liverpool's only title came in 2019, beating Brazil's Flamengo in the final.",
  },
  {
    n: '16', t: 'Community Shields', sub: 'Shared & outright',
    desc: 'The traditional curtain-raiser to the English season, between the reigning league champions and FA Cup holders. Known as the Charity Shield until it was renamed in 2002.',
  },
];

export type RecordCard = { big: string; title: string; body: string };

export const records: RecordCard[] = [
  { big: '857', title: 'Appearances', body: 'Ian Callaghan (1958-78) - the most by any Liverpool player.' },
  { big: '346', title: 'Goals', body: "Ian Rush - the club's all-time record goalscorer." },
  { big: '257', title: 'Goals', body: 'Mohamed Salah (2017-26) - 2nd all-time, in just 440 games.' },
  { big: '9', title: "Managers' titles", body: "Paisley, Fagan & Dalglish drove the '70s-'80s dynasty." },
];

// League title years - bold the 2020 & 2025 (Premier League era) titles.
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

// ─── Liverpool's Greatest - official 100 (2026 fan + panel vote) ──────────────
// Ranks 14-100 are the officially-revealed positions (source: liverpoolfc.com).
// Ranks 1-13 are NOT yet revealed (top-five/winner reveal in early July 2026):
// the eight names that appeared on every ballot are locked into this tier, and
// the order shown for 1-13 is an editorial prediction, flagged `predicted`.

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
  // ── The official top 100 (voted by ~1.4m fans, revealed July 2026) ──
  { rank: 1, name: 'Steven Gerrard', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '1998-2015', note: 'A one-club talisman across 710 games - a box-to-box driving force with a thunderous long-range shot, and the man who dragged the team to the 2005 Istanbul miracle.' },
  { rank: 2, name: 'Kenny Dalglish', pos: 'FW', posName: 'Forward', nat: 'SCO', era: '1977-1990', note: "'King Kenny' - the club's greatest icon. A genius link-up forward with a low centre of gravity and a feel for the killer pass; won three European Cups, then the 1986 Double as player-manager." },
  { rank: 3, name: 'Ian Rush', pos: 'FW', posName: 'Striker', nat: 'WAL', era: '1980-1996', note: "The club's record goalscorer with 346. A ruthless, relentless-pressing striker whose telepathic link with Dalglish defined the 1980s dynasty." },
  { rank: 4, name: 'Mohamed Salah', pos: 'FW', posName: 'Right winger', nat: 'EGY', era: '2017-2026', note: "The 'Egyptian King' - 2nd all-time scorer with 257 in just 440 games. A cut-inside right winger and penalty machine who fired the 2020 and 2025 titles." },
  { rank: 5, name: 'John Barnes', pos: 'FW', posName: 'Winger', nat: 'ENG', era: '1987-1997', note: 'A mesmeric, gliding winger with electric feet. At his 1987-90 peak the best player in England - two titles plus the 1988 FWA and PFA awards.' },
  { rank: 6, name: 'Graeme Souness', pos: 'MF', posName: 'Midfielder', nat: 'SCO', era: '1978-1984', note: 'The midfield general - snarling aggression, a sumptuous range of passing and ferocious leadership. Captained the side through its early-1980s European dominance.' },
  { rank: 7, name: 'Alan Hansen', pos: 'DF', posName: 'Centre-back', nat: 'SCO', era: '1977-1991', note: 'An elegant, ball-playing centre-half who defended by reading the game rather than by force - the libero of the all-conquering sides, with eight league titles.' },
  { rank: 8, name: 'Virgil van Dijk', pos: 'DF', posName: 'Centre-back', nat: 'NED', era: '2018-', note: 'The captain and defensive cornerstone since 2018 - dominant in the air, serene on the ball and quick across the ground. Arguably the best centre-back of his era.' },
  { rank: 9, name: 'Roger Hunt', pos: 'FW', posName: 'Striker', nat: 'ENG', era: '1959-1969', note: "'Sir Roger' - the club's record league goalscorer and a 1966 World Cup winner. A tireless runner and clinical finisher who powered the Shankly revival." },
  { rank: 10, name: 'Ian Callaghan', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '1960-1978', note: "The club's appearance record-holder with 857 games over 18 years - a tireless, impeccably professional winger-turned-midfielder." },
  { rank: 11, name: 'Billy Liddell', pos: 'FW', posName: 'Winger / forward', nat: 'SCO', era: '1938-1961', note: "'Liddellpool' - the side was half-named after him. A powerful, two-footed winger-forward and devoted one-club man across 22 years." },
  { rank: 12, name: 'Robbie Fowler', pos: 'FW', posName: 'Striker', nat: 'ENG', era: '1993-2007', note: "'God' to the Kop - the most natural finisher the academy has produced, lethal off either foot and famed for lightning-quick goals." },
  { rank: 13, name: 'Ray Clemence', pos: 'GK', posName: 'Goalkeeper', nat: 'ENG', era: '1967-1981', note: 'A commanding sweeper-keeper behind the great back lines - superb positioning and reflexes over more than 650 games, with three European Cups and five titles.' },
  { rank: 14, name: 'Kevin Keegan', pos: 'FW', posName: 'Forward', nat: 'ENG', era: '1971-1977', note: 'A dynamic, all-action forward and the face of the Shankly-to-Paisley era; won the 1977 European Cup, then back-to-back Ballons d’Or after leaving for Hamburg.' },
  { rank: 15, name: 'Luis Suárez', pos: 'FW', posName: 'Striker', nat: 'URU', era: '2011-2014', note: 'A relentless, ingenious and combustible striker. His 31-goal 2013-14 season nearly delivered the title and earned the European Golden Shoe.' },
  { rank: 16, name: 'Alisson Becker', pos: 'GK', posName: 'Goalkeeper', nat: 'BRA', era: '2018-', note: 'A modern sweeper-keeper - elite shot-stopping, command and distribution. Pivotal to the 2019 Champions League and 2020 title; even headed a 95th-minute winner at Newcastle.' },
  { rank: 17, name: 'Emlyn Hughes', pos: 'DF', posName: 'Defender', nat: 'ENG', era: '1967-1979', note: "'Crazy Horse' - a barnstorming, versatile defender and inspirational captain who lifted two European Cups." },
  { rank: 18, name: 'Phil Neal', pos: 'DF', posName: 'Right-back', nat: 'ENG', era: '1974-1985', note: 'The most decorated English footballer of all - four European Cups and a stack of titles. A near ever-present, ice-cool penalty-taking right-back.' },
  { rank: 19, name: 'Sadio Mané', pos: 'FW', posName: 'Winger', nat: 'SEN', era: '2016-2022', note: 'Electric pace, power and big-game goals on the left of Klopp’s front three; CL 2019 and the 2020 title, later twice African Footballer of the Year.' },
  { rank: 20, name: 'Ian St John', pos: 'FW', posName: 'Forward', nat: 'SCO', era: '1961-1971', note: 'A brave, clever centre-forward signed by Shankly to spark the 1960s rise - and the man who headed the winning goal in the 1965 FA Cup final.' },
  { rank: 21, name: 'Phil Thompson', pos: 'DF', posName: 'Centre-back', nat: 'ENG', era: '1971-1985', note: 'A local, no-nonsense centre-back and European Cup-winning captain; later returned as Houllier’s assistant manager.' },
  { rank: 22, name: 'Roberto Firmino', pos: 'FW', posName: 'Forward', nat: 'BRA', era: '2015-2023', note: 'The selfless false-nine who made Klopp’s front three tick - ferocious pressing, sublime link play and a habit of no-look finishes.' },
  { rank: 23, name: 'Jamie Carragher', pos: 'DF', posName: 'Centre-back', nat: 'ENG', era: '1996-2013', note: 'A one-club defender of total commitment across 737 games, reinvented from full-back to centre-half. Now the voice of the club on TV.' },
  { rank: 24, name: 'Michael Owen', pos: 'FW', posName: 'Striker', nat: 'ENG', era: '1996-2004', note: 'A blistering teenage goal-machine and the 2001 Ballon d’Or winner, whose two late goals won that year’s FA Cup final against Arsenal.' },
  { rank: 25, name: 'Jordan Henderson', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '2011-2023', note: 'The driving, vocal captain who lifted the Champions League and a first league title in 30 years - all relentless running and leadership.' },
  { rank: 26, name: 'Andy Robertson', pos: 'DF', posName: 'Left-back', nat: 'SCO', era: '2017-', note: 'A rampaging, set-piece-delivering left-back who redefined the role; half of the most productive full-back pairing in Premier League history.' },
  { rank: 27, name: 'Ron Yeats', pos: 'DF', posName: 'Centre-back', nat: 'SCO', era: '1961-1971', note: "'The Colossus' - the towering centre-half Shankly built his side around, captaining the 1960s title and FA Cup triumphs." },
  { rank: 28, name: 'Trent Alexander-Arnold', pos: 'DF', posName: 'Right-back', nat: 'ENG', era: '2016-2025', note: 'A local right-back turned elite creator - whipped crosses, raking switches and trademark quick free-kicks. Left for Real Madrid in 2025.' },
  { rank: 29, name: 'Sami Hyypiä', pos: 'DF', posName: 'Centre-back', nat: 'FIN', era: '1999-2009', note: 'A calm, commanding centre-half and aerial force; the cornerstone of the 2001 treble side and a long-serving captain.' },
  { rank: 30, name: 'Steve Heighway', pos: 'FW', posName: 'Winger', nat: 'IRL', era: '1970-1981', note: 'A quick, university-educated winger who terrorised full-backs in the ’70s; later the academy director who developed Gerrard, Owen and Carragher.' },
  { rank: 31, name: 'Gordon Hodgson', pos: 'FW', posName: 'Forward', nat: 'RSA', era: '1925-1936', note: 'A prolific inter-war centre-forward with a fierce shot - 241 goals, long the club record.' },
  { rank: 32, name: 'Elisha Scott', pos: 'GK', posName: 'Goalkeeper', nat: 'NIR', era: '1912-1934', note: 'A fearless, agile keeper revered over 22 years; the great rival-friend of Everton’s Dixie Dean and a 1920s title winner.' },
  { rank: 33, name: 'Ronnie Whelan', pos: 'MF', posName: 'Midfielder', nat: 'IRL', era: '1981-1994', note: 'A smart, two-footed Irish midfielder with an eye for important goals; a fixture of the dominant 1980s sides.' },
  { rank: 34, name: 'Terry McDermott', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '1974-1982', note: 'A stylish, late-arriving goalscoring midfielder; in 1980 the first player to win the PFA and FWA awards in the same season.' },
  { rank: 35, name: 'Mark Lawrenson', pos: 'DF', posName: 'Centre-back', nat: 'IRL', era: '1981-1988', note: 'A quick, elegant and versatile defender - the ideal foil to Hansen until injury cut him short.' },
  { rank: 36, name: 'Ray Kennedy', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '1974-1982', note: 'An Arsenal striker reinvented by Paisley into a goalscoring left-sided midfielder - a key man of the European Cup era.' },
  { rank: 37, name: 'Tommy Smith', pos: 'DF', posName: 'Defender', nat: 'ENG', era: '1962-1978', note: "'The Anfield Iron' - Shankly’s hard-as-nails enforcer who, fittingly, headed a goal in the 1977 European Cup final." },
  { rank: 38, name: 'Steve McManaman', pos: 'MF', posName: 'Winger', nat: 'ENG', era: '1990-1999', note: 'A gangly, gliding dribbler who carried the ball at pace from midfield; a creative fans’ favourite of the ’90s.' },
  { rank: 39, name: 'Alan Kennedy', pos: 'DF', posName: 'Left-back', nat: 'ENG', era: '1978-1985', note: 'An attacking left-back who wrote himself into folklore - the winning goal in the 1981 European Cup final and the decisive penalty in 1984.' },
  { rank: 40, name: 'Harry Chambers', pos: 'FW', posName: 'Forward', nat: 'ENG', era: '1915-1928', note: "'Smiler' - a sharp inside-forward and the top scorer of the back-to-back 1922 and 1923 champions." },
  { rank: 41, name: 'Steve Nicol', pos: 'DF', posName: 'Defender', nat: 'SCO', era: '1981-1995', note: 'A supremely versatile defender who filled in almost anywhere; the 1989 FWA Player of the Year.' },
  { rank: 42, name: 'Bruce Grobbelaar', pos: 'GK', posName: 'Goalkeeper', nat: 'ZIM', era: '1981-1994', note: 'A flamboyant, acrobatic and unpredictable keeper whose famous “spaghetti legs” helped win the 1984 European Cup shootout in Rome.' },
  { rank: 43, name: 'Jan Mølby', pos: 'MF', posName: 'Midfielder', nat: 'DEN', era: '1984-1996', note: 'A cultured Dane with a wand of a left foot and a near-perfect penalty record; the deep-lying passer of the 1986 Double side.' },
  { rank: 44, name: 'Fernando Torres', pos: 'FW', posName: 'Striker', nat: 'ESP', era: '2007-2011', note: "'El Niño' - a thrilling, lightning-quick centre-forward with ice-cold finishing, before a British-record sale to Chelsea." },
  { rank: 45, name: 'Chris Lawler', pos: 'DF', posName: 'Right-back', nat: 'ENG', era: '1960-1975', note: "'The Silent Knight' - an attacking full-back with an uncanny knack for goals from defence in the Shankly years." },
  { rank: 46, name: 'Steve McMahon', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '1985-1991', note: 'A combative, driving central midfielder with a fine shot - the snarling engine of the late-’80s title sides.' },
  { rank: 47, name: 'Alex Raisbeck', pos: 'DF', posName: 'Centre-half', nat: 'SCO', era: '1898-1909', note: 'A dashing, dominant centre-half - the first great Liverpool defender and captain of the 1901 and 1906 champions.' },
  { rank: 48, name: 'James Milner', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '2015-2023', note: 'A relentless, ultra-professional utility man - midfield, either full-back, penalties - and a CL and PL winner deep into his 30s.' },
  { rank: 49, name: 'Jimmy Case', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '1975-1981', note: 'A fearsome competitor with one of the hardest shots the club has seen; three European Cups from the right of midfield.' },
  { rank: 50, name: 'John Toshack', pos: 'FW', posName: 'Striker', nat: 'WAL', era: '1970-1978', note: 'A brilliant aerial target man whose telepathic partnership with Keegan tormented defences; later managed Wales and Real Madrid.' },
  { rank: 51, name: 'Jack Balmer', pos: 'FW', posName: 'Forward', nat: 'ENG', era: '1935-1952', note: 'A stylish local forward and captain of the 1947 champions; famously scored hat-tricks in three consecutive games.' },
  { rank: 52, name: 'Donald MacKinlay', pos: 'DF', posName: 'Full-back', nat: 'SCO', era: '1910-1929', note: 'A long-serving, two-footed full-back and the captain of the 1922 and 1923 title-winning sides.' },
  { rank: 53, name: 'Peter Beardsley', pos: 'FW', posName: 'Forward', nat: 'ENG', era: '1987-1991', note: 'An inventive, deep-lying forward whose vision and dribbling lit up the swashbuckling 1988 title side.' },
  { rank: 54, name: 'Xabi Alonso', pos: 'MF', posName: 'Midfielder', nat: 'ESP', era: '2004-2009', note: 'A metronomic deep-lying playmaker with extraordinary range; scored the rebound equaliser in the 2005 Istanbul comeback.' },
  { rank: 55, name: 'Divock Origi', pos: 'FW', posName: 'Striker', nat: 'BEL', era: '2014-2022', note: 'The ultimate cult hero - the 96th-minute derby winner, the quick corner against Barcelona and the clincher in the 2019 final.' },
  { rank: 56, name: 'Jamie Redknapp', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '1991-2002', note: 'A composed, elegant passer and captain of the ’90s whose career was repeatedly disrupted by injury.' },
  { rank: 57, name: 'Diogo Jota', pos: 'FW', posName: 'Forward', nat: 'POR', era: '2020-2025', note: 'A clever, two-footed finisher with razor movement. The club retired his No. 20 across every level after his death in 2025.' },
  { rank: 58, name: 'Bob Paisley', pos: 'DF', posName: 'Wing-half', nat: 'ENG', era: '1939-1954', note: 'A title-winning wing-half and quiet backroom man who became the most decorated British manager - three European Cups in nine years.' },
  { rank: 59, name: 'Sammy Lee', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '1978-1986', note: 'A tenacious, energetic local midfielder of the European Cup era; later a long-serving coach at the club.' },
  { rank: 60, name: 'Ephraim Longworth', pos: 'DF', posName: 'Full-back', nat: 'ENG', era: '1910-1928', note: 'A dependable, sporting full-back and captain across the 1922 and 1923 title wins; the club’s first England captain.' },
  { rank: 61, name: 'Craig Johnston', pos: 'MF', posName: 'Midfielder', nat: 'AUS', era: '1981-1988', note: 'A buccaneering, high-energy midfielder who retired early - and later invented the Adidas Predator boot.' },
  { rank: 62, name: 'Peter Thompson', pos: 'FW', posName: 'Winger', nat: 'ENG', era: '1963-1973', note: 'A dazzling, two-footed winger and one of the most exciting dribblers of the Shankly 1960s.' },
  { rank: 63, name: 'John Arne Riise', pos: 'DF', posName: 'Left-back', nat: 'NOR', era: '2001-2008', note: 'A marauding left-back with a ferociously powerful left foot - a genuine thunderbolt specialist of the 2005 European run.' },
  { rank: 64, name: 'Pepe Reina', pos: 'GK', posName: 'Goalkeeper', nat: 'ESP', era: '2005-2013', note: 'A superb shot-stopper and pioneering ball-playing keeper; won three straight Premier League Golden Gloves.' },
  { rank: 65, name: 'John Aldridge', pos: 'FW', posName: 'Striker', nat: 'IRL', era: '1987-1989', note: 'A clinical, Scouse penalty-box predator who seamlessly replaced Rush and scored on his full debut.' },
  { rank: 66, name: 'Joe Gomez', pos: 'DF', posName: 'Defender', nat: 'ENG', era: '2015-', note: 'A quick, composed and versatile defender - centre-back or right-back - and a long servant since arriving as a teenager.' },
  { rank: 67, name: 'David Fairclough', pos: 'FW', posName: 'Forward', nat: 'ENG', era: '1975-1983', note: "The original 'Supersub' - a pacey forward famous for game-changing goals off the bench, none bigger than against Saint-Étienne in 1977." },
  { rank: 68, name: 'Fabinho', pos: 'MF', posName: 'Defensive mid', nat: 'BRA', era: '2018-2023', note: "'The Lighthouse' - a positionally peerless holding midfielder who shielded the defence through the CL and PL wins." },
  { rank: 69, name: 'Georginio Wijnaldum', pos: 'MF', posName: 'Midfielder', nat: 'NED', era: '2016-2021', note: 'An unflappable big-game midfielder; his two goals off the bench completed the 4-0 Barcelona comeback in 2019.' },
  { rank: 70, name: 'Albert Stubbins', pos: 'FW', posName: 'Forward', nat: 'ENG', era: '1946-1953', note: 'A popular, quick centre-forward of the 1947 champions - and one of the faces on the Beatles’ Sgt. Pepper cover.' },
  { rank: 71, name: 'Emile Heskey', pos: 'FW', posName: 'Forward', nat: 'ENG', era: '2000-2004', note: 'A powerful, selfless forward whose strength and hold-up play were central to the 2001 cup treble.' },
  { rank: 72, name: 'Joel Matip', pos: 'DF', posName: 'Centre-back', nat: 'CMR', era: '2016-2024', note: 'A tall, ball-carrying centre-back who would stride out of defence with it; a CL and PL winner.' },
  { rank: 73, name: 'Tom Bromilow', pos: 'MF', posName: 'Wing-half', nat: 'ENG', era: '1919-1930', note: 'A cultured, intelligent wing-half and the creative hub of the back-to-back 1920s champions.' },
  { rank: 74, name: 'Dietmar Hamann', pos: 'MF', posName: 'Defensive mid', nat: 'GER', era: '1999-2006', note: 'A disciplined holding midfielder whose half-time introduction in Istanbul 2005 turned the final around.' },
  { rank: 75, name: "Alan A'Court", pos: 'FW', posName: 'Winger', nat: 'ENG', era: '1952-1964', note: 'A direct, loyal winger who served through the Second Division years and into the First, and played at the 1958 World Cup.' },
  { rank: 76, name: 'Luis Díaz', pos: 'FW', posName: 'Winger', nat: 'COL', era: '2022-2025', note: 'A direct, fearless and high-pressing winger with flair and end product; sold to Bayern Munich in 2025.' },
  { rank: 77, name: 'Ronnie Moran', pos: 'DF', posName: 'Full-back', nat: 'ENG', era: '1952-1965', note: 'A tough full-back, then a Boot Room cornerstone for decades - the bawling sergeant-major of the dynasty’s coaching staff.' },
  { rank: 78, name: 'Tommy Lawrence', pos: 'GK', posName: 'Goalkeeper', nat: 'SCO', era: '1958-1971', note: "'The Flying Pig' - an early sweeper-keeper who patrolled behind Shankly’s high line in the 1960s." },
  { rank: 79, name: 'Daniel Sturridge', pos: 'FW', posName: 'Striker', nat: 'ENG', era: '2013-2019', note: 'A wonderfully clinical, two-footed striker; the lethal “SAS” partnership with Suárez in 2013-14.' },
  { rank: 80, name: 'Ray Houghton', pos: 'MF', posName: 'Midfielder', nat: 'IRL', era: '1987-1992', note: 'A busy, hard-running wide midfielder of the 1988 and 1990 title-winning sides.' },
  { rank: 81, name: 'Dirk Kuyt', pos: 'FW', posName: 'Forward', nat: 'NED', era: '2006-2012', note: 'A tireless, selfless forward who reinvented himself as a right-sided runner - and scored a derby hat-trick against Everton.' },
  { rank: 82, name: 'Matt Busby', pos: 'MF', posName: 'Wing-half', nat: 'SCO', era: '1936-1939', note: 'A thoughtful wing-half of the late ’30s - far better remembered as the manager who built Manchester United.' },
  { rank: 83, name: 'Vladimír Šmicer', pos: 'MF', posName: 'Midfielder', nat: 'CZE', era: '1999-2005', note: 'A skilful, underrated wide midfielder whose goal lit the 2005 Istanbul comeback - in his final game for the club.' },
  { rank: 84, name: 'Gerry Byrne', pos: 'DF', posName: 'Full-back', nat: 'ENG', era: '1955-1969', note: 'A tough, dependable full-back who played almost all of the 1965 FA Cup final win with a broken collarbone.' },
  { rank: 85, name: 'Phil Taylor', pos: 'MF', posName: 'Wing-half', nat: 'ENG', era: '1936-1954', note: 'An elegant wing-half and captain of the late ’40s; later the manager immediately before Shankly.' },
  { rank: 86, name: 'Jerzy Dudek', pos: 'GK', posName: 'Goalkeeper', nat: 'POL', era: '2001-2007', note: 'The hero of Istanbul - the late double-save on Shevchenko and the “spaghetti legs” that won the 2005 shootout.' },
  { rank: 87, name: 'Philippe Coutinho', pos: 'MF', posName: 'Attacking mid', nat: 'BRA', era: '2013-2018', note: "'The Little Magician' - a dazzling playmaker with a trademark long-range thunderbolt; sold to Barcelona for a then-club-record fee." },
  { rank: 88, name: 'Sam Raybould', pos: 'FW', posName: 'Forward', nat: 'ENG', era: '1900-1907', note: 'A prolific early-1900s centre-forward - the club’s first true goalscoring star and a 1906 title winner.' },
  { rank: 89, name: 'Jack Parkinson', pos: 'FW', posName: 'Forward', nat: 'ENG', era: '1902-1914', note: 'A sharp local goalscorer of the Edwardian era and a 1906 champion.' },
  { rank: 90, name: 'David Johnson', pos: 'FW', posName: 'Forward', nat: 'ENG', era: '1976-1982', note: 'A busy, two-spell Scouse forward and a title winner who also turned out for Everton.' },
  { rank: 91, name: 'Danny Murphy', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '1997-2004', note: 'A clever, set-piece-capable midfielder - remembered for a knack of scoring winners at Old Trafford.' },
  { rank: 92, name: 'Dick Forshaw', pos: 'FW', posName: 'Inside-forward', nat: 'ENG', era: '1919-1927', note: 'A versatile inside-forward of the back-to-back 1920s champions - who later won the title with Everton too.' },
  { rank: 93, name: 'Curtis Jones', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '2019-', note: 'A composed, press-resistant local academy graduate who grew into a trusted rotation midfielder.' },
  { rank: 94, name: 'Lucas Leiva', pos: 'MF', posName: 'Defensive mid', nat: 'BRA', era: '2007-2017', note: 'A much-loved holding midfielder who reinvented himself as a screening anchor across a decade of service.' },
  { rank: 95, name: 'Adam Lallana', pos: 'MF', posName: 'Midfielder', nat: 'ENG', era: '2014-2020', note: 'A neat, press-leading and creative midfielder whose quality on the ball helped shape Klopp’s early sides.' },
  { rank: 96, name: 'Bobby Robinson', pos: 'FW', posName: 'Forward', nat: 'ENG', era: '1904-1912', note: 'A reliable inside-forward of the early-1900s sides and a 1906 title winner.' },
  { rank: 97, name: 'Jack Cox', pos: 'FW', posName: 'Winger', nat: 'ENG', era: '1898-1909', note: 'A skilful outside-left and one of the club’s first stars, in the title-winning teams of 1901 and 1906.' },
  { rank: 98, name: 'Luis García', pos: 'FW', posName: 'Forward', nat: 'ESP', era: '2004-2007', note: "A flair forward for the big occasion - scorer of the famous 'ghost goal' against Chelsea that sent Liverpool to Istanbul." },
  { rank: 99, name: 'Dominik Szoboszlai', pos: 'MF', posName: 'Midfielder', nat: 'HUN', era: '2023-', note: 'A dynamic, hard-running box-to-box midfielder and a genuine set-piece weapon - a specialist from direct free-kicks with a fierce long-range shot.' },
  { rank: 100, name: 'Alexis Mac Allister', pos: 'MF', posName: 'Midfielder', nat: 'ARG', era: '2023-', note: 'A World Cup-winning midfielder with elite control and passing - the deep-lying brain anchoring the post-Salah rebuild.' },
];

export const TABS = [
  { v: 'start', label: 'Start Here' },
  { v: 'now', label: 'The Verdict' },
  { v: 'history', label: 'History' },
  { v: 'top100', label: 'Top 100' },
  { v: 'squad', label: 'Squad & XI' },
  { v: 'transfers', label: 'Transfers' },
  { v: 'club', label: 'Club & Rivals' },
  { v: 'study', label: 'Study Mode' },
] as const;

export type TabId = (typeof TABS)[number]['v'];

// ─── Sitewide glossary ────────────────────────────────────────────────────────
// Slugs (kop, bootroom, ...) are used for jargon wrapped in prose; the 2-3
// letter keys (GK, CB, RWB, ...) are the position codes used in Transfers/XI.
export const GLOSSARY: Record<string, string> = {
  kop: "The Kop - Anfield's home end and the loudest source of noise in the stadium. Named after Spion Kop, a hill in South Africa where a defining Boer War battle took place in 1900; English grounds later borrowed the name for their steepest terraces.",
  bootroom: "The Boot Room - a small, plain room at Anfield where Bill Shankly's coaching staff met to plan training and tactics over tea. It became shorthand for Liverpool's habit of promoting from within, passing knowledge from one manager to the next instead of starting over.",
  ynwa: "You'll Never Walk Alone (YNWA) - Liverpool's anthem, sung by the crowd before every home match. Adapted from a Rodgers and Hammerstein show tune, it was popularised by local band Gerry and the Pacemakers in the 1960s and adopted by the Kop soon after.",
  topsix: "Top six - the small group of clubs, usually Liverpool, Manchester United, Manchester City, Arsenal, Chelsea and Tottenham, that most years compete for the four places that qualify for the following season's Champions League.",
  derby: "Derby - a match against a local rival. Liverpool's derby is against Everton, based barely a mile away in the same city, making it one of the most-played fixtures in English top-flight history.",
  treble: "The treble - winning three major trophies in one season. Liverpool have never won the outright treble (league, FA Cup, Champions League) but did win a cup treble - the FA Cup, League Cup and UEFA Cup - in 2001.",
  GK: 'Goalkeeper.',
  CB: 'Centre-back - a central defender.',
  LB: 'Left-back - a defender on the left side.',
  RB: 'Right-back - a defender on the right side.',
  RWB: 'Right wing-back - a right-back who pushes further forward to support attacks.',
  DF: 'Defender (general).',
  DM: 'Defensive midfielder, screening the back line.',
  CM: 'Central midfielder.',
  AM: 'Attacking midfielder, playing just behind the strikers.',
  MF: 'Midfielder (general).',
  LW: 'Left winger.',
  RW: 'Right winger.',
  W: 'Winger (general).',
  ST: 'Striker - the furthest-forward attacking position.',
  FW: 'Forward (general).',
};
