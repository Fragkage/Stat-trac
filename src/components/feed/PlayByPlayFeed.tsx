'use client';

import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { PlayByPlayEvent } from '../../types/basketball';
import {
  History,
  X,
  RotateCcw,
  Flame,
  Shield,
  ArrowRightLeft,
  AlertCircle,
  Filter,
} from 'lucide-react';

interface PlayByPlayFeedProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayByPlayFeed: React.FC<PlayByPlayFeedProps> = ({ isOpen, onClose }) => {
  const { gameState, undo, canUndo } = useGame();
  const [filterType, setFilterType] = useState<'ALL' | 'SCORING' | 'FOULS' | 'SUBS'>('ALL');

  if (!isOpen) return null;

  const { playByPlay, homeTeam, awayTeam } = gameState;

  const filteredEvents = playByPlay.filter((e) => {
    if (filterType === 'SCORING') return e.pointsAdded > 0;
    if (filterType === 'FOULS') return e.actionType === 'PF' || e.actionType === 'TF';
    if (filterType === 'SUBS') return e.actionType === 'SUB_IN' || e.actionType === 'SUB_OUT';
    return true;
  });

  const getActionBadge = (event: PlayByPlayEvent) => {
    switch (event.actionType) {
      case '3PT_MADE':
        return (
          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-black uppercase font-mono">
            +3 3PT
          </span>
        );
      case '2PT_MADE':
        return (
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase font-mono">
            +2 2PT
          </span>
        );
      case 'FT_MADE':
        return (
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase font-mono">
            +1 FT
          </span>
        );
      case '2PT_MISS':
      case '3PT_MISS':
      case 'FT_MISS':
        return (
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-bold uppercase font-mono">
            MISS
          </span>
        );
      case 'OREB':
        return (
          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold uppercase font-mono">
            OREB
          </span>
        );
      case 'DREB':
        return (
          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold uppercase font-mono">
            DREB
          </span>
        );
      case 'AST':
        return (
          <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-bold uppercase font-mono">
            AST
          </span>
        );
      case 'STL':
        return (
          <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-bold uppercase font-mono">
            STL
          </span>
        );
      case 'BLK':
        return (
          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold uppercase font-mono">
            BLK
          </span>
        );
      case 'TOV':
        return (
          <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[10px] font-bold uppercase font-mono">
            TOV
          </span>
        );
      case 'PF':
      case 'TF':
        return (
          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold uppercase font-mono">
            FOUL
          </span>
        );
      case 'SUB_IN':
        return (
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-cyan-300 border border-zinc-700 text-[10px] font-bold uppercase font-mono flex items-center gap-1">
            <ArrowRightLeft className="w-2.5 h-2.5" />
            SUB
          </span>
        );
      case 'TIMEOUT':
        return (
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700 text-[10px] font-bold uppercase font-mono">
            TIMEOUT
          </span>
        );
      default:
        if (event.actionType.startsWith('SUB_')) {
          return (
            <span className="px-1.5 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-500/40 text-[10px] font-bold uppercase font-mono">
              CORRECTION
            </span>
          );
        }
        return null;
    }
  };

  return (
    <aside className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-zinc-950 border-l border-zinc-800 z-50 shadow-2xl flex flex-col animate-slideLeft">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase text-white tracking-wider">Play-by-Play Feed</h3>
          <span className="text-xs font-mono text-zinc-500">({playByPlay.length})</span>
        </div>

        <div className="flex items-center gap-2">
          {canUndo && (
            <button
              onClick={undo}
              title="Undo Most Recent Event"
              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded flex items-center gap-1 border border-zinc-700"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>Undo Last</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-zinc-800/80 bg-zinc-900/30 text-xs font-semibold text-zinc-400">
        {(['ALL', 'SCORING', 'FOULS', 'SUBS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`flex-1 py-1 rounded text-[11px] uppercase tracking-wider transition-colors ${
              filterType === tab
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'hover:text-zinc-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-xs">No play-by-play events recorded yet.</div>
        ) : (
          filteredEvents.map((event, index) => {
            const isHome = event.teamSide === 'home';
            const team = isHome ? homeTeam : awayTeam;

            return (
              <div
                key={event.id}
                className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 transition-all text-xs flex items-start gap-2.5 group"
              >
                {/* Team Tag */}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] shrink-0 border"
                  style={{
                    borderColor: `${team.primaryColor}50`,
                    color: team.primaryColor,
                    backgroundColor: `${team.primaryColor}15`,
                  }}
                >
                  {team.abbreviation}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-zinc-400 font-semibold">
                        Q{event.quarter} {event.gameTime}
                      </span>
                      {getActionBadge(event)}
                    </div>
                    <span className="text-[10px] text-zinc-600 font-mono">{event.timestamp}</span>
                  </div>

                  <p className="text-zinc-200 text-xs leading-snug">{event.description}</p>
                </div>

                {/* Undo specific latest item if it's the very first */}
                {index === 0 && canUndo && (
                  <button
                    onClick={undo}
                    title="Undo this action"
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded transition-opacity"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
