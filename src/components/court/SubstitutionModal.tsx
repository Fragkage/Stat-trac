'use client';

import React from 'react';
import { Player, TeamSide } from '../../types/basketball';
import { useGame } from '../../context/GameContext';
import { X, ArrowRightLeft, ArrowDown, ArrowUp, AlertTriangle } from 'lucide-react';

interface SubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamSide: TeamSide;
  initialOutPlayer?: Player | null;
  initialInPlayer?: Player | null;
}

export const SubstitutionModal: React.FC<SubstitutionModalProps> = ({
  isOpen,
  onClose,
  teamSide,
  initialOutPlayer,
  initialInPlayer,
}) => {
  const { gameState, substitutePlayer } = useGame();

  if (!isOpen) return null;

  const team = teamSide === 'home' ? gameState.homeTeam : gameState.awayTeam;
  const activePlayers = team.players.filter((p) => p.isOnCourt);
  const benchPlayers = team.players.filter((p) => !p.isOnCourt);
  const foulLimit = gameState.settings.foulOutLimit;

  // Mode 1: We know who is coming OFF (initialOutPlayer is set)
  // Mode 2: We know who is coming ON (initialInPlayer is set)
  const isReplacingSpecificActive = Boolean(initialOutPlayer);
  const isSubbingSpecificBench = Boolean(initialInPlayer);

  const handleSelectBenchToSubIn = (benchPlayer: Player) => {
    if (!initialOutPlayer) return;
    substitutePlayer(teamSide, initialOutPlayer.id, benchPlayer.id);
    onClose();
  };

  const handleSelectActiveToSubOut = (activePlayer: Player) => {
    if (!initialInPlayer) return;
    substitutePlayer(teamSide, activePlayer.id, initialInPlayer.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: team.primaryColor }}
            />
            <h3 className="text-base font-black text-white uppercase tracking-tight">
              {team.name} Substitution
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* If Out Player is pre-selected */}
          {initialOutPlayer && (
            <div>
              <div className="flex items-center gap-1.5 text-xs uppercase font-bold text-rose-400 mb-2">
                <ArrowDown className="w-4 h-4" />
                <span>Player Leaving Court (Going to Bench)</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-rose-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-500/40 flex items-center justify-center font-mono font-bold text-rose-300 text-sm">
                    #{initialOutPlayer.number}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-zinc-100">{initialOutPlayer.name}</div>
                    <div className="text-xs text-zinc-400 font-mono">
                      {initialOutPlayer.position} • MIN: {Math.floor(initialOutPlayer.stats.secondsPlayed / 60)}:{(initialOutPlayer.stats.secondsPlayed % 60).toString().padStart(2, '0')} • {initialOutPlayer.stats.pts} PTS • {initialOutPlayer.stats.pf}/{foulLimit} PF
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                  SUB OUT
                </span>
              </div>
            </div>
          )}

          {/* If In Player is pre-selected */}
          {initialInPlayer && (
            <div>
              <div className="flex items-center gap-1.5 text-xs uppercase font-bold text-emerald-400 mb-2">
                <ArrowUp className="w-4 h-4" />
                <span>Player Entering Court (From Bench)</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-emerald-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center font-mono font-bold text-emerald-300 text-sm">
                    #{initialInPlayer.number}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-zinc-100">{initialInPlayer.name}</div>
                    <div className="text-xs text-zinc-400 font-mono">
                      {initialInPlayer.position} • MIN: {Math.floor(initialInPlayer.stats.secondsPlayed / 60)}:{(initialInPlayer.stats.secondsPlayed % 60).toString().padStart(2, '0')} • {initialInPlayer.stats.pts} PTS • {initialInPlayer.stats.pf}/{foulLimit} PF
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  SUB IN
                </span>
              </div>
            </div>
          )}

          {/* Selection List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold text-zinc-400">
                {isReplacingSpecificActive
                  ? 'Select Bench Player to Enter Court:'
                  : 'Select On-Court Player to Leave Court:'}
              </span>
              <span className="text-[11px] text-zinc-500">1-Tap to Swap</span>
            </div>

            <div className="space-y-2">
              {(isReplacingSpecificActive ? benchPlayers : activePlayers).map((candidate) => {
                const isFouledOut = candidate.stats.pf >= foulLimit;

                return (
                  <button
                    key={candidate.id}
                    disabled={isFouledOut}
                    onClick={() => {
                      if (isReplacingSpecificActive) {
                        handleSelectBenchToSubIn(candidate);
                      } else {
                        handleSelectActiveToSubOut(candidate);
                      }
                    }}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all active:scale-[0.98] ${
                      isFouledOut
                        ? 'bg-zinc-950/60 border-zinc-800 opacity-40 cursor-not-allowed'
                        : 'bg-zinc-950 hover:bg-zinc-800/90 border-zinc-800 hover:border-cyan-500/60 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm border"
                        style={{
                          borderColor: `${team.primaryColor}50`,
                          color: team.primaryColor,
                          backgroundColor: `${team.primaryColor}15`,
                        }}
                      >
                        #{candidate.number}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-zinc-100">{candidate.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                            {candidate.position}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 font-mono mt-0.5">
                          MIN: <strong className="text-cyan-400">{Math.floor(candidate.stats.secondsPlayed / 60)}:{(candidate.stats.secondsPlayed % 60).toString().padStart(2, '0')}</strong> • PTS: <strong className="text-zinc-200">{candidate.stats.pts}</strong> • REB:{' '}
                          <strong className="text-zinc-200">{candidate.stats.reb}</strong> • AST:{' '}
                          <strong className="text-zinc-200">{candidate.stats.ast}</strong> • PF:{' '}
                          <strong
                            className={
                              candidate.stats.pf >= foulLimit
                                ? 'text-rose-400'
                                : candidate.stats.pf >= foulLimit - 1
                                ? 'text-amber-400'
                                : 'text-zinc-300'
                            }
                          >
                            {candidate.stats.pf}/{foulLimit}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isFouledOut ? (
                        <span className="text-[10px] font-bold text-rose-400 uppercase">Fouled Out</span>
                      ) : (
                        <div className="px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1 group-hover:bg-cyan-600">
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>Select</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
