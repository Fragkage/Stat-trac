'use client';

import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { TeamColumn } from './TeamColumn';

export const SplitCourtView: React.FC = () => {
  const { gameState } = useGame();
  const { homeTeam, awayTeam } = gameState;
  const [mobileTab, setMobileTab] = useState<'home' | 'away'>('home');

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4">
      {/* Mobile Team Switcher (Visible on mobile/small screens only) */}
      <div className="lg:hidden flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800 mb-3 shadow-md">
        <button
          onClick={() => setMobileTab('home')}
          className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            mobileTab === 'home'
              ? 'bg-zinc-800 text-white shadow border border-cyan-500/50'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: homeTeam.primaryColor }}
          />
          <span>{homeTeam.name}</span>
          <span className="font-mono text-cyan-400 font-black">({homeTeam.score})</span>
        </button>

        <button
          onClick={() => setMobileTab('away')}
          className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            mobileTab === 'away'
              ? 'bg-zinc-800 text-white shadow border border-rose-500/50'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: awayTeam.primaryColor }}
          />
          <span>{awayTeam.name}</span>
          <span className="font-mono text-rose-400 font-black">({awayTeam.score})</span>
        </button>
      </div>

      {/* Side-by-Side Grid for Desktop, Tabbed for Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Home Team Column */}
        <div className={mobileTab === 'home' ? 'block' : 'hidden lg:block'}>
          <TeamColumn team={homeTeam} side="home" />
        </div>

        {/* Away Team Column */}
        <div className={mobileTab === 'away' ? 'block' : 'hidden lg:block'}>
          <TeamColumn team={awayTeam} side="away" />
        </div>
      </div>
    </div>
  );
};
