// Selectable clubs for Penalty Simulator. Rosters are each team's current
// (2026/27 season) first-team OUTFIELD players (goalkeepers excluded — they
// don't take penalties).
//
// `rating` is EA SPORTS FC 26's actual in-game "Penalties" sub-attribute
// (under Shooting), pulled from ea.com's official player ratings pages —
// not an invented stat. A handful of fringe players with no individual FC 26
// card are marked `estimated: true`; their rating is a rough guess, not a
// real stat.
//
// Kit colors are each club's real 2025/26 home kit, used to tint the
// on-pitch shooter (user's team) and goalkeeper (CPU's team) sprites.
export interface Player {
  name: string;
  number: number;
  position: 'DF' | 'MF' | 'FW';
  rating: number; // 0-99 — EA FC 26 "Penalties" attribute, where available
  estimated?: true; // no FC 26 card exists; rating is a rough guess
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  shirtLight: string;
  shirtDark: string;
  shirtText: string; // legible number/name color against this shirt
  roster: Player[];
}

export const TEAMS: Record<string, Team> = {
  liverpool: {
    id: 'liverpool',
    name: 'Liverpool',
    shortName: 'LIV',
    shirtLight: '#ff2b4d',
    shirtDark: '#a8081f',
    shirtText: '#f8f6f2',
    roster: [
      { name: 'Alexander Isak', number: 9, position: 'FW', rating: 86 },
      { name: 'Alexis Mac Allister', number: 10, position: 'MF', rating: 86 },
      { name: 'Dominik Szoboszlai', number: 8, position: 'MF', rating: 83 },
      { name: 'Cody Gakpo', number: 18, position: 'FW', rating: 68 },
      { name: 'Florian Wirtz', number: 7, position: 'MF', rating: 66 },
      { name: 'Hugo Ekitike', number: 22, position: 'FW', rating: 62 },
      { name: 'Wataru Endo', number: 3, position: 'MF', rating: 62 },
      { name: 'Federico Chiesa', number: 14, position: 'FW', rating: 62 },
      { name: 'Virgil van Dijk', number: 4, position: 'DF', rating: 62 },
      { name: 'Curtis Jones', number: 17, position: 'MF', rating: 60 },
      { name: 'Rio Ngumoha', number: 73, position: 'FW', rating: 59 },
      { name: 'Ryan Gravenberch', number: 38, position: 'MF', rating: 58 },
      { name: 'Trey Nyoni', number: 42, position: 'MF', rating: 51 },
      { name: 'Milos Kerkez', number: 6, position: 'DF', rating: 50 },
      { name: 'Stefan Bajcetic', number: 43, position: 'MF', rating: 48 },
      { name: 'Jeremie Frimpong', number: 30, position: 'DF', rating: 43 },
      { name: 'Calvin Ramsay', number: 47, position: 'DF', rating: 42 },
      { name: 'Conor Bradley', number: 12, position: 'DF', rating: 40 },
      { name: 'Jayden Danns', number: 76, position: 'FW', rating: 38, estimated: true },
      { name: 'James McConnell', number: 53, position: 'MF', rating: 35, estimated: true },
      { name: 'Giovanni Leoni', number: 15, position: 'DF', rating: 27 },
      { name: 'Joe Gomez', number: 2, position: 'DF', rating: 26 },
      { name: 'Talla Ndiaye', number: 75, position: 'DF', rating: 30, estimated: true },
      { name: 'Michael Laffey', number: 94, position: 'MF', rating: 28, estimated: true },
    ],
  },
  mancity: {
    id: 'mancity',
    name: 'Manchester City',
    shortName: 'MCI',
    shirtLight: '#8bc7ec',
    shirtDark: '#1c2c5b',
    shirtText: '#f8f6f2',
    roster: [
      { name: 'Erling Haaland', number: 9, position: 'FW', rating: 90 },
      { name: 'Omar Marmoush', number: 7, position: 'FW', rating: 79 },
      { name: 'Antoine Semenyo', number: 42, position: 'FW', rating: 69 },
      { name: 'Rayan Cherki', number: 10, position: 'MF', rating: 66 },
      { name: 'Elliot Anderson', number: 32, position: 'MF', rating: 65, estimated: true },
      { name: 'Phil Foden', number: 47, position: 'MF', rating: 64 },
      { name: 'Rodri', number: 16, position: 'MF', rating: 62 },
      { name: 'Matheus Nunes', number: 27, position: 'MF', rating: 62 },
      { name: 'Savinho', number: 26, position: 'FW', rating: 62 },
      { name: 'Josko Gvardiol', number: 24, position: 'DF', rating: 61 },
      { name: 'Nico Gonzalez', number: 14, position: 'MF', rating: 60 },
      { name: 'Tijjani Reijnders', number: 4, position: 'MF', rating: 59 },
      { name: 'Mateo Kovacic', number: 8, position: 'MF', rating: 59 },
      { name: "Nico O'Reilly", number: 33, position: 'DF', rating: 59 },
      { name: 'Kalvin Phillips', number: 44, position: 'MF', rating: 58 },
      { name: 'Jeremy Doku', number: 11, position: 'FW', rating: 55 },
      { name: 'Rico Lewis', number: 82, position: 'DF', rating: 50 },
      { name: 'Abdukodir Khusanov', number: 45, position: 'DF', rating: 46 },
      { name: 'Ruben Dias', number: 3, position: 'DF', rating: 45 },
      { name: 'Rayan Ait-Nouri', number: 21, position: 'DF', rating: 42 },
      { name: 'Marc Guehi', number: 15, position: 'DF', rating: 38 },
    ],
  },
  chelsea: {
    id: 'chelsea',
    name: 'Chelsea',
    shortName: 'CHE',
    shirtLight: '#2a5fc4',
    shirtDark: '#0d2b6b',
    shirtText: '#f8f6f2',
    roster: [
      { name: 'Cole Palmer', number: 10, position: 'MF', rating: 90 },
      { name: 'João Pedro', number: 20, position: 'FW', rating: 86 },
      { name: 'Liam Delap', number: 9, position: 'FW', rating: 77 },
      { name: 'Enzo Fernández', number: 8, position: 'MF', rating: 73 },
      { name: 'Estêvão', number: 41, position: 'FW', rating: 68 },
      { name: 'Pedro Neto', number: 7, position: 'FW', rating: 65 },
      { name: 'Reece James', number: 24, position: 'DF', rating: 65 },
      { name: 'Marc Guiu', number: 38, position: 'FW', rating: 65 },
      { name: 'Alejandro Garnacho', number: 49, position: 'FW', rating: 56 },
      { name: 'Moisés Caicedo', number: 25, position: 'MF', rating: 55 },
      { name: 'Andrey Santos', number: 17, position: 'MF', rating: 54 },
      { name: 'Jamie Gittens', number: 11, position: 'FW', rating: 53 },
      { name: 'Dário Essugo', number: 14, position: 'MF', rating: 52 },
      { name: 'Romeo Lavia', number: 45, position: 'MF', rating: 50 },
      { name: 'Wesley Fofana', number: 29, position: 'DF', rating: 46 },
      { name: 'Josh Acheampong', number: 34, position: 'DF', rating: 46 },
      { name: 'Trevoh Chalobah', number: 23, position: 'DF', rating: 45 },
      { name: 'Benoît Badiashile', number: 5, position: 'DF', rating: 45 },
      { name: 'Malo Gusto', number: 27, position: 'DF', rating: 45 },
      { name: 'Mamadou Sarr', number: 19, position: 'DF', rating: 44 },
      { name: 'Levi Colwill', number: 6, position: 'DF', rating: 40 },
      { name: 'Tosin Adarabioyo', number: 4, position: 'DF', rating: 37 },
      { name: 'Jorrel Hato', number: 21, position: 'DF', rating: 34 },
    ],
  },
  manutd: {
    id: 'manutd',
    name: 'Manchester United',
    shortName: 'MUN',
    shirtLight: '#e0342a',
    shirtDark: '#7a0c0c',
    shirtText: '#f8f6f2',
    roster: [
      { name: 'Bruno Fernandes', number: 8, position: 'MF', rating: 91 },
      { name: 'Marcus Rashford', number: 9, position: 'FW', rating: 85 },
      { name: 'Bryan Mbeumo', number: 19, position: 'FW', rating: 85 },
      { name: 'Joshua Zirkzee', number: 11, position: 'FW', rating: 77 },
      { name: 'Matheus Cunha', number: 10, position: 'FW', rating: 76 },
      { name: 'Benjamin Sesko', number: 30, position: 'FW', rating: 70 },
      { name: 'Mason Mount', number: 7, position: 'MF', rating: 69 },
      { name: 'Harry Maguire', number: 5, position: 'DF', rating: 68 },
      { name: 'Amad Diallo', number: 16, position: 'MF', rating: 63 },
      { name: 'Manuel Ugarte', number: 25, position: 'MF', rating: 62 },
      { name: 'Kobbie Mainoo', number: 37, position: 'MF', rating: 58 },
      { name: 'Lisandro Martínez', number: 6, position: 'DF', rating: 55 },
      { name: 'Patrick Dorgu', number: 13, position: 'DF', rating: 49 },
      { name: 'Diogo Dalot', number: 2, position: 'DF', rating: 47 },
      { name: 'Noussair Mazraoui', number: 3, position: 'DF', rating: 44 },
      { name: 'Ayden Heaven', number: 26, position: 'DF', rating: 41 },
      { name: 'Leny Yoro', number: 15, position: 'DF', rating: 40 },
      { name: 'Matthijs de Ligt', number: 4, position: 'DF', rating: 40 },
      { name: 'Luke Shaw', number: 23, position: 'DF', rating: 38 },
    ],
  },
  tottenham: {
    id: 'tottenham',
    name: 'Tottenham Hotspur',
    shortName: 'TOT',
    shirtLight: '#f5f5f5',
    shirtDark: '#a8adb5',
    shirtText: '#132257',
    roster: [
      { name: 'Dominic Solanke', number: 19, position: 'FW', rating: 82 },
      { name: 'Mathys Tel', number: 11, position: 'FW', rating: 81 },
      { name: 'James Maddison', number: 10, position: 'MF', rating: 77 },
      { name: 'Richarlison', number: 9, position: 'FW', rating: 77 },
      { name: 'Dejan Kulusevski', number: 21, position: 'MF', rating: 70 },
      { name: 'Wilson Odobert', number: 28, position: 'FW', rating: 68 },
      { name: 'Rodrigo Bentancur', number: 30, position: 'MF', rating: 67 },
      { name: 'Pedro Porro', number: 23, position: 'DF', rating: 66 },
      { name: 'Sandro Tonali', number: 16, position: 'MF', rating: 64 },
      { name: 'Mateus Fernandes', number: 18, position: 'MF', rating: 64 },
      { name: 'Mohammed Kudus', number: 20, position: 'FW', rating: 64 },
      { name: 'Conor Gallagher', number: 8, position: 'MF', rating: 63 },
      { name: 'Xavi Simons', number: 7, position: 'MF', rating: 61 },
      { name: 'Archie Gray', number: 14, position: 'MF', rating: 57 },
      { name: 'Jan Paul van Hecke', number: 6, position: 'DF', rating: 55 },
      { name: 'Andy Robertson', number: 27, position: 'DF', rating: 55 },
      { name: 'Ben Davies', number: 33, position: 'DF', rating: 54 },
      { name: 'Pape Matar Sarr', number: 29, position: 'MF', rating: 54 },
      { name: 'Lucas Bergvall', number: 15, position: 'MF', rating: 53 },
      { name: 'Radu Dragusin', number: 3, position: 'DF', rating: 49 },
      { name: 'Destiny Udogie', number: 13, position: 'DF', rating: 46 },
      { name: 'Kevin Danso', number: 4, position: 'DF', rating: 42 },
      { name: 'Marcos Senesi', number: 5, position: 'DF', rating: 40 },
      { name: 'Cristian Romero', number: 17, position: 'DF', rating: 40 },
      { name: 'Micky van de Ven', number: 37, position: 'DF', rating: 39 },
      { name: 'Djed Spence', number: 24, position: 'DF', rating: 37 },
    ],
  },
  arsenal: {
    id: 'arsenal',
    name: 'Arsenal',
    shortName: 'ARS',
    shirtLight: '#ef2631',
    shirtDark: '#7a0d0d',
    shirtText: '#f8f6f2',
    roster: [
      { name: 'Viktor Gyökeres', number: 14, position: 'FW', rating: 88 },
      { name: 'Bukayo Saka', number: 7, position: 'FW', rating: 87 },
      { name: 'Kai Havertz', number: 29, position: 'FW', rating: 83 },
      { name: 'Eberechi Eze', number: 10, position: 'MF', rating: 76 },
      { name: 'Leandro Trossard', number: 19, position: 'FW', rating: 75 },
      { name: 'Gabriel Jesus', number: 9, position: 'FW', rating: 75 },
      { name: 'Noni Madueke', number: 20, position: 'FW', rating: 75 },
      { name: 'Declan Rice', number: 41, position: 'MF', rating: 71 },
      { name: 'Mikel Merino', number: 23, position: 'MF', rating: 70 },
      { name: 'Martin Ødegaard', number: 8, position: 'MF', rating: 68 },
      { name: 'Gabriel Martinelli', number: 11, position: 'FW', rating: 62 },
      { name: 'Christian Nørgaard', number: 16, position: 'MF', rating: 62 },
      { name: 'Ethan Nwaneri', number: 22, position: 'FW', rating: 58 },
      { name: 'Myles Lewis-Skelly', number: 49, position: 'DF', rating: 55 },
      { name: 'Gabriel', number: 6, position: 'DF', rating: 51 },
      { name: 'Riccardo Calafiori', number: 33, position: 'DF', rating: 50 },
      { name: 'Cristhian Mosquera', number: 3, position: 'DF', rating: 49 },
      { name: 'William Saliba', number: 2, position: 'DF', rating: 47 },
      { name: 'Martín Zubimendi', number: 36, position: 'MF', rating: 45 },
      { name: 'Jurriën Timber', number: 12, position: 'DF', rating: 42 },
      { name: 'Piero Hincapié', number: 5, position: 'DF', rating: 33 },
      { name: 'Benjamin White', number: 4, position: 'DF', rating: 24 },
    ],
  },
};

