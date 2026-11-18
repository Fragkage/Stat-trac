'use client';

import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Team, Player, Position, GameSettings, TeamSide } from '../../types/basketball';
import { defaultHomeTeam, defaultAwayTeam, createEmptyStats } from '../../data/mockGame';
import {
  Trophy,
  Users,
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Palette,
  Shield,
  Clock,
  Volume2,
  Star,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface GameSetupScreenProps {
  onStartLiveGame: () => void;
  onCancel?: () => void;
}

const COLOR_PRESETS = [
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Gold', hex: '#eab308' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Crimson', hex: '#e11d48' },
  { name: 'Orange', hex: '#f97316' },
];

export const GameSetupScreen: React.FC<GameSetupScreenProps> = ({ onStartLiveGame, onCancel }) => {
  const { gameState, startNewGame } = useGame();

  // Clone teams for setup
  const [homeTeam, setHomeTeam] = useState<Team>(JSON.parse(JSON.stringify(gameState.homeTeam || defaultHomeTeam)));
  const [awayTeam, setAwayTeam] = useState<Team>(JSON.parse(JSON.stringify(gameState.awayTeam || defaultAwayTeam)));
  const [settings, setSettings] = useState<GameSettings>(JSON.parse(JSON.stringify(gameState.settings)));
  const [activeTab, setActiveTab] = useState<'rules' | 'home' | 'away'>('home');

  // Count starters
  const homeStarters = homeTeam.players.filter((p) => p.isStarter);
  const awayStarters = awayTeam.players.filter((p) => p.isStarter);

  const isHomeValid = homeStarters.length === 5 && homeTeam.players.length >= 5;
  const isAwayValid = awayStarters.length === 5 && awayTeam.players.length >= 5;
  const isValidToLaunch = isHomeValid && isAwayValid;

  // Add new player to a team
  const handleAddPlayer = (side: TeamSide) => {
    const isHome = side === 'home';
    const team = isHome ? homeTeam : awayTeam;
    const setter = isHome ? setHomeTeam : setAwayTeam;

    const currentCount = team.players.length;
    const newNumber = currentCount > 0 ? (Math.max(...team.players.map((p) => p.number)) + 1) % 100 : 1;

    const newPlayer: Player = {
      id: `${side}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      number: newNumber,
      name: `Player ${currentCount + 1}`,
      position: 'SF',
      isStarter: team.players.filter((p) => p.isStarter).length < 5,
      isOnCourt: team.players.filter((p) => p.isStarter).length < 5,
      stats: createEmptyStats(),
    };

    setter({
      ...team,
      players: [...team.players, newPlayer],
    });
  };

  // Remove player
  const handleRemovePlayer = (side: TeamSide, playerId: string) => {
    const isHome = side === 'home';
    const team = isHome ? homeTeam : awayTeam;
    const setter = isHome ? setHomeTeam : setAwayTeam;

    if (team.players.length <= 5) {
      alert('A basketball team requires at least 5 players.');
      return;
    }

    setter({
      ...team,
      players: team.players.filter((p) => p.id !== playerId),
    });
  };

  // Update player property
  const handleUpdatePlayer = (
    side: TeamSide,
    playerId: string,
    updates: Partial<Pick<Player, 'name' | 'number' | 'position' | 'isStarter'>>
  ) => {
    const isHome = side === 'home';
    const team = isHome ? homeTeam : awayTeam;
    const setter = isHome ? setHomeTeam : setAwayTeam;

    setter({
      ...team,
      players: team.players.map((p) => {
        if (p.id !== playerId) return p;
        const updated = { ...p, ...updates };
        if (updates.isStarter !== undefined) {
          updated.isOnCourt = updates.isStarter;
        }
        return updated;
      }),
    });
  };

  // Toggle starter status
  const handleToggleStarter = (side: TeamSide, playerId: string) => {
    const isHome = side === 'home';
    const team = isHome ? homeTeam : awayTeam;
    const currentStarters = team.players.filter((p) => p.isStarter);
    const targetPlayer = team.players.find((p) => p.id === playerId);

    if (!targetPlayer) return;

    if (!targetPlayer.isStarter && currentStarters.length >= 5) {
      alert('Only 5 players can be designated as on-court Starters! Deselect another starter first.');
      return;
    }

    handleUpdatePlayer(side, playerId, { isStarter: !targetPlayer.isStarter });
  };

  // Load Preset
  const handleLoadPreset = (presetName: 'default' | 'lakersCeltics' | 'rec') => {
    if (presetName === 'default') {
      setHomeTeam(JSON.parse(JSON.stringify(defaultHomeTeam)));
      setAwayTeam(JSON.parse(JSON.stringify(defaultAwayTeam)));
    } else if (presetName === 'lakersCeltics') {
      const lakers: Team = {
        id: 'team-lakers',
        side: 'home',
        name: 'Lakers',
        city: 'Los Angeles',
        abbreviation: 'LAL',
        primaryColor: '#eab308',
        secondaryColor: '#8b5cf6',
        accentColor: '#ffffff',
        score: 0,
        fouls: 0,
        totalFouls: 0,
        timeoutsRemaining: 5,
        players: [
          { id: 'lal-1', number: 23, name: 'LeBron James', position: 'SF', isStarter: true, isOnCourt: true, stats: createEmptyStats() },
          { id: 'lal-2', number: 3, name: 'Anthony Davis', position: 'C', isStarter: true, isOnCourt: true, stats: createEmptyStats() },
          { id: 'lal-3', number: 1, name: 'D\'Angelo Russell', position: 'PG', isStarter: true, isOnCourt: true, stats: createEmptyStats() },
          { id: 'lal-4', number: 15, name: 'Austin Reaves', position: 'SG', isStarter: true, isOnCourt: true, stats: createEmptyStats() },
          { id: 'lal-5', number: 28, name: 'Rui Hachimura', position: 'PF', isStarter: true, isOnCourt: true, stats: createEmptyStats() },
          { id: 'lal-6', number: 10, name: 'Max Christie', position: 'SG', isStarter: false, isOnCourt: false, stats: createEmptyStats() },
          { id: 'lal-7', number: 11, name: 'Jaxson Hayes', position: 'C', isStarter: false, isOnCourt: false, stats: createEmptyStats() },
          { id: 'lal-8', number: 4, name: 'Dalton Knecht', position: 'SF', isStarter: false, isOnCourt: false, stats: createEmptyStats() },
        ],
      };

      const celtics: Team = {
        id: 'team-celtics',
        side: 'away',
        name: 'Celtics',
        city: 'Boston',
        abbreviation: 'BOS',
        primaryColor: '#10b981',
        secondaryColor: '#059669',
        accentColor: '#ffffff',
        score: 0,
        fouls: 0,
        totalFouls: 0,
        timeoutsRemaining: 5,
        players: [
          { id: 'bos-1', number: 0, name: 'Jayson Tatum', position: 'SF', isStarter: true, isOnCourt: true, stats: createEmptyStats() },
          { id: 'bos-2', number: 7, name: 'Jaylen Brown', position: 'SG', isStarter: true, isOnCourt: true, stats: createEmptyStats() },
          { id: 'bos-3', number: 4, name: 'Jrue Holiday', position: 'PG', isStarter: true, isOnCourt: true, stats: createEmptyStats() },
          { id: 'bos-4', number: 9, name: 'Derrick White', position: 'SG', isStarter: true, isOnCourt: true, stats: createEmptyStats() },
          { id: 'bos-5', number: 8, name: 'Kristaps Porzingis', position: 'C', isStarter: true, isOnCourt: true, stats: createEmptyStats() },
          { id: 'bos-6', number: 42, name: 'Al Horford', position: 'C', isStarter: false, isOnCourt: false, stats: createEmptyStats() },
          { id: 'bos-7', number: 11, name: 'Payton Pritchard', position: 'PG', isStarter: false, isOnCourt: false, stats: createEmptyStats() },
          { id: 'bos-8', number: 30, name: 'Sam Hauser', position: 'SF', isStarter: false, isOnCourt: false, stats: createEmptyStats() },
        ],
      };

      setHomeTeam(lakers);
      setAwayTeam(celtics);
    }
  };

  const handleLaunch = () => {
    if (!isValidToLaunch) {
      alert('Please ensure both Home and Away teams have at least 5 players and exactly 5 starters designated.');
      return;
    }

    startNewGame({
      homeTeam,
      awayTeam,
      settings,
    });
    onStartLiveGame();
  };

  const renderRosterEditor = (side: TeamSide) => {
    const isHome = side === 'home';
    const team = isHome ? homeTeam : awayTeam;
    const setter = isHome ? setHomeTeam : setAwayTeam;
    const startersCount = team.players.filter((p) => p.isStarter).length;

    return (
      <div className="space-y-4">
        {/* Team Details Header Card */}
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-zinc-400">Team Identity & Theme</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-500 font-mono">Accent Color:</span>
              <div className="flex items-center gap-1">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setter({ ...team, primaryColor: color.hex })}
                    className={`w-5 h-5 rounded-full border transition-transform ${
                      team.primaryColor === color.hex ? 'scale-125 border-white ring-2 ring-white/50' : 'border-zinc-700 opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-zinc-400 block mb-1">City / Region</label>
              <input
                type="text"
                value={team.city}
                onChange={(e) => setter({ ...team, city: e.target.value })}
                placeholder="e.g. Bay City"
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-sm text-white font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-zinc-400 block mb-1">Team Name</label>
              <input
                type="text"
                value={team.name}
                onChange={(e) => setter({ ...team, name: e.target.value })}
                placeholder="e.g. Vipers"
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-sm text-white font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-zinc-400 block mb-1">Abbreviation (3 Letters)</label>
              <input
                type="text"
                maxLength={4}
                value={team.abbreviation}
                onChange={(e) => setter({ ...team, abbreviation: e.target.value.toUpperCase() })}
                placeholder="e.g. BCV"
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-sm text-white font-mono font-black focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Roster & Starters Checklist */}
        <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-md">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase text-white tracking-wider">
                {team.name} Roster ({team.players.length} Players)
              </h4>
            </div>

            {/* Starters counter status */}
            <div className="flex items-center gap-3">
              <div
                className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border ${
                  startersCount === 5
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
                    : 'bg-amber-950/60 text-amber-300 border-amber-500/50 animate-pulse'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${startersCount === 5 ? 'fill-emerald-400 text-emerald-400' : 'text-amber-400'}`} />
                <span>
                  {startersCount}/5 Starters Designated
                </span>
              </div>

              <button
                onClick={() => handleAddPlayer(side)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Player</span>
              </button>
            </div>
          </div>

          {/* Player Rows Table */}
          <div className="p-3 divide-y divide-zinc-800/60 space-y-2">
            <div className="grid grid-cols-12 gap-2 px-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              <span className="col-span-2 sm:col-span-1">No.</span>
              <span className="col-span-5 sm:col-span-5">Player Name</span>
              <span className="col-span-2 sm:col-span-2">Pos</span>
              <span className="col-span-2 sm:col-span-3 text-center">Court Status</span>
              <span className="col-span-1 sm:col-span-1 text-right">Del</span>
            </div>

            {team.players.map((player) => (
              <div
                key={player.id}
                className={`pt-2 grid grid-cols-12 gap-2 items-center px-2 py-1.5 rounded-lg transition-colors ${
                  player.isStarter ? 'bg-zinc-950/80 border border-zinc-700/50' : 'hover:bg-zinc-800/40'
                }`}
              >
                {/* Number */}
                <div className="col-span-2 sm:col-span-1">
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={player.number}
                    onChange={(e) =>
                      handleUpdatePlayer(side, player.id, { number: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-1.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-center font-mono font-bold text-white text-xs"
                  />
                </div>

                {/* Name */}
                <div className="col-span-5 sm:col-span-5">
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => handleUpdatePlayer(side, player.id, { name: e.target.value })}
                    className="w-full px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-white font-bold text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {/* Position */}
                <div className="col-span-2 sm:col-span-2">
                  <select
                    value={player.position}
                    onChange={(e) =>
                      handleUpdatePlayer(side, player.id, { position: e.target.value as Position })
                    }
                    className="w-full px-1 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-mono font-bold"
                  >
                    <option value="PG">PG (Point Guard)</option>
                    <option value="SG">SG (Shooting Guard)</option>
                    <option value="SF">SF (Small Forward)</option>
                    <option value="PF">PF (Power Forward)</option>
                    <option value="C">C (Center)</option>
                  </select>
                </div>

                {/* Starter Toggle */}
                <div className="col-span-2 sm:col-span-3 flex justify-center">
                  <button
                    onClick={() => handleToggleStarter(side, player.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      player.isStarter
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-sm'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
                    }`}
                  >
                    <Star className={`w-3 h-3 ${player.isStarter ? 'fill-amber-400 text-amber-400' : ''}`} />
                    <span>{player.isStarter ? 'Starter (On Court)' : 'Bench Reserve'}</span>
                  </button>
                </div>

                {/* Delete */}
                <div className="col-span-1 sm:col-span-1 flex justify-end">
                  <button
                    onClick={() => handleRemovePlayer(side, player.id)}
                    className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800"
                    title="Remove Player"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderRulesEditor = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Quarter / Period Length */}
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
        <label className="text-xs uppercase font-bold text-zinc-300 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Quarter Length (Minutes)</span>
        </label>
        <p className="text-[11px] text-zinc-500">Duration of each period of regulation time.</p>
        <div className="grid grid-cols-4 gap-2 pt-1">
          {[12, 10, 8, 5].map((len) => (
            <button
              key={len}
              onClick={() => setSettings({ ...settings, quarterLengthMinutes: len })}
              className={`py-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                settings.quarterLengthMinutes === len
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {len}m {len === 10 ? '(FIBA)' : len === 12 ? '(NBA)' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Foul Out Limit */}
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
        <label className="text-xs uppercase font-bold text-zinc-300 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Player Foul-Out Limit</span>
        </label>
        <p className="text-[11px] text-zinc-500">Personal fouls before disqualification from match.</p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          {[5, 6].map((limit) => (
            <button
              key={limit}
              onClick={() => setSettings({ ...settings, foulOutLimit: limit })}
              className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                settings.foulOutLimit === limit
                  ? 'bg-amber-950/60 text-amber-300 border-amber-500 shadow'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {limit} Fouls {limit === 5 ? '(FIBA/High School)' : '(NBA Pro)'}
            </button>
          ))}
        </div>
      </div>

      {/* Shot Clock Duration */}
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
        <label className="text-xs uppercase font-bold text-zinc-300 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-rose-400" />
          <span>Shot Clock Rule</span>
        </label>
        <p className="text-[11px] text-zinc-500">Standard possession countdown clock.</p>
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[24, 30, 35].map((sec) => (
            <button
              key={sec}
              onClick={() => setSettings({ ...settings, shotClockSeconds: sec })}
              className={`py-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                settings.shotClockSeconds === sec
                  ? 'bg-rose-950/60 text-rose-300 border-rose-500 shadow'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {sec}s {sec === 24 ? '(Pro)' : '(NCAA)'}
            </button>
          ))}
        </div>
      </div>

      {/* Audio & Smart Prompts */}
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-xs font-bold text-white">Arena Sound Synthesizer</div>
              <div className="text-[10px] text-zinc-500">Audio whistles, swish, buzzer, & clicks</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
            className="w-5 h-5 accent-cyan-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-xs font-bold text-white">Smart Assist Prompt Toast</div>
              <div className="text-[10px] text-zinc-500">1-tap assist attribution after made baskets</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.autoAssistPrompt}
            onChange={(e) => setSettings({ ...settings, autoAssistPrompt: e.target.checked })}
            className="w-5 h-5 accent-cyan-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Trophy className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">
              Pre-Game Match Setup & Rosters
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Configure team names, colors, full rosters, designate the 5 starters, and customize league rules.
          </p>
        </div>

        {/* Preset Quick Loader */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-mono">Presets:</span>
          <button
            onClick={() => handleLoadPreset('default')}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 transition-colors"
          >
            Vipers vs Titans
          </button>
          <button
            onClick={() => handleLoadPreset('lakersCeltics')}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 transition-colors"
          >
            Lakers vs Celtics
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 my-4 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'home'
              ? 'bg-zinc-800 text-white border border-cyan-500/50 shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: homeTeam.primaryColor }}
          />
          <span>Home Team: {homeTeam.city} {homeTeam.name}</span>
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 text-cyan-400">
            {homeStarters.length}/5 Starters
          </span>
        </button>

        <button
          onClick={() => setActiveTab('away')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'away'
              ? 'bg-zinc-800 text-white border border-rose-500/50 shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: awayTeam.primaryColor }}
          />
          <span>Away Team: {awayTeam.city} {awayTeam.name}</span>
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 text-rose-400">
            {awayStarters.length}/5 Starters
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'rules'
              ? 'bg-zinc-800 text-white border border-zinc-600 shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Match Rules & Clock</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1">
        {activeTab === 'home' && renderRosterEditor('home')}
        {activeTab === 'away' && renderRosterEditor('away')}
        {activeTab === 'rules' && renderRulesEditor()}
      </div>

      {/* Launch Footer Bar */}
      <div className="mt-8 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            {isHomeValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
            <span className={isHomeValid ? 'text-zinc-300' : 'text-amber-400 font-bold'}>
              Home: {homeStarters.length}/5 Starters ({homeTeam.players.length} Players)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isAwayValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
            <span className={isAwayValid ? 'text-zinc-300' : 'text-amber-400 font-bold'}>
              Away: {awayStarters.length}/5 Starters ({awayTeam.players.length} Players)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800"
            >
              Cancel / Return to Match
            </button>
          )}

          <button
            onClick={handleLaunch}
            disabled={!isValidToLaunch}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-xl active:scale-95 ${
              isValidToLaunch
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black shadow-cyan-950/60 cursor-pointer'
                : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Live Scorekeeper</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
