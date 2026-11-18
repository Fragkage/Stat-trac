'use client';

import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FileSpreadsheet,
  Settings,
  History,
  Clock,
  ArrowLeftRight,
  Plus,
  Minus,
  Timer,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface StickyScoreboardProps {
  onOpenBoxScore: () => void;
  onOpenSettings: () => void;
  onOpenSetup: () => void;
  onTogglePbp: () => void;
  isPbpOpen: boolean;
}

export const StickyScoreboard: React.FC<StickyScoreboardProps> = ({
  onOpenBoxScore,
  onOpenSettings,
  onOpenSetup,
  onTogglePbp,
  isPbpOpen,
}) => {
  const {
    gameState,
    canUndo,
    undo,
    toggleClock,
    resetShotClock,
    adjustGameClock,
    nextQuarter,
    previousQuarter,
    togglePossession,
    recordTimeout,
    endTimeout,
    adjustTimeout,
    updateSettings,
    setGameClockTime,
  } = useGame();

  const [isEditingClock, setIsEditingClock] = useState(false);
  const [editMinutes, setEditMinutes] = useState('10');
  const [editSeconds, setEditSeconds] = useState('00');

  const {
    homeTeam,
    awayTeam,
    quarter,
    gameClockSeconds,
    shotClockSeconds,
    isClockRunning,
    possession,
    settings,
    activeTimeout,
  } = gameState;

  const formatClock = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuarterLabel = (q: number) => {
    if (q <= 4) return `Q${q}`;
    return `OT${q - 4}`;
  };

  const isHomeBonus = homeTeam.fouls >= settings.bonusFoulThreshold;
  const isAwayBonus = awayTeam.fouls >= settings.bonusFoulThreshold;

  const handleStartEditClock = () => {
    const mins = Math.floor(gameClockSeconds / 60);
    const secs = gameClockSeconds % 60;
    setEditMinutes(mins.toString());
    setEditSeconds(secs.toString().padStart(2, '0'));
    setIsEditingClock(true);
  };

  const handleSaveClock = (e: React.FormEvent) => {
    e.preventDefault();
    const m = parseInt(editMinutes, 10) || 0;
    const s = parseInt(editSeconds, 10) || 0;
    setGameClockTime(m * 60 + s);
    setIsEditingClock(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md shadow-2xl">
      {/* Top Utility Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-zinc-800/60 text-xs text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold tracking-wider text-zinc-300 uppercase">Live Match Dashboard</span>
          </div>
          <span className="text-zinc-600">|</span>
          <span className="hidden sm:inline text-zinc-500 font-mono">
            {settings.quarterLengthMinutes}m Periods • Team Fouls Reset Each QTR
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo Button */}
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo Last Action (Ctrl+Z)"
            className={`flex items-center gap-1 px-2.5 py-1 rounded border text-xs font-medium transition-all ${
              canUndo
                ? 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600 active:scale-95'
                : 'border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
            <kbd className="hidden md:inline text-[10px] text-zinc-500 ml-1 px-1 bg-zinc-800 rounded">^Z</kbd>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            title={settings.soundEnabled ? 'Mute Arena Audio' : 'Unmute Arena Audio'}
            className="p-1.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-500" />}
          </button>

          {/* Play-by-Play toggle */}
          <button
            onClick={onTogglePbp}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border text-xs font-medium transition-all ${
              isPbpOpen
                ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Play-by-Play</span>
          </button>

          {/* Box Score Modal */}
          <button
            onClick={onOpenBoxScore}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">Box Score</span>
          </button>

          {/* Setup / Rosters */}
          <button
            onClick={onOpenSetup}
            title="Configure Teams, Rosters & Starters"
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 hover:text-white transition-all active:scale-95"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">Setup / Rosters</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="Game Settings"
            className="p-1.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Digital Scoreboard */}
      <div className="grid grid-cols-12 items-center px-3 sm:px-6 py-2.5 gap-2 max-w-7xl mx-auto">
        {/* HOME TEAM */}
        <div className="col-span-4 sm:col-span-4 flex items-center justify-between bg-zinc-900/80 rounded-xl p-2.5 sm:p-3 border border-zinc-800/80 relative overflow-hidden">
          <div
            className="absolute left-0 top-0 bottom-0 w-1.5"
            style={{ backgroundColor: homeTeam.primaryColor }}
          />
          <div className="flex items-center gap-2 sm:gap-3 pl-1.5">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  {homeTeam.city}
                </span>
                {possession === 'home' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-tight bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    POSS
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-xl font-black tracking-tight text-white uppercase truncate">
                {homeTeam.name}
              </h2>
              {/* Fouls & Timeouts */}
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400">
                <span className="font-mono" title="Team fouls this quarter (resets every quarter)">
                  QTR FOULS:{' '}
                  <strong className={homeTeam.fouls >= 4 ? 'text-amber-400 font-bold' : 'text-zinc-200'}>
                    {homeTeam.fouls}
                  </strong>
                </span>
                {isHomeBonus && (
                  <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-black uppercase">
                    BONUS
                  </span>
                )}
                <span className="text-zinc-600">•</span>
                <span className="flex items-center gap-1" title="Timeouts remaining">
                  <span className="text-zinc-500 text-[10px]">T.O:</span>
                  <span className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i < homeTeam.timeoutsRemaining ? 'bg-cyan-400' : 'bg-zinc-700'
                        }`}
                      />
                    ))}
                  </span>
                </span>
                <button
                  onClick={() => recordTimeout('home')}
                  disabled={homeTeam.timeoutsRemaining <= 0 || Boolean(activeTimeout)}
                  className="hidden lg:inline text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40"
                  title="Call 60s Timeout"
                >
                  CALL TO
                </button>
              </div>
            </div>
          </div>

          {/* Big Score Digit */}
          <div className="flex flex-col items-end">
            <span
              className="text-3xl sm:text-5xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_12px_rgba(6,182,212,0.25)]"
              style={{ color: homeTeam.primaryColor }}
            >
              {homeTeam.score}
            </span>
          </div>
        </div>

        {/* CENTER CLOCK & PERIOD PANEL (OR ACTIVE 60s TIMEOUT COUNTDOWN) */}
        <div className="col-span-4 sm:col-span-4 flex flex-col items-center justify-center">
          {activeTimeout ? (
            /* ACTIVE 60s TIMEOUT COUNTDOWN VIEW */
            <div className="w-full flex flex-col items-center justify-center p-2 rounded-xl bg-amber-950/40 border border-amber-500/60 shadow-lg shadow-amber-950/40 animate-fadeIn">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-400 mb-0.5">
                <Timer className="w-3.5 h-3.5 animate-spin" />
                <span>60s TIMEOUT: {activeTimeout.teamName}</span>
              </div>

              {/* Big Timeout Countdown */}
              <div className="flex items-center gap-2">
                <div
                  className={`font-mono text-2xl sm:text-3xl font-black px-3 py-0.5 rounded-lg border ${
                    activeTimeout.secondsRemaining <= 10
                      ? 'bg-rose-950/60 border-rose-500 text-rose-400 animate-pulse'
                      : 'bg-zinc-900 border-amber-500/80 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  }`}
                >
                  {formatClock(activeTimeout.secondsRemaining)}
                </div>

                {/* End Timeout early and restore game clock */}
                <button
                  onClick={endTimeout}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-md transition-all active:scale-95"
                  title="End timeout and resume court with clock paused"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resume</span>
                </button>
              </div>

              <div className="flex items-center justify-between w-full mt-1 px-1 text-[9px] text-zinc-400">
                <span>
                  Game clock paused at <strong className="text-zinc-200">{formatClock(activeTimeout.savedGameClockSeconds)}</strong>
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => adjustTimeout(-10)}
                    className="px-1 py-0.2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700"
                    title="-10s"
                  >
                    -10s
                  </button>
                  <button
                    onClick={() => adjustTimeout(10)}
                    className="px-1 py-0.2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700"
                    title="+10s"
                  >
                    +10s
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* STANDARD GAME CLOCK & SHOT CLOCK VIEW */
            <>
              {/* Period selector */}
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={previousQuarter}
                  disabled={quarter <= 1}
                  className="p-0.5 text-zinc-500 hover:text-zinc-300 disabled:opacity-20"
                  title="Previous Quarter (Fouls will reset for quarter, player fouls remain intact)"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-black tracking-widest text-amber-400 uppercase font-mono">
                  {getQuarterLabel(quarter)}
                </span>
                <button
                  onClick={nextQuarter}
                  className="p-0.5 text-zinc-500 hover:text-zinc-300"
                  title="Next Quarter (Resets team fouls to 0, preserves player fouls)"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Main Game Clock */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {isEditingClock ? (
                  <form onSubmit={handleSaveClock} className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={editMinutes}
                      onChange={(e) => setEditMinutes(e.target.value)}
                      className="w-10 bg-zinc-900 border border-cyan-500 rounded px-1 py-0.5 text-center text-sm font-mono text-white"
                    />
                    <span className="text-zinc-400">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={editSeconds}
                      onChange={(e) => setEditSeconds(e.target.value)}
                      className="w-10 bg-zinc-900 border border-cyan-500 rounded px-1 py-0.5 text-center text-sm font-mono text-white"
                    />
                    <button
                      type="submit"
                      className="px-2 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-semibold"
                    >
                      Set
                    </button>
                  </form>
                ) : (
                  <div
                    onClick={handleStartEditClock}
                    title="Click to edit clock"
                    className={`cursor-pointer px-2.5 sm:px-4 py-0.5 rounded-lg border font-mono text-2xl sm:text-3xl font-black tracking-wider transition-all select-none ${
                      gameClockSeconds <= 60
                        ? 'border-rose-500/60 bg-rose-950/30 text-rose-400 animate-pulse'
                        : isClockRunning
                        ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-zinc-500'
                    }`}
                  >
                    {formatClock(gameClockSeconds)}
                  </div>
                )}

                {/* Play/Pause Button */}
                <button
                  onClick={toggleClock}
                  title={isClockRunning ? 'Pause Clock (Space)' : 'Start Clock (Space)'}
                  className={`p-2 rounded-lg font-bold border transition-all active:scale-95 ${
                    isClockRunning
                      ? 'border-amber-500/60 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                      : 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  {isClockRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
              </div>

              {/* Shot Clock & Possession Row */}
              <div className="flex items-center gap-3 mt-1.5">
                {/* Shot Clock */}
                <div className="flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">SHOT</span>
                  <span
                    className={`font-mono text-xs sm:text-sm font-black px-1.5 py-0.2 rounded ${
                      shotClockSeconds <= 5
                        ? 'bg-rose-600 text-white animate-bounce'
                        : 'bg-zinc-800 text-amber-400'
                    }`}
                  >
                    {shotClockSeconds.toString().padStart(2, '0')}
                  </span>
                  <button
                    onClick={() => resetShotClock(24)}
                    title="Reset Shot Clock to 24s"
                    className="text-[10px] font-bold px-1 py-0.2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded"
                  >
                    24
                  </button>
                  <button
                    onClick={() => resetShotClock(14)}
                    title="Reset Shot Clock to 14s (Offensive Rebound)"
                    className="text-[10px] font-bold px-1 py-0.2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded"
                  >
                    14
                  </button>
                </div>

                {/* Possession Switch Button - resets shot clock to 24 on toggle! */}
                <button
                  onClick={togglePossession}
                  title="Switch Possession (Resets shot clock to 24s)"
                  className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  <ArrowLeftRight className="w-3 h-3 text-cyan-400" />
                  <span className="hidden sm:inline">POSS (24s)</span>
                </button>

                {/* Micro Clock adjust */}
                <div className="hidden md:flex items-center gap-0.5 text-zinc-500 text-[10px]">
                  <button
                    onClick={() => adjustGameClock(-1)}
                    className="px-1 py-0.5 bg-zinc-900 hover:bg-zinc-800 rounded border border-zinc-800 text-zinc-400"
                    title="-1s"
                  >
                    -1s
                  </button>
                  <button
                    onClick={() => adjustGameClock(1)}
                    className="px-1 py-0.5 bg-zinc-900 hover:bg-zinc-800 rounded border border-zinc-800 text-zinc-400"
                    title="+1s"
                  >
                    +1s
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* AWAY TEAM */}
        <div className="col-span-4 sm:col-span-4 flex items-center justify-between bg-zinc-900/80 rounded-xl p-2.5 sm:p-3 border border-zinc-800/80 relative overflow-hidden">
          <div
            className="absolute right-0 top-0 bottom-0 w-1.5"
            style={{ backgroundColor: awayTeam.primaryColor }}
          />
          {/* Big Score Digit */}
          <div className="flex flex-col items-start">
            <span
              className="text-3xl sm:text-5xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_12px_rgba(244,63,94,0.25)]"
              style={{ color: awayTeam.primaryColor }}
            >
              {awayTeam.score}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 pr-1.5 text-right">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 justify-end">
                {possession === 'away' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-tight bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                    POSS
                  </span>
                )}
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  {awayTeam.city}
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black tracking-tight text-white uppercase truncate">
                {awayTeam.name}
              </h2>
              {/* Fouls & Timeouts */}
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400">
                <button
                  onClick={() => recordTimeout('away')}
                  disabled={awayTeam.timeoutsRemaining <= 0 || Boolean(activeTimeout)}
                  className="hidden lg:inline text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40"
                  title="Call 60s Timeout"
                >
                  CALL TO
                </button>
                <span className="flex items-center gap-1" title="Timeouts remaining">
                  <span className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i < awayTeam.timeoutsRemaining ? 'bg-rose-400' : 'bg-zinc-700'
                        }`}
                      />
                    ))}
                  </span>
                  <span className="text-zinc-500 text-[10px]">T.O:</span>
                </span>
                <span className="text-zinc-600">•</span>
                {isAwayBonus && (
                  <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-black uppercase">
                    BONUS
                  </span>
                )}
                <span className="font-mono" title="Team fouls this quarter (resets every quarter)">
                  QTR FOULS:{' '}
                  <strong className={awayTeam.fouls >= 4 ? 'text-amber-400 font-bold' : 'text-zinc-200'}>
                    {awayTeam.fouls}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
