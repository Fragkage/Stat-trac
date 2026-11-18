'use client';

import React, { useState } from 'react';
import { Player, TeamSide } from '../../types/basketball';
import { useGame } from '../../context/GameContext';
import { ArrowDownUp, ChevronDown, ChevronUp, Users, ShieldAlert } from 'lucide-react';

interface BenchRosterProps {
  benchPlayers: Player[];
  activePlayers: Player[];
  teamSide: TeamSide;
  teamName: string;
  primaryColor: string;
  onQuickSubBenchPlayer: (benchPlayer: Player) => void;
}

export const BenchRoster: React.FC<BenchRosterProps> = ({
  benchPlayers,
  activePlayers,
  teamSide,
  teamName,
  primaryColor,
  onQuickSubBenchPlayer,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const { gameState } = useGame();
  const foulLimit = gameState.settings.foulOutLimit;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 overflow-hidden shadow-md">
      {/* Header bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between bg-zinc-900/90 hover:bg-zinc-800/80 transition-colors border-b border-zinc-800"
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            {teamName} Bench ({benchPlayers.length} Available)
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span>{isOpen ? 'Collapse' : 'Expand'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Bench List */}
      {isOpen && (
        <div className="p-2 space-y-1.5">
          {benchPlayers.length === 0 ? (
            <div className="text-center py-4 text-xs text-zinc-500">No bench players remaining.</div>
          ) : (
            benchPlayers.map((player) => {
              const isFouledOut = player.stats.pf >= foulLimit;

              return (
                <div
                  key={player.id}
                  className={`p-2 rounded-lg border flex items-center justify-between transition-all ${
                    isFouledOut
                      ? 'bg-rose-950/20 border-rose-900/50 opacity-60'
                      : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800/70 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Jersey */}
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center font-mono font-bold text-xs border"
                      style={{
                        borderColor: `${primaryColor}40`,
                        color: primaryColor,
                        backgroundColor: `${primaryColor}15`,
                      }}
                    >
                      #{player.number}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-zinc-200">{player.name}</span>
                        <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-800 text-zinc-400">
                          {player.position}
                        </span>
                        {isFouledOut && (
                          <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Fouled Out
                          </span>
                        )}
                      </div>

                      {/* Summary stats with Minutes Played */}
                      <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 mt-0.5">
                        <span className="text-cyan-400 font-semibold">
                          MIN: {Math.floor(player.stats.secondsPlayed / 60)}:{(player.stats.secondsPlayed % 60).toString().padStart(2, '0')}
                        </span>
                        <span>•</span>
                        <span>PTS: {player.stats.pts}</span>
                        <span>•</span>
                        <span>REB: {player.stats.reb}</span>
                        <span>•</span>
                        <span>AST: {player.stats.ast}</span>
                        <span>•</span>
                        <span>
                          PF: {player.stats.pf}/{foulLimit}
                        </span>
                        <span>•</span>
                        <span>
                          +/-: {player.stats.plusMinus > 0 ? `+${player.stats.plusMinus}` : player.stats.plusMinus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sub In Button */}
                  <button
                    onClick={() => onQuickSubBenchPlayer(player)}
                    disabled={isFouledOut}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold border transition-all active:scale-95 ${
                      isFouledOut
                        ? 'border-zinc-800 bg-zinc-900 text-zinc-600 cursor-not-allowed'
                        : 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white hover:border-zinc-500 shadow-sm'
                    }`}
                  >
                    <ArrowDownUp className="w-3 h-3 text-cyan-400" />
                    <span>SUB IN</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
