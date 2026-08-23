export type FantasyPosition = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';

export type FantasyTemplate = 'sleeper' | 'espn' | 'cbs';

export type FantasyPlayer = {
  sleeperId: string;
  name: string;
  position: FantasyPosition;
  team: string | null;
};

export type FantasyBoardSummary = {
  slug: string;
  name: string;
  template: FantasyTemplate;
  playerCount: number;
  connectedLeagueId: string | null;
  connectedDraftId: string | null;
  updatedAt: string;
};

export type FantasyBoard = FantasyBoardSummary & {
  players: FantasyPlayer[];
};
