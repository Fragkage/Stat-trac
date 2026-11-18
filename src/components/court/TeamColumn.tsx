'use client';

import React, { useState } from 'react';
import { Player, Team, TeamSide } from '../../types/basketball';
import { ActivePlayerCard } from './ActivePlayerCard';
import { BenchRoster } from '../bench/BenchRoster';
import { SubstitutionModal } from './SubstitutionModal';
import { useGame } from '../../context/GameContext';
import { Users, Clock, ShieldAlert } from 'lucide-react';

interface TeamColumnProps {
  team: Team;
  side: TeamSide;
}

export const TeamColumn: React.FC<TeamColumnProps> = ({ team, side }) => {
  const { gameState, recordTimeout } = useGame();
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [selectedOutPlayer, setSelectedOutPlayer] = useState<Player | null>(null);
  const [selectedInPlayer, setSelectedInPlayer] = useState<Player | null>(null);

  const activePlayers = team.players.filter((p) => p.isOnCourt);
  const benchPlayers = team.players.filter((p) => !p.isOnCourt);

  const handleOpenSubForActive = (player: Player) => {
    setSelectedOutPlayer(player);
    setSelectedInPlayer(null);
    setSubModalOpen(true);
  };

  const handleOpenSubForBench = (player: Player) => {
    setSelectedInPlayer(player);
    setSelectedOutPlayer(null);
    setSubModalOpen(true);
  };

  const isHome = side === 'home';
  const isBonus = team.fouls >= gameState.settings.bonusFoulThreshold;

  return (
    <div className="flex flex-col gap-3">
      {/* Team Column Header Banner */}
      <div
        className="p-3.5 rounded-xl border flex items-center justify-between shadow-lg relative overflow-hidden"
        style={{
          backgroundColor: '#121215',
          borderColor: isHome ? '#06b6d435' : '#f43f5e35',
        }}
      >
        <div
          className={`absolute top-0 bottom-0 ${isHome ? 'left-0' : 'right-0'} w-1.5`}
          style={{ backgroundColor: team.primaryColor }}
        />

        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black font-mono text-base border shadow-inner"
            style={{
              borderColor: `${team.primaryColor}50`,
              backgroundColor: `${team.primaryColor}15`,
              color: team.primaryColor,
            }}
          >
            {team.abbreviation}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider">
                {team.city}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 uppercase">
                {isHome ? 'HOME' : 'AWAY'}
              </span>
            </div>
            <h3 className="text-lg font-black uppercase text-white tracking-tight leading-none mt-0.5">
              {team.name}
            </h3>
          </div>
        </div>

        {/* Quick Action Badges & Timeout */}
        <div className="flex items-center gap-2">
          {/* Quarter Fouls Pill */}
          <div
            className={`px-2 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1 border ${
              isBonus
                ? 'bg-amber-950/60 text-amber-300 border-amber-500/60'
                : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60'
            }`}
            title="Team Fouls in current quarter (resets to 0 each quarter)"
          >
            <span>QTR Fouls:</span>
            <span className={isBonus ? 'text-amber-400 font-black' : 'text-zinc-200'}>
              {team.fouls}
            </span>
            {isBonus && (
              <span className="text-[9px] px-1 bg-amber-500/30 text-amber-300 rounded font-black uppercase">
                BONUS
              </span>
            )}
          </div>

          {/* Active 5 Count pill */}
          <div
            className={`px-2 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1 border ${
              activePlayers.length === 5
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-950/40 text-rose-300 border-rose-500/50 animate-pulse'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{activePlayers.length}/5 On Court</span>
          </div>

          {/* Quick Timeout button */}
          <button
            onClick={() => recordTimeout(side)}
            disabled={team.timeoutsRemaining <= 0 || Boolean(gameState.activeTimeout)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold disabled:opacity-40 transition-all active:scale-95"
            title="Call 60-Second Team Timeout"
          >
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Timeout ({team.timeoutsRemaining})</span>
          </button>
        </div>
      </div>

      {/* Warning if court has != 5 players */}
      {activePlayers.length !== 5 && (
        <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/60 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Illegal Court Roster: {activePlayers.length} players active (Requires 5).</span>
          </div>
          <button
            onClick={() => {
              setSelectedInPlayer(benchPlayers[0] || null);
              setSubModalOpen(true);
            }}
            className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold"
          >
            Fix Lineup
          </button>
        </div>
      )}

      {/* 5 ACTIVE PLAYERS ON COURT */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          <span>Active 5 Lineup (On Court)</span>
          <span className="text-zinc-500 font-mono">Tap stats to add • Tap − to correct</span>
        </div>

        {activePlayers.map((player) => (
          <ActivePlayerCard
            key={player.id}
            player={player}
            teamSide={side}
            primaryColor={team.primaryColor}
            onOpenSubModal={handleOpenSubForActive}
          />
        ))}
      </div>

      {/* BENCH ROSTER SECTION */}
      <div className="mt-2">
        <BenchRoster
          benchPlayers={benchPlayers}
          activePlayers={activePlayers}
          teamSide={side}
          teamName={team.name}
          primaryColor={team.primaryColor}
          onQuickSubBenchPlayer={handleOpenSubForBench}
        />
      </div>

      {/* Sub Modal */}
      <SubstitutionModal
        isOpen={subModalOpen}
        onClose={() => {
          setSubModalOpen(false);
          setSelectedOutPlayer(null);
          setSelectedInPlayer(null);
        }}
        teamSide={side}
        initialOutPlayer={selectedOutPlayer}
        initialInPlayer={selectedInPlayer}
      />
    </div>
  );
};
