'use client';

import React, { useState } from 'react';
import { GameProvider, useGame } from '../context/GameContext';
import { StickyScoreboard } from '../components/scoreboard/StickyScoreboard';
import { SplitCourtView } from '../components/court/SplitCourtView';
import { PlayByPlayFeed } from '../components/feed/PlayByPlayFeed';
import { BoxScoreModal } from '../components/boxscore/BoxScoreModal';
import { GameSettingsModal } from '../components/settings/GameSettingsModal';
import { AssistPromptToast } from '../components/feed/AssistPromptToast';
import { GameSetupScreen } from '../components/setup/GameSetupScreen';
import { Keyboard, Activity, Users, FileSpreadsheet } from 'lucide-react';

function DashboardContent() {
  const { gameState } = useGame();
  const [isBoxScoreOpen, setIsBoxScoreOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPbpOpen, setIsPbpOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  // If in setup mode, show the full Starter Setup & Roster Screen
  if (isSetupOpen || gameState.status === 'setup') {
    return (
      <GameSetupScreen
        onStartLiveGame={() => setIsSetupOpen(false)}
        onCancel={gameState.status !== 'setup' ? () => setIsSetupOpen(false) : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Sticky Scoreboard */}
      <StickyScoreboard
        onOpenBoxScore={() => setIsBoxScoreOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSetup={() => setIsSetupOpen(true)}
        onTogglePbp={() => setIsPbpOpen(!isPbpOpen)}
        isPbpOpen={isPbpOpen}
      />

      {/* Main Split Court: Active 5 vs Active 5 + Bench */}
      <main className="flex-1 pb-16">
        <SplitCourtView />
      </main>

      {/* Slide-out Play-by-Play feed */}
      <PlayByPlayFeed isOpen={isPbpOpen} onClose={() => setIsPbpOpen(false)} />

      {/* Full Box Score Modal */}
      <BoxScoreModal isOpen={isBoxScoreOpen} onClose={() => setIsBoxScoreOpen(false)} />

      {/* Game Rules / Settings Modal */}
      <GameSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Smart Assist Toast */}
      <AssistPromptToast />

      {/* Bottom Pro Scorekeeper Hotkey & Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/90 border-t border-zinc-800/80 px-4 py-2 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-cyan-400 font-bold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5" />
              <span>Stat-Trac Live</span>
            </span>
            <span className="hidden sm:inline text-zinc-600">|</span>
            <span className="hidden sm:flex items-center gap-1.5 text-zinc-400">
              <Keyboard className="w-3.5 h-3.5 text-zinc-500" />
              <span>Shortcuts:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono">
                Space
              </kbd>
              <span>Clock</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono">
                Ctrl+Z
              </kbd>
              <span>Undo</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSetupOpen(true)}
              className="flex items-center gap-1 text-zinc-300 hover:text-cyan-400 transition-colors"
            >
              <Users className="w-3 h-3 text-cyan-400" />
              <span>Edit Rosters / Setup</span>
            </button>

            <span className="text-zinc-600">|</span>

            <button
              onClick={() => setIsBoxScoreOpen(true)}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold transition-colors"
            >
              <FileSpreadsheet className="w-3 h-3" />
              <span>Box Score →</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <GameProvider>
      <DashboardContent />
    </GameProvider>
  );
}
