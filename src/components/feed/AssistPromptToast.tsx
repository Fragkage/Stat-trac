'use client';

import React, { useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Sparkles, X } from 'lucide-react';

export const AssistPromptToast: React.FC = () => {
  const { pendingAssist, resolveAssist, gameState } = useGame();

  useEffect(() => {
    if (!pendingAssist) return;
    const timer = setTimeout(() => {
      resolveAssist(null);
    }, 8000); // 8 seconds auto dismiss
    return () => clearTimeout(timer);
  }, [pendingAssist, resolveAssist]);

  if (!pendingAssist) return null;

  const team = pendingAssist.teamSide === 'home' ? gameState.homeTeam : gameState.awayTeam;
  // Get other active on-court players on this team
  const otherActivePlayers = team.players.filter(
    (p) => p.isOnCourt && p.id !== pendingAssist.scoringPlayerId
  );

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slideUp w-[95%] max-w-xl">
      <div className="bg-zinc-900 border-2 border-cyan-500/80 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] p-3.5 backdrop-blur-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-cyan-500/20 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-zinc-200">
              Assist on <strong className="text-white">{pendingAssist.scoringPlayerName}</strong>&apos;s{' '}
              <span className="text-cyan-400">+{pendingAssist.points}PT</span> basket?
            </span>
          </div>

          <button
            onClick={() => resolveAssist(null)}
            className="p-1 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800"
            title="Dismiss / Unassisted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rapid Player Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {otherActivePlayers.map((player) => (
            <button
              key={player.id}
              onClick={() => resolveAssist(player.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-cyan-600/30 text-zinc-100 hover:text-white border border-zinc-700 hover:border-cyan-500 text-xs font-semibold transition-all active:scale-95"
            >
              <span className="font-mono text-[11px] text-cyan-400 font-bold">#{player.number}</span>
              <span>{player.name}</span>
            </button>
          ))}

          <button
            onClick={() => resolveAssist(null)}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs font-medium transition-colors"
          >
            No Assist (Solo)
          </button>
        </div>
      </div>
    </div>
  );
};
