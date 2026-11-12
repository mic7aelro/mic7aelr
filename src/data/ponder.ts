/** Projects that appear on /ponder. Add one item here and one route to add a project. */
export type PonderCategory = 'games' | 'tools';
export type PonderThumb = 'cube' | 'dial' | 'table';

export interface PonderProject {
  slug: string;
  title: string;
  pitch: string;
  category: PonderCategory;
  thumb: PonderThumb;
}

export const PONDER_CATEGORIES: { id: PonderCategory; label: string }[] = [
  { id: 'games', label: 'Games' },
  { id: 'tools', label: 'Tools' },
];

export const PONDER_PROJECTS: PonderProject[] = [
  {
    slug: 'rubiks-cube',
    title: 'CFOP with Jev',
    pitch: 'Enter a scramble and watch a 3D cube solve itself. Jev makes the choices along the way.',
    category: 'games',
    thumb: 'cube',
  },
  {
    slug: 'wavelength',
    title: 'Wavelength with Jev',
    pitch: 'Write one clue for a hidden target. Jev guesses where it lands. Star Wars, Marvel, and DC.',
    category: 'games',
    thumb: 'dial',
  },
  {
    slug: 'bulk-labeler',
    title: 'Bulk Labeler',
    pitch: 'Upload a spreadsheet. Jev labels thousands of rows for a few cents and checks its own accuracy.',
    category: 'tools',
    thumb: 'table',
  },
];
