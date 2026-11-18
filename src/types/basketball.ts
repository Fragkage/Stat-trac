export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export type TeamSide = 'home' | 'away';

export type GameStatus = 'setup' | 'live' | 'final';

export interface PlayerStats {
  pts: number;
  fgm: number;
  fga: number;
  fg3m: number;
  fg3a: number;
  ftm: number;
  fta: number;
  oreb: number;
  dreb: number;
  reb: number; // oreb + dreb
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  pf: number; // Cumulative game personal fouls (does NOT reset each quarter)
  tf: number;
  plusMinus: number;
  secondsPlayed: number; // Live playing time in seconds on court
}

export interface Player {
  id: string;
  number: number;
  name: string;
  position: Position;
  isOnCourt: boolean;
  isStarter: boolean;
  avatar?: string;
  stats: PlayerStats;
}

export interface Team {
  id: string;
  side: TeamSide;
  name: string;
  city: string;
  abbreviation: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  score: number;
  fouls: number; // Quarter team fouls (RESETS to 0 every quarter for Bonus calculation)
  totalFouls: number; // Cumulative game team fouls
  timeoutsRemaining: number;
  players: Player[];
}

export type StatType =
  | '2PT_MADE'
  | '2PT_MISS'
  | '3PT_MADE'
  | '3PT_MISS'
  | 'FT_MADE'
  | 'FT_MISS'
  | 'OREB'
  | 'DREB'
  | 'AST'
  | 'STL'
  | 'BLK'
  | 'TOV'
  | 'PF'
  | 'TF'
  | 'SUB_2PT_MADE'
  | 'SUB_2PT_MISS'
  | 'SUB_3PT_MADE'
  | 'SUB_3PT_MISS'
  | 'SUB_FT_MADE'
  | 'SUB_FT_MISS'
  | 'SUB_OREB'
  | 'SUB_DREB'
  | 'SUB_AST'
  | 'SUB_STL'
  | 'SUB_BLK'
  | 'SUB_TOV'
  | 'SUB_PF'
  | 'SUB_TF'
  | 'SUB_IN'
  | 'SUB_OUT'
  | 'TIMEOUT'
  | 'MINUTES_ADJUST';

export interface PlayByPlayEvent {
  id: string;
  timestamp: string; // real clock timestamp
  gameTime: string; // "08:42"
  quarter: number;
  teamSide: TeamSide;
  teamName: string;
  playerId?: string;
  playerName?: string;
  playerNumber?: number;
  actionType: StatType;
  description: string;
  pointsAdded: number; // positive or negative
  previousStateSnapshot?: string;
}

export interface GameSettings {
  quarterLengthMinutes: number; // e.g. 10 for FIBA, 12 for NBA, 8 for High School
  foulOutLimit: number; // 5 for FIBA, 6 for NBA
  bonusFoulThreshold: number; // 5 fouls in a period = bonus
  shotClockSeconds: number; // 24
  soundEnabled: boolean;
  autoAssistPrompt: boolean;
}

export interface ActiveTimeout {
  teamSide: TeamSide;
  teamName: string;
  secondsRemaining: number; // 60 down to 0
  savedGameClockSeconds: number; // the exact game clock where timeout was called
}

export interface GameState {
  id: string;
  status: GameStatus; // 'setup' | 'live' | 'final'
  quarter: number; // 1, 2, 3, 4, 5 (OT1), etc.
  gameClockSeconds: number; // remaining seconds in period (e.g. 600 = 10:00)
  shotClockSeconds: number; // 24 or 14
  isClockRunning: boolean;
  possession: TeamSide;
  homeTeam: Team;
  awayTeam: Team;
  playByPlay: PlayByPlayEvent[];
  settings: GameSettings;
  activeTimeout?: ActiveTimeout | null;
}
