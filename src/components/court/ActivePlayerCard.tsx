'use client';

import React, { useState } from 'react';
import { Player, TeamSide } from '../../types/basketball';
import { useGame } from '../../context/GameContext';
import { triggerShotConfetti } from '../../utils/confetti';
import {
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Flame,
  ArrowRightLeft,
  XCircle,
  Clock,
  Timer,
  Plus,
  Minus,
} from 'lucide-react';

interface ActivePlayerCardProps {
  player: Player;
  teamSide: TeamSide;
  primaryColor: string;
  onOpenSubModal: (player: Player) => void;
}

export const ActivePlayerCard: React.FC<ActivePlayerCardProps> = ({
  player,
  teamSide,
  primaryColor,
  onOpenSubModal,
}) => {
  const { recordStat, gameState, adjustPlayerMinutes } = useGame();
  const [isExpanded, setIsExpanded] = useState(false);

  const { stats } = player;
  const foulLimit = gameState.settings.foulOutLimit;
  const isFouledOut = stats.pf >= foulLimit;
  const isFoulDanger = stats.pf === foulLimit - 1;

  // Format seconds to mm:ss
  const formatMinutesPlayed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Format plus/minus string
  const formatPlusMinus = (val: number) => {
    if (val > 0) return `+${val}`;
    return `${val}`;
  };

  const handle2PtMade = () => {
    recordStat({ teamSide, playerId: player.id, actionType: '2PT_MADE' });
  };

  const handle3PtMade = () => {
    recordStat({ teamSide, playerId: player.id, actionType: '3PT_MADE' });
    triggerShotConfetti(primaryColor);
  };

  const handleFtMade = () => {
    recordStat({ teamSide, playerId: player.id, actionType: 'FT_MADE' });
  };

  const handleDreb = () => {
    recordStat({ teamSide, playerId: player.id, actionType: 'DREB' });
  };

  const handleOreb = () => {
    recordStat({ teamSide, playerId: player.id, actionType: 'OREB' });
  };

  const handleAst = () => {
    recordStat({ teamSide, playerId: player.id, actionType: 'AST' });
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 relative overflow-hidden shadow-lg ${
        isFouledOut
          ? 'bg-rose-950/20 border-rose-500/70 shadow-rose-950/50'
          : isFoulDanger
          ? 'bg-zinc-900/90 border-amber-500/60 shadow-amber-950/20'
          : 'bg-zinc-900/85 hover:bg-zinc-900 border-zinc-800/90 hover:border-zinc-700'
      }`}
    >
      {/* Side Color stripe */}
      <div
        className="absolute top-0 bottom-0 left-0 w-1.5"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Fouled Out Warning Banner */}
      {isFouledOut && (
        <div className="bg-rose-600 px-3 py-1 text-center flex items-center justify-center gap-1.5 text-white text-[11px] font-black uppercase tracking-wider animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>FOULED OUT ({stats.pf}/{foulLimit} PERSONAL FOULS) - SUBSTITUTION REQUIRED</span>
          <button
            onClick={() => onOpenSubModal(player)}
            className="ml-2 px-2 py-0.2 bg-white text-rose-700 rounded text-[10px] font-bold hover:bg-zinc-100"
          >
            SUB NOW
          </button>
        </div>
      )}

      {/* Player Header & Stat Summary Strip */}
      <div className="p-3 pl-4 flex items-center justify-between border-b border-zinc-800/60">
        <div className="flex items-center gap-2.5">
          {/* Jersey Number */}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm font-mono shadow-inner text-white select-none"
            style={{
              backgroundColor: `${primaryColor}25`,
              borderColor: `${primaryColor}60`,
              borderWidth: '1.5px',
              color: primaryColor,
            }}
          >
            #{player.number}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-zinc-100 truncate max-w-[140px] sm:max-w-[180px]">
                {player.name}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                {player.position}
              </span>
              {stats.pts >= 15 && (
                <span title="Scoring Hot Hand" className="text-amber-400">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                </span>
              )}
            </div>

            {/* Quick Live Stats Pill with Live Playing Time */}
            <div className="flex items-center gap-2 mt-0.5 text-xs font-mono text-zinc-400">
              {/* Playing Time Live Counter */}
              <span
                className={`flex items-center gap-1 font-semibold ${
                  gameState.isClockRunning && player.isOnCourt ? 'text-cyan-300' : 'text-zinc-400'
                }`}
                title="Minutes played on court (updates live while game clock runs)"
              >
                <Clock className={`w-3 h-3 ${gameState.isClockRunning && player.isOnCourt ? 'text-cyan-400 animate-spin' : 'text-zinc-500'}`} />
                <span>{formatMinutesPlayed(stats.secondsPlayed)}</span>
              </span>

              <span className="text-zinc-700">•</span>
              <span className="text-white font-bold">
                <span className="text-zinc-500 font-normal">PTS:</span> {stats.pts}
              </span>
              <span className="text-zinc-700">•</span>
              <span>
                <span className="text-zinc-500">REB:</span> {stats.reb}
              </span>
              <span className="text-zinc-700">•</span>
              <span>
                <span className="text-zinc-500">AST:</span> {stats.ast}
              </span>
              <span className="text-zinc-700">•</span>
              <span
                className={`font-semibold ${
                  stats.plusMinus > 0
                    ? 'text-emerald-400'
                    : stats.plusMinus < 0
                    ? 'text-rose-400'
                    : 'text-zinc-400'
                }`}
              >
                <span className="text-zinc-500 font-normal">+/-:</span> {formatPlusMinus(stats.plusMinus)}
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Fouls badge & Sub button */}
        <div className="flex items-center gap-2">
          {/* Foul indicators: Personal fouls persist entire game */}
          <div
            className={`px-2 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1 border ${
              isFouledOut
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                : isFoulDanger
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60'
            }`}
            title={`Cumulative Personal Fouls: ${stats.pf}/${foulLimit} (Does not reset per quarter)`}
          >
            <span>PF:</span>
            <span
              className={
                isFouledOut ? 'text-rose-400 font-black' : isFoulDanger ? 'text-amber-400 font-black' : 'text-zinc-200'
              }
            >
              {stats.pf}/{foulLimit}
            </span>
          </div>

          {/* Quick Sub button */}
          <button
            onClick={() => onOpenSubModal(player)}
            title="Substitute player"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-semibold transition-all active:scale-95"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">SUB</span>
          </button>
        </div>
      </div>

      {/* High-Frequency Primary Action Buttons Grid (With Error Correction / Subtract Badges on Every Button) */}
      <div className="p-2 sm:p-2.5 grid grid-cols-5 gap-1.5 sm:gap-2">
        {/* +2 PTS BUTTON with -2 Subtract Badge */}
        <div className="relative">
          <button
            onClick={handle2PtMade}
            disabled={isFouledOut}
            className="w-full flex flex-col items-center justify-center py-2.5 sm:py-3 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 active:bg-emerald-800 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 font-bold transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none group shadow-sm"
          >
            <span className="text-base sm:text-lg font-black tracking-tight group-hover:scale-105 transition-transform">
              +2
            </span>
            <span className="text-[10px] text-emerald-400/80 font-mono font-medium uppercase tracking-tight">
              2PT Made
            </span>
          </button>
          {/* Subtract -2 Badge */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              recordStat({ teamSide, playerId: player.id, actionType: 'SUB_2PT_MADE' });
            }}
            disabled={stats.pts < 2 || stats.fgm < 1}
            title="Error Correction: Subtract 2PT (-2 PTS, -1 FGM)"
            className="absolute -top-1.5 -right-1 text-[9px] font-black px-1.5 py-0.2 rounded-full bg-zinc-800 hover:bg-rose-600 text-zinc-300 hover:text-white border border-zinc-600 hover:border-rose-400 shadow transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
          >
            −2
          </button>
        </div>

        {/* +3 PTS BUTTON with -3 Subtract Badge */}
        <div className="relative">
          <button
            onClick={handle3PtMade}
            disabled={isFouledOut}
            className="w-full flex flex-col items-center justify-center py-2.5 sm:py-3 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 active:bg-indigo-800 border border-indigo-500/40 hover:border-indigo-400 text-indigo-300 font-bold transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none group shadow-sm"
          >
            <span className="text-base sm:text-lg font-black tracking-tight group-hover:scale-105 transition-transform">
              +3
            </span>
            <span className="text-[10px] text-indigo-400/80 font-mono font-medium uppercase tracking-tight">
              3PT Made
            </span>
          </button>
          {/* Subtract -3 Badge */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              recordStat({ teamSide, playerId: player.id, actionType: 'SUB_3PT_MADE' });
            }}
            disabled={stats.pts < 3 || stats.fg3m < 1}
            title="Error Correction: Subtract 3PT (-3 PTS, -1 3PM)"
            className="absolute -top-1.5 -right-1 text-[9px] font-black px-1.5 py-0.2 rounded-full bg-zinc-800 hover:bg-rose-600 text-zinc-300 hover:text-white border border-zinc-600 hover:border-rose-400 shadow transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
          >
            −3
          </button>
        </div>

        {/* +1 FT BUTTON with -1 Subtract Badge */}
        <div className="relative">
          <button
            onClick={handleFtMade}
            disabled={isFouledOut}
            className="w-full flex flex-col items-center justify-center py-2.5 sm:py-3 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 active:bg-amber-800 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-bold transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none group shadow-sm"
          >
            <span className="text-base sm:text-lg font-black tracking-tight group-hover:scale-105 transition-transform">
              +1
            </span>
            <span className="text-[10px] text-amber-400/80 font-mono font-medium uppercase tracking-tight">
              FT Made
            </span>
          </button>
          {/* Subtract -1 Badge */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              recordStat({ teamSide, playerId: player.id, actionType: 'SUB_FT_MADE' });
            }}
            disabled={stats.pts < 1 || stats.ftm < 1}
            title="Error Correction: Subtract FT (-1 PTS, -1 FTM)"
            className="absolute -top-1.5 -right-1 text-[9px] font-black px-1.5 py-0.2 rounded-full bg-zinc-800 hover:bg-rose-600 text-zinc-300 hover:text-white border border-zinc-600 hover:border-rose-400 shadow transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
          >
            −1
          </button>
        </div>

        {/* REB BUTTON with +OREB and -REB Badges */}
        <div className="relative">
          <button
            onClick={handleDreb}
            disabled={isFouledOut}
            className="w-full h-full flex flex-col items-center justify-center py-2.5 sm:py-3 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 active:bg-cyan-800 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-bold transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none group shadow-sm"
          >
            <span className="text-sm sm:text-base font-black tracking-tight">
              +REB
            </span>
            <span className="text-[9px] text-cyan-400/80 font-mono font-medium uppercase">
              DREB ({stats.dreb})
            </span>
          </button>

          {/* Quick +OREB Badge */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOreb();
            }}
            disabled={isFouledOut}
            title="Log Offensive Rebound (OREB)"
            className="absolute -top-1.5 -right-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400 shadow-sm transition-all active:scale-90"
          >
            +OREB
          </button>

          {/* Subtract Rebound Badge */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              recordStat({ teamSide, playerId: player.id, actionType: 'SUB_DREB' });
            }}
            disabled={stats.reb < 1}
            title="Error Correction: Subtract Rebound (-1 REB)"
            className="absolute -top-1.5 -left-1 text-[9px] font-black px-1.5 py-0.2 rounded-full bg-zinc-800 hover:bg-rose-600 text-zinc-300 hover:text-white border border-zinc-600 hover:border-rose-400 shadow transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
          >
            −1
          </button>
        </div>

        {/* AST BUTTON with -AST Subtract Badge */}
        <div className="relative">
          <button
            onClick={handleAst}
            disabled={isFouledOut}
            className="w-full flex flex-col items-center justify-center py-2.5 sm:py-3 rounded-lg bg-sky-950/40 hover:bg-sky-900/60 active:bg-sky-800 border border-sky-500/40 hover:border-sky-400 text-sky-300 font-bold transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none group shadow-sm"
          >
            <span className="text-sm sm:text-base font-black tracking-tight group-hover:scale-105 transition-transform">
              +AST
            </span>
            <span className="text-[10px] text-sky-400/80 font-mono font-medium uppercase tracking-tight">
              Assist ({stats.ast})
            </span>
          </button>
          {/* Subtract -AST Badge */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              recordStat({ teamSide, playerId: player.id, actionType: 'SUB_AST' });
            }}
            disabled={stats.ast < 1}
            title="Error Correction: Subtract Assist (-1 AST)"
            className="absolute -top-1.5 -right-1 text-[9px] font-black px-1.5 py-0.2 rounded-full bg-zinc-800 hover:bg-rose-600 text-zinc-300 hover:text-white border border-zinc-600 hover:border-rose-400 shadow transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
          >
            −1
          </button>
        </div>
      </div>

      {/* Expand/Collapse Low Frequency & Pro Stats Bar */}
      <div className="px-3 py-1 bg-zinc-950/50 flex items-center justify-between border-t border-zinc-800/40 text-[11px] text-zinc-400">
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>
            FG: {stats.fgm}/{stats.fga} ({stats.fga > 0 ? Math.round((stats.fgm / stats.fga) * 100) : 0}%)
          </span>
          <span>
            3PT: {stats.fg3m}/{stats.fg3a}
          </span>
          <span>
            FT: {stats.ftm}/{stats.fta}
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors py-0.5"
        >
          <span>{isExpanded ? 'Less' : 'More Stats (+/−)'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Low-Frequency Stats (Playing Time adjust, Misses, Defense, Negatives with Error Corrections) */}
      {isExpanded && (
        <div className="p-3 bg-zinc-950/80 border-t border-zinc-800 space-y-2.5 animate-fadeIn">
          {/* Live Playing Time Manual Calibration */}
          <div className="p-2 rounded-lg bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-[10px] uppercase font-bold text-zinc-400">Court Time Tracker</div>
                <div className="text-xs font-mono font-bold text-cyan-300">
                  {formatMinutesPlayed(stats.secondsPlayed)} ({Math.round(stats.secondsPlayed / 60)} mins)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] text-zinc-500 font-mono mr-1">Adjust:</span>
              <button
                onClick={() => adjustPlayerMinutes(teamSide, player.id, -1)}
                disabled={stats.secondsPlayed < 60}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono font-bold border border-zinc-700 disabled:opacity-30"
                title="Subtract 1 minute"
              >
                -1m
              </button>
              <button
                onClick={() => adjustPlayerMinutes(teamSide, player.id, 1)}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono font-bold border border-zinc-700"
                title="Add 1 minute"
              >
                +1m
              </button>
            </div>
          </div>

          {/* Missed Shots row with + / - buttons */}
          <div>
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-500 mb-1 tracking-wider">
              <span>Log / Correct Missed Shots</span>
              <span className="text-zinc-600 font-mono">Tap + to add, − to subtract</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {/* Miss 2PT */}
              <div className="flex rounded-lg bg-zinc-900 border border-zinc-700/80 overflow-hidden">
                <button
                  onClick={() => recordStat({ teamSide, playerId: player.id, actionType: '2PT_MISS' })}
                  disabled={isFouledOut}
                  className="flex-1 py-1.5 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-95 disabled:opacity-40"
                >
                  <XCircle className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Miss 2PT</span>
                </button>
                <button
                  onClick={() => recordStat({ teamSide, playerId: player.id, actionType: 'SUB_2PT_MISS' })}
                  disabled={stats.fga < 1}
                  title="Subtract 2PT Miss"
                  className="px-2 bg-zinc-950 hover:bg-rose-950/80 hover:text-rose-300 text-zinc-500 border-l border-zinc-800 text-xs font-bold disabled:opacity-20"
                >
                  −
                </button>
              </div>

              {/* Miss 3PT */}
              <div className="flex rounded-lg bg-zinc-900 border border-zinc-700/80 overflow-hidden">
                <button
                  onClick={() => recordStat({ teamSide, playerId: player.id, actionType: '3PT_MISS' })}
                  disabled={isFouledOut}
                  className="flex-1 py-1.5 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-95 disabled:opacity-40"
                >
                  <XCircle className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Miss 3PT</span>
                </button>
                <button
                  onClick={() => recordStat({ teamSide, playerId: player.id, actionType: 'SUB_3PT_MISS' })}
                  disabled={stats.fg3a < 1}
                  title="Subtract 3PT Miss"
                  className="px-2 bg-zinc-950 hover:bg-rose-950/80 hover:text-rose-300 text-zinc-500 border-l border-zinc-800 text-xs font-bold disabled:opacity-20"
                >
                  −
                </button>
              </div>

              {/* Miss FT */}
              <div className="flex rounded-lg bg-zinc-900 border border-zinc-700/80 overflow-hidden">
                <button
                  onClick={() => recordStat({ teamSide, playerId: player.id, actionType: 'FT_MISS' })}
                  disabled={isFouledOut}
                  className="flex-1 py-1.5 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-95 disabled:opacity-40"
                >
                  <XCircle className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Miss FT</span>
                </button>
                <button
                  onClick={() => recordStat({ teamSide, playerId: player.id, actionType: 'SUB_FT_MISS' })}
                  disabled={stats.fta < 1}
                  title="Subtract FT Miss"
                  className="px-2 bg-zinc-950 hover:bg-rose-950/80 hover:text-rose-300 text-zinc-500 border-l border-zinc-800 text-xs font-bold disabled:opacity-20"
                >
                  −
                </button>
              </div>
            </div>
          </div>

          {/* Defense & Violations with + and - on every single button */}
          <div>
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-500 mb-1 tracking-wider">
              <span>Defense & Fouls (PF counts as Team Foul)</span>
              <span className="text-zinc-600 font-mono">Use − to correct mistakes</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {/* STL */}
              <div className="flex rounded-lg bg-teal-950/30 border border-teal-500/40 overflow-hidden">
                <button
                  onClick={() => recordStat({ teamSide, playerId: player.id, actionType: 'STL' })}
                  disabled={isFouledOut}
                  className="flex-1 py-1.5 hover:bg-teal-900/60 text-teal-300 text-xs font-bold transition-all disabled:opacity-40"
                >
                  +STL ({stats.stl})
                </button>
                <button
                  onClick={() => recordStat({ teamSide, playerId: player.id, actionType: 'SUB_STL' })}
                  disabled={stats.stl < 1}
                  title="Subtract Steal"
                  className="px-1.5 bg-teal-950 hover:bg-rose-950 text-teal-400 hover:text-rose-300 border-l border-teal-500/30 text-xs font-bold disabled:opacity-20"
                >
                  −
                </button>
              </div>

              {/* BLK */}
              <div className="flex rounded-lg bg-blue-950/30 border border-blue-500/40 overflow-hidden">
                <button
                  onClick={() => recordStat({ teamSide, playerId: player.id, actionType: 'BLK' })}
                  disabled={isFouledOut}
                  className="flex-1 py-1.5 hover:bg-blue-900/60 text-blue-300 text-xs font-bold transition-all disabled:opacity-40"
                >
                  +BLK ({stats.blk})
                </button>
                <button
                  onClick={() => recordStat({ teamSide, playerId: player.id, actionType: 'SUB_BLK' })}
                  disabled={stats.blk < 1}
                  title="Subtract Block"
                  className="px-1.5 bg-blue-950 hover:bg-rose-950 text-blue-400 hover:text-rose-300 border-l border-blue-500/30 text-xs font-bold disabled:opacity-20"
                >
                  −
                </button>
              </div>

              {/* TOV */}
              <div className="flex rounded-lg bg-orange-950/30 border border-orange-500/40 overflow-hidden">
                <button
                  onClick={() => recordStat({ teamSide, playerId: player.id, actionType: 'TOV' })}
                  disabled={isFouledOut}
                  className="flex-1 py-1.5 hover:bg-orange-900/60 text-orange-300 text-xs font-bold transition-all disabled:opacity-40"
                >
                  +TOV ({stats.tov})
                </button>
                <button
                  onClick={() => recordStat({ teamSide, playerId: player.id, actionType: 'SUB_TOV' })}
                  disabled={stats.tov < 1}
                  title="Subtract Turnover"
                  className="px-1.5 bg-orange-950 hover:bg-rose-950 text-orange-400 hover:text-rose-300 border-l border-orange-500/30 text-xs font-bold disabled:opacity-20"
                >
                  −
                </button>
              </div>

              {/* PF (Personal Foul - counts as Team Foul) */}
              <div className="flex rounded-lg bg-rose-950/30 border border-rose-500/40 overflow-hidden">
                <button
                  onClick={() => recordStat({ teamSide, playerId: player.id, actionType: 'PF' })}
                  disabled={isFouledOut}
                  className="flex-1 py-1.5 hover:bg-rose-900/60 text-rose-300 text-xs font-bold transition-all disabled:opacity-40"
                  title="Personal Foul (Increments Team Foul for quarter too)"
                >
                  +1 PF ({stats.pf})
                </button>
                <button
                  onClick={() => recordStat({ teamSide, playerId: player.id, actionType: 'SUB_PF' })}
                  disabled={stats.pf < 1}
                  title="Subtract Personal Foul (Also decrements Team Foul)"
                  className="px-1.5 bg-rose-950 hover:bg-rose-800 text-rose-300 border-l border-rose-500/30 text-xs font-bold disabled:opacity-20"
                >
                  −
                </button>
              </div>

              {/* TF (Technical Foul) */}
              <div className="flex rounded-lg bg-red-950/40 border border-red-500/50 overflow-hidden">
                <button
                  onClick={() => recordStat({ teamSide, playerId: player.id, actionType: 'TF' })}
                  className="flex-1 py-1.5 hover:bg-red-900/80 text-red-200 text-xs font-bold transition-all"
                >
                  +1 TF ({stats.tf})
                </button>
                <button
                  onClick={() => recordStat({ teamSide, playerId: player.id, actionType: 'SUB_TF' })}
                  disabled={stats.tf < 1}
                  title="Subtract Technical Foul"
                  className="px-1.5 bg-red-950 hover:bg-red-800 text-red-300 border-l border-red-500/30 text-xs font-bold disabled:opacity-20"
                >
                  −
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