export const TEAM_LIST: Team[] = Object.values(TEAMS);

// A team's "penalty strength" is the average Penalties rating of its top 5
// takers — the 5 players who'd actually step up — not the whole squad
// (a deep bench of low-rated defenders shouldn't drag down a team whose
// first 5 takers are elite). Stars are that average, min-max normalized
// across all selectable teams so the scale is always relative to this
// specific set of 6 clubs, not an arbitrary absolute cutoff. Floored at
// 3.5 rather than 1 — these are six Premier League giants, not a mix of
// strong and weak squads, so even the "worst" of the six should still read
// as good, just relatively less deep than the others.
function topFiveAvg(team: Team): number {
  const top5 = [...team.roster].sort((a, b) => b.rating - a.rating).slice(0, 5);
  return top5.reduce((sum, p) => sum + p.rating, 0) / top5.length;
}

const AVGS = TEAM_LIST.map(topFiveAvg);
const MIN_AVG = Math.min(...AVGS);
const MAX_AVG = Math.max(...AVGS);
const STAR_FLOOR = 3.5;
const STAR_CEILING = 5;

export const TEAM_STARS: Record<string, number> = Object.fromEntries(
  TEAM_LIST.map((team) => {
    const avg = topFiveAvg(team);
    const span = MAX_AVG - MIN_AVG || 1;
    const raw = STAR_FLOOR + ((STAR_CEILING - STAR_FLOOR) * (avg - MIN_AVG)) / span;
    return [team.id, Math.round(raw * 2) / 2]; // nearest half-star
  })
);
