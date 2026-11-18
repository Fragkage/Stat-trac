'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { GameState, PlayByPlayEvent, Player, StatType, TeamSide, ActiveTimeout, GameStatus, Team, GameSettings } from '../types/basketball';
import { initialGameState, createEmptyStats } from '../data/mockGame';
import { sounds } from '../utils/sound';

interface GameContextType {
  gameState: GameState;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  setGameStatus: (status: GameStatus) => void;
  startNewGame: (params: {
    homeTeam: Team;
    awayTeam: Team;
    settings: GameSettings;
  }) => void;
  adjustPlayerMinutes: (teamSide: TeamSide, playerId: string, deltaMinutes: number) => void;
  recordStat: (params: {
    teamSide: TeamSide;
    playerId: string;
    actionType: StatType;
    customNote?: string;
  }) => void;
  substitutePlayer: (teamSide: TeamSide, outPlayerId: string, inPlayerId: string) => void;
  toggleClock: () => void;
  resetGameClock: (seconds?: number) => void;
  setGameClockTime: (seconds: number) => void;
  resetShotClock: (seconds?: number) => void;
  adjustGameClock: (deltaSeconds: number) => void;
  nextQuarter: () => void;
  previousQuarter: () => void;
  togglePossession: () => void;
  recordTimeout: (teamSide: TeamSide) => void;
  endTimeout: () => void;
  adjustTimeout: (deltaSeconds: number) => void;
  updateSettings: (newSettings: Partial<GameState['settings']>) => void;
  resetGame: () => void;
  // Assist follow-up prompt
  pendingAssist: {
    teamSide: TeamSide;
    scoringPlayerId: string;
    scoringPlayerName: string;
    points: number;
  } | null;
  resolveAssist: (assistingPlayerId: string | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [history, setHistory] = useState<GameState[]>([]);
  const [redoStack, setRedoStack] = useState<GameState[]>([]);
  const [pendingAssist, setPendingAssist] = useState<GameContextType['pendingAssist']>(null);

  // Sync settings sound enabled
  useEffect(() => {
    sounds.setEnabled(gameState.settings.soundEnabled);
  }, [gameState.settings.soundEnabled]);

  // Push state to undo stack before mutation
  const pushState = useCallback((currentState: GameState) => {
    setHistory((prev) => [...prev.slice(-30), JSON.parse(JSON.stringify(currentState))]);
    setRedoStack([]);
  }, []);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [JSON.parse(JSON.stringify(gameState)), ...prev]);
    setGameState(previous);
    sounds.playUndo();
  }, [history, gameState]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[0];
    setRedoStack((prev) => prev.slice(1));
    setHistory((prev) => [...prev, JSON.parse(JSON.stringify(gameState))]);
    setGameState(nextState);
    sounds.playTap();
  }, [redoStack, gameState]);

  // Format seconds to mm:ss
  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const setGameStatus = useCallback((status: GameStatus) => {
    setGameState((prev) => ({
      ...prev,
      status,
      isClockRunning: false,
    }));
  }, []);

  // Launch a new game configured via the Starter Setup Screen
  const startNewGame = useCallback(
    ({
      homeTeam,
      awayTeam,
      settings,
    }: {
      homeTeam: Team;
      awayTeam: Team;
      settings: GameSettings;
    }) => {
      const qSec = settings.quarterLengthMinutes * 60;

      const cleanTeam = (t: Team): Team => ({
        ...t,
        score: 0,
        fouls: 0,
        totalFouls: 0,
        timeoutsRemaining: 5,
        players: t.players.map((p) => ({
          ...p,
          isOnCourt: p.isStarter,
          stats: createEmptyStats(),
        })),
      });

      const newHome = cleanTeam(homeTeam);
      const newAway = cleanTeam(awayTeam);

      const newGameState: GameState = {
        id: `game-${Date.now()}`,
        status: 'live',
        quarter: 1,
        gameClockSeconds: qSec,
        shotClockSeconds: settings.shotClockSeconds,
        isClockRunning: false,
        possession: 'home',
        homeTeam: newHome,
        awayTeam: newAway,
        settings,
        activeTimeout: null,
        playByPlay: [
          {
            id: `pbp-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            gameTime: formatTime(qSec),
            quarter: 1,
            teamSide: 'home',
            teamName: newHome.name,
            actionType: 'SUB_IN',
            description: `Game started: ${newHome.city} ${newHome.name} vs ${newAway.city} ${newAway.name}`,
            pointsAdded: 0,
          },
        ],
      };

      setGameState(newGameState);
      setHistory([]);
      setRedoStack([]);
      sounds.playBuzzer();
    },
    []
  );

  // Adjust player minutes manually
  const adjustPlayerMinutes = useCallback(
    (teamSide: TeamSide, playerId: string, deltaMinutes: number) => {
      setGameState((currentState) => {
        pushState(currentState);
        const state: GameState = JSON.parse(JSON.stringify(currentState));
        const team = teamSide === 'home' ? state.homeTeam : state.awayTeam;
        const player = team.players.find((p) => p.id === playerId);
        if (!player) return currentState;

        const deltaSec = deltaMinutes * 60;
        player.stats.secondsPlayed = Math.max(0, player.stats.secondsPlayed + deltaSec);

        const newEvent: PlayByPlayEvent = {
          id: `pbp-min-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          gameTime: formatTime(state.gameClockSeconds),
          quarter: state.quarter,
          teamSide,
          teamName: team.name,
          playerId: player.id,
          playerName: player.name,
          playerNumber: player.number,
          actionType: 'MINUTES_ADJUST',
          description: `Playing time for #${player.number} ${player.name} adjusted by ${deltaMinutes > 0 ? '+' : ''}${deltaMinutes}m`,
          pointsAdded: 0,
        };

        state.playByPlay = [newEvent, ...state.playByPlay];
        sounds.playTap();
        return state;
      });
    },
    [pushState]
  );

  // Record a stat action (both positive stats and error correction/subtract stats)
  const recordStat = useCallback(
    ({
      teamSide,
      playerId,
      actionType,
      customNote,
    }: {
      teamSide: TeamSide;
      playerId: string;
      actionType: StatType;
      customNote?: string;
    }) => {
      setGameState((currentState) => {
        pushState(currentState);

        const state: GameState = JSON.parse(JSON.stringify(currentState));
        const activeTeam = teamSide === 'home' ? state.homeTeam : state.awayTeam;
        const opponentTeam = teamSide === 'home' ? state.awayTeam : state.homeTeam;

        const player = activeTeam.players.find((p) => p.id === playerId);
        if (!player) return currentState;

        let pointsAdded = 0;
        let desc = '';
        let shotClockReset: number | null = null;
        let possessionSwitch = false;

        switch (actionType) {
          // --- POSITIVE SCORING ---
          case '2PT_MADE': {
            pointsAdded = 2;
            player.stats.pts += 2;
            player.stats.fgm += 1;
            player.stats.fga += 1;
            activeTeam.score += 2;
            desc = `${player.name} makes 2PT Field Goal`;
            shotClockReset = state.settings.shotClockSeconds;
            sounds.playScore(2);
            if (state.settings.autoAssistPrompt) {
              setTimeout(() => {
                setPendingAssist({
                  teamSide,
                  scoringPlayerId: player.id,
                  scoringPlayerName: player.name,
                  points: 2,
                });
              }, 150);
            }
            break;
          }
          case '2PT_MISS': {
            player.stats.fga += 1;
            desc = `${player.name} misses 2PT shot`;
            sounds.playMiss();
            break;
          }
          case '3PT_MADE': {
            pointsAdded = 3;
            player.stats.pts += 3;
            player.stats.fgm += 1;
            player.stats.fga += 1;
            player.stats.fg3m += 1;
            player.stats.fg3a += 1;
            activeTeam.score += 3;
            desc = `${player.name} makes 3PT Field Goal`;
            shotClockReset = state.settings.shotClockSeconds;
            sounds.playScore(3);
            if (state.settings.autoAssistPrompt) {
              setTimeout(() => {
                setPendingAssist({
                  teamSide,
                  scoringPlayerId: player.id,
                  scoringPlayerName: player.name,
                  points: 3,
                });
              }, 150);
            }
            break;
          }
          case '3PT_MISS': {
            player.stats.fga += 1;
            player.stats.fg3a += 1;
            desc = `${player.name} misses 3PT shot`;
            sounds.playMiss();
            break;
          }
          case 'FT_MADE': {
            pointsAdded = 1;
            player.stats.pts += 1;
            player.stats.ftm += 1;
            player.stats.fta += 1;
            activeTeam.score += 1;
            desc = `${player.name} makes Free Throw`;
            sounds.playScore(1);
            break;
          }
          case 'FT_MISS': {
            player.stats.fta += 1;
            desc = `${player.name} misses Free Throw`;
            sounds.playMiss();
            break;
          }

          // --- SUBTRACT / ERROR CORRECTIONS ---
          case 'SUB_2PT_MADE': {
            if (player.stats.pts >= 2 && player.stats.fgm > 0) {
              pointsAdded = -2;
              player.stats.pts -= 2;
              player.stats.fgm -= 1;
              player.stats.fga = Math.max(0, player.stats.fga - 1);
              activeTeam.score = Math.max(0, activeTeam.score - 2);
              desc = `Correction: Removed 2PT from ${player.name}`;
              sounds.playUndo();
            }
            break;
          }
          case 'SUB_2PT_MISS': {
            if (player.stats.fga > 0) {
              player.stats.fga -= 1;
              desc = `Correction: Removed 2PT Miss from ${player.name}`;
              sounds.playUndo();
            }
            break;
          }
          case 'SUB_3PT_MADE': {
            if (player.stats.pts >= 3 && player.stats.fg3m > 0) {
              pointsAdded = -3;
              player.stats.pts -= 3;
              player.stats.fg3m -= 1;
              player.stats.fg3a = Math.max(0, player.stats.fg3a - 1);
              player.stats.fgm = Math.max(0, player.stats.fgm - 1);
              player.stats.fga = Math.max(0, player.stats.fga - 1);
              activeTeam.score = Math.max(0, activeTeam.score - 3);
              desc = `Correction: Removed 3PT from ${player.name}`;
              sounds.playUndo();
            }
            break;
          }
          case 'SUB_3PT_MISS': {
            if (player.stats.fg3a > 0) {
              player.stats.fg3a -= 1;
              player.stats.fga = Math.max(0, player.stats.fga - 1);
              desc = `Correction: Removed 3PT Miss from ${player.name}`;
              sounds.playUndo();
            }
            break;
          }
          case 'SUB_FT_MADE': {
            if (player.stats.pts >= 1 && player.stats.ftm > 0) {
              pointsAdded = -1;
              player.stats.pts -= 1;
              player.stats.ftm -= 1;
              player.stats.fta = Math.max(0, player.stats.fta - 1);
              activeTeam.score = Math.max(0, activeTeam.score - 1);
              desc = `Correction: Removed FT from ${player.name}`;
              sounds.playUndo();
            }
            break;
          }
          case 'SUB_FT_MISS': {
            if (player.stats.fta > 0) {
              player.stats.fta -= 1;
              desc = `Correction: Removed FT Miss from ${player.name}`;
              sounds.playUndo();
            }
            break;
          }

          // --- REBOUNDS & SUBTRACT REBOUNDS ---
          case 'OREB': {
            player.stats.oreb += 1;
            player.stats.reb += 1;
            desc = `${player.name} Offensive Rebound`;
            shotClockReset = 14; // Offensive rebound 14 sec reset
            sounds.playTap();
            break;
          }
          case 'SUB_OREB': {
            if (player.stats.oreb > 0) {
              player.stats.oreb -= 1;
              player.stats.reb = Math.max(0, player.stats.reb - 1);
              desc = `Correction: Removed OREB from ${player.name}`;
              sounds.playUndo();
            }
            break;
          }
          case 'DREB': {
            player.stats.dreb += 1;
            player.stats.reb += 1;
            desc = `${player.name} Defensive Rebound`;
            shotClockReset = state.settings.shotClockSeconds;
            state.possession = teamSide;
            sounds.playTap();
            break;
          }
          case 'SUB_DREB': {
            if (player.stats.dreb > 0) {
              player.stats.dreb -= 1;
              player.stats.reb = Math.max(0, player.stats.reb - 1);
              desc = `Correction: Removed DREB from ${player.name}`;
              sounds.playUndo();
            } else if (player.stats.reb > 0) {
              player.stats.reb -= 1;
              desc = `Correction: Removed REB from ${player.name}`;
              sounds.playUndo();
            }
            break;
          }

          // --- PLAYMAKING & DEFENSE ---
          case 'AST': {
            player.stats.ast += 1;
            desc = `${player.name} Assist`;
            sounds.playTap();
            break;
          }
          case 'SUB_AST': {
            if (player.stats.ast > 0) {
              player.stats.ast -= 1;
              desc = `Correction: Removed Assist from ${player.name}`;
              sounds.playUndo();
            }
            break;
          }
          case 'STL': {
            player.stats.stl += 1;
            desc = `${player.name} Steal`;
            state.possession = teamSide;
            shotClockReset = state.settings.shotClockSeconds;
            sounds.playTap();
            break;
          }
          case 'SUB_STL': {
            if (player.stats.stl > 0) {
              player.stats.stl -= 1;
              desc = `Correction: Removed Steal from ${player.name}`;
              sounds.playUndo();
            }
            break;
          }
          case 'BLK': {
            player.stats.blk += 1;
            desc = `${player.name} Block`;
            sounds.playTap();
            break;
          }
          case 'SUB_BLK': {
            if (player.stats.blk > 0) {
              player.stats.blk -= 1;
              desc = `Correction: Removed Block from ${player.name}`;
              sounds.playUndo();
            }
            break;
          }

          // --- NEGATIVES: TURNOVER & FOULS ---
          case 'TOV': {
            player.stats.tov += 1;
            desc = `${player.name} Turnover`;
            possessionSwitch = true;
            shotClockReset = state.settings.shotClockSeconds;
            sounds.playWhistle();
            break;
          }
          case 'SUB_TOV': {
            if (player.stats.tov > 0) {
              player.stats.tov -= 1;
              desc = `Correction: Removed Turnover from ${player.name}`;
              sounds.playUndo();
            }
            break;
          }
          case 'PF': {
            // Personal foul increments both player PF and team quarter fouls & total fouls
            player.stats.pf += 1;
            activeTeam.fouls += 1;
            activeTeam.totalFouls += 1;
            desc = `${player.name} Personal Foul (${player.stats.pf} PF, Team Foul ${activeTeam.fouls})`;
            sounds.playWhistle();
            break;
          }
          case 'SUB_PF': {
            if (player.stats.pf > 0) {
              player.stats.pf -= 1;
              activeTeam.fouls = Math.max(0, activeTeam.fouls - 1);
              activeTeam.totalFouls = Math.max(0, activeTeam.totalFouls - 1);
              desc = `Correction: Removed Personal Foul from ${player.name} (${player.stats.pf} PF)`;
              sounds.playUndo();
            }
            break;
          }
          case 'TF': {
            player.stats.tf += 1;
            activeTeam.totalFouls += 1;
            desc = `${player.name} Technical Foul`;
            sounds.playWhistle();
            break;
          }
          case 'SUB_TF': {
            if (player.stats.tf > 0) {
              player.stats.tf -= 1;
              activeTeam.totalFouls = Math.max(0, activeTeam.totalFouls - 1);
              desc = `Correction: Removed Technical Foul from ${player.name}`;
              sounds.playUndo();
            }
            break;
          }
          default:
            sounds.playTap();
            break;
        }

        // Apply Plus/Minus (+/-) to all 10 players currently on court
        if (pointsAdded !== 0) {
          activeTeam.players.forEach((p) => {
            if (p.isOnCourt) {
              p.stats.plusMinus += pointsAdded;
            }
          });
          opponentTeam.players.forEach((p) => {
            if (p.isOnCourt) {
              p.stats.plusMinus -= pointsAdded;
            }
          });
        }

        if (shotClockReset !== null) {
          state.shotClockSeconds = shotClockReset;
        }

        if (possessionSwitch) {
          state.possession = teamSide === 'home' ? 'away' : 'home';
          state.shotClockSeconds = state.settings.shotClockSeconds; // Reset shot clock on possession switch!
        }

        if (desc) {
          const newEvent: PlayByPlayEvent = {
            id: `pbp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            gameTime: formatTime(state.gameClockSeconds),
            quarter: state.quarter,
            teamSide,
            teamName: activeTeam.name,
            playerId: player.id,
            playerName: player.name,
            playerNumber: player.number,
            actionType,
            description: customNote || desc,
            pointsAdded,
          };
          state.playByPlay = [newEvent, ...state.playByPlay];
        }

        return state;
      });
    },
    [pushState]
  );

  // Assist follow-up resolution
  const resolveAssist = useCallback(
    (assistingPlayerId: string | null) => {
      if (!pendingAssist) return;

      if (assistingPlayerId) {
        recordStat({
          teamSide: pendingAssist.teamSide,
          playerId: assistingPlayerId,
          actionType: 'AST',
          customNote: `Assist on ${pendingAssist.scoringPlayerName}'s ${pendingAssist.points}PT basket`,
        });
      }
      setPendingAssist(null);
    },
    [pendingAssist, recordStat]
  );

  // Substitute a player
  const substitutePlayer = useCallback(
    (teamSide: TeamSide, outPlayerId: string, inPlayerId: string) => {
      setGameState((currentState) => {
        pushState(currentState);

        const state: GameState = JSON.parse(JSON.stringify(currentState));
        const team = teamSide === 'home' ? state.homeTeam : state.awayTeam;

        const outPlayer = team.players.find((p) => p.id === outPlayerId);
        const inPlayer = team.players.find((p) => p.id === inPlayerId);

        if (!outPlayer || !inPlayer) return currentState;

        outPlayer.isOnCourt = false;
        inPlayer.isOnCourt = true;

        sounds.playTap();

        const newEvent: PlayByPlayEvent = {
          id: `sub-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          gameTime: formatTime(state.gameClockSeconds),
          quarter: state.quarter,
          teamSide,
          teamName: team.name,
          playerId: inPlayer.id,
          playerName: inPlayer.name,
          playerNumber: inPlayer.number,
          actionType: 'SUB_IN',
          description: `SUB: #${inPlayer.number} ${inPlayer.name} replaces #${outPlayer.number} ${outPlayer.name}`,
          pointsAdded: 0,
        };

        state.playByPlay = [newEvent, ...state.playByPlay];
        return state;
      });
    },
    [pushState]
  );

  // Clock toggle
  const toggleClock = useCallback(() => {
    setGameState((prev) => {
      // Don't toggle game clock if a 60s timeout is actively running
      if (prev.activeTimeout) {
        return prev;
      }
      const nextRunning = !prev.isClockRunning;
      sounds.playTap();
      return {
        ...prev,
        isClockRunning: nextRunning,
      };
    });
  }, []);

  const resetGameClock = useCallback(
    (seconds?: number) => {
      setGameState((prev) => {
        pushState(prev);
        const targetSeconds = seconds ?? prev.settings.quarterLengthMinutes * 60;
        return {
          ...prev,
          gameClockSeconds: targetSeconds,
          isClockRunning: false,
        };
      });
    },
    [pushState]
  );

  const setGameClockTime = useCallback(
    (seconds: number) => {
      setGameState((prev) => {
        pushState(prev);
        return {
          ...prev,
          gameClockSeconds: Math.max(0, seconds),
        };
      });
    },
    [pushState]
  );

  const adjustGameClock = useCallback((deltaSeconds: number) => {
    setGameState((prev) => ({
      ...prev,
      gameClockSeconds: Math.max(0, prev.gameClockSeconds + deltaSeconds),
    }));
  }, []);

  const resetShotClock = useCallback(
    (seconds?: number) => {
      setGameState((prev) => {
        const sec = seconds ?? prev.settings.shotClockSeconds;
        sounds.playTap();
        return {
          ...prev,
          shotClockSeconds: sec,
        };
      });
    },
    []
  );

  // Quarter Transitions: Reset TEAM FOULS to 0 each quarter, keep PERSONAL FOULS intact!
  const nextQuarter = useCallback(() => {
    setGameState((prev) => {
      pushState(prev);
      sounds.playBuzzer();
      return {
        ...prev,
        quarter: prev.quarter + 1,
        gameClockSeconds: prev.settings.quarterLengthMinutes * 60,
        shotClockSeconds: prev.settings.shotClockSeconds,
        isClockRunning: false,
        activeTimeout: null,
        // Team fouls for quarter reset to 0; all players' personal fouls (pf) remain intact!
        homeTeam: { ...prev.homeTeam, fouls: 0 },
        awayTeam: { ...prev.awayTeam, fouls: 0 },
      };
    });
  }, [pushState]);

  const previousQuarter = useCallback(() => {
    setGameState((prev) => {
      if (prev.quarter <= 1) return prev;
      pushState(prev);
      return {
        ...prev,
        quarter: prev.quarter - 1,
        gameClockSeconds: prev.settings.quarterLengthMinutes * 60,
        isClockRunning: false,
        activeTimeout: null,
        homeTeam: { ...prev.homeTeam, fouls: 0 },
        awayTeam: { ...prev.awayTeam, fouls: 0 },
      };
    });
  }, [pushState]);

  // Possession Toggle: Reset Shot Clock when possession changes!
  const togglePossession = useCallback(() => {
    setGameState((prev) => {
      sounds.playTap();
      return {
        ...prev,
        possession: prev.possession === 'home' ? 'away' : 'home',
        shotClockSeconds: prev.settings.shotClockSeconds, // Reset shot clock to 24s on possession change!
      };
    });
  }, []);

  // Timeout logic: Switches clock to 1-minute (60s) timer, pauses game clock, restores it paused when done
  const recordTimeout = useCallback(
    (teamSide: TeamSide) => {
      setGameState((prev) => {
        pushState(prev);
        const team = teamSide === 'home' ? prev.homeTeam : prev.awayTeam;
        if (team.timeoutsRemaining <= 0) return prev;

        sounds.playWhistle();

        const updatedHome =
          teamSide === 'home'
            ? { ...prev.homeTeam, timeoutsRemaining: prev.homeTeam.timeoutsRemaining - 1 }
            : prev.homeTeam;
        const updatedAway =
          teamSide === 'away'
            ? { ...prev.awayTeam, timeoutsRemaining: prev.awayTeam.timeoutsRemaining - 1 }
            : prev.awayTeam;

        const newEvent: PlayByPlayEvent = {
          id: `to-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          gameTime: formatTime(prev.gameClockSeconds),
          quarter: prev.quarter,
          teamSide,
          teamName: team.name,
          actionType: 'TIMEOUT',
          description: `${team.name} Full Timeout Called (60s Timer Started)`,
          pointsAdded: 0,
        };

        const activeTimeout: ActiveTimeout = {
          teamSide,
          teamName: team.name,
          secondsRemaining: 60, // 1 minute countdown timer
          savedGameClockSeconds: prev.gameClockSeconds, // Save previous game clock time
        };

        return {
          ...prev,
          isClockRunning: false, // pause game clock on timeout
          activeTimeout,
          homeTeam: updatedHome,
          awayTeam: updatedAway,
          playByPlay: [newEvent, ...prev.playByPlay],
        };
      });
    },
    [pushState]
  );

  // End timeout early or resume court (returns clock to saved time, paused)
  const endTimeout = useCallback(() => {
    setGameState((prev) => {
      if (!prev.activeTimeout) return prev;
      sounds.playWhistle();
      return {
        ...prev,
        gameClockSeconds: prev.activeTimeout.savedGameClockSeconds, // restore to earlier game clock time
        isClockRunning: false, // remains paused
        activeTimeout: null,
      };
    });
  }, []);

  const adjustTimeout = useCallback((deltaSeconds: number) => {
    setGameState((prev) => {
      if (!prev.activeTimeout) return prev;
      return {
        ...prev,
        activeTimeout: {
          ...prev.activeTimeout,
          secondsRemaining: Math.max(0, prev.activeTimeout.secondsRemaining + deltaSeconds),
        },
      };
    });
  }, []);

  const updateSettings = useCallback((newSettings: Partial<GameState['settings']>) => {
    setGameState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(initialGameState);
    setHistory([]);
    setRedoStack([]);
    sounds.playTap();
  }, []);

  // Main game clock timer effect: ticks game clock AND updates active on-court players' minutesPlayed!
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (gameState.isClockRunning && !gameState.activeTimeout) {
      interval = setInterval(() => {
        setGameState((prev) => {
          if (!prev.isClockRunning || prev.activeTimeout) return prev;

          // Check if game clock ended
          if (prev.gameClockSeconds <= 1) {
            sounds.playBuzzer();
            return {
              ...prev,
              gameClockSeconds: 0,
              isClockRunning: false,
            };
          }

          const nextGameSec = prev.gameClockSeconds - 1;
          let nextShotSec = prev.shotClockSeconds - 1;

          if (nextShotSec <= 0) {
            sounds.playBuzzer();
            nextShotSec = 0;
          }

          // Advance playing time (secondsPlayed) for all active 5 players on court for both teams!
          const updateActiveMinutes = (team: typeof prev.homeTeam) => ({
            ...team,
            players: team.players.map((p) =>
              p.isOnCourt ? { ...p, stats: { ...p.stats, secondsPlayed: p.stats.secondsPlayed + 1 } } : p
            ),
          });

          return {
            ...prev,
            gameClockSeconds: nextGameSec,
            shotClockSeconds: nextShotSec,
            homeTeam: updateActiveMinutes(prev.homeTeam),
            awayTeam: updateActiveMinutes(prev.awayTeam),
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.isClockRunning, gameState.activeTimeout]);

  // Timeout 60-second Countdown Timer Effect
  useEffect(() => {
    let timeoutInterval: NodeJS.Timeout | null = null;

    if (gameState.activeTimeout) {
      timeoutInterval = setInterval(() => {
        setGameState((prev) => {
          if (!prev.activeTimeout) return prev;

          // 10s warning sound
          if (prev.activeTimeout.secondsRemaining === 11) {
            sounds.playWhistle();
          }

          // Timeout expired at 0
          if (prev.activeTimeout.secondsRemaining <= 1) {
            sounds.playBuzzer();
            return {
              ...prev,
              gameClockSeconds: prev.activeTimeout.savedGameClockSeconds, // Restore previous game clock time!
              isClockRunning: false, // PAUSED as requested!
              activeTimeout: null,
            };
          }

          return {
            ...prev,
            activeTimeout: {
              ...prev.activeTimeout,
              secondsRemaining: prev.activeTimeout.secondsRemaining - 1,
            },
          };
        });
      }, 1000);
    }

    return () => {
      if (timeoutInterval) clearInterval(timeoutInterval);
    };
  }, [Boolean(gameState.activeTimeout)]);

  // Keyboard shortcut listener (Space = clock, Ctrl+Z = undo, Ctrl+Y = redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        toggleClock();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleClock, undo, redo]);

  return (
    <GameContext.Provider
      value={{
        gameState,
        canUndo: history.length > 0,
        canRedo: redoStack.length > 0,
        undo,
        redo,
        setGameStatus,
        startNewGame,
        adjustPlayerMinutes,
        recordStat,
        substitutePlayer,
        toggleClock,
        resetGameClock,
        setGameClockTime,
        resetShotClock,
        adjustGameClock,
        nextQuarter,
        previousQuarter,
        togglePossession,
        recordTimeout,
        endTimeout,
        adjustTimeout,
        updateSettings,
        resetGame,
        pendingAssist,
        resolveAssist,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
