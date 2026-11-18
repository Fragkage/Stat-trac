'use client';

import React from 'react';
import { useGame } from '../../context/GameContext';
import { X, Settings, RotateCcw, Volume2, Sparkles, Shield, Clock } from 'lucide-react';

interface GameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({ isOpen, onClose }) => {
  const { gameState, updateSettings, resetGame } = useGame();

  if (!isOpen) return null;

  const { settings } = gameState;

  const handleResetGame = () => {
    if (window.confirm('Are you sure you want to reset the entire match state to default mock data?')) {
      resetGame();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-black text-white uppercase tracking-tight">
              Scorekeeper Game Rules & Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-sm">
          {/* Quarter Length */}
          <div>
            <label className="text-xs uppercase font-bold text-zinc-400 block mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Quarter / Period Length (Minutes)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[12, 10, 8, 5].map((len) => (
                <button
                  key={len}
                  onClick={() => updateSettings({ quarterLengthMinutes: len })}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                    settings.quarterLengthMinutes === len
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {len} min {len === 10 ? '(FIBA)' : len === 12 ? '(NBA)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Foul Out Limit */}
          <div>
            <label className="text-xs uppercase font-bold text-zinc-400 block mb-1.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Player Foul-Out Limit</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[5, 6].map((limit) => (
                <button
                  key={limit}
                  onClick={() => updateSettings({ foulOutLimit: limit })}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    settings.foulOutLimit === limit
                      ? 'bg-amber-950/60 text-amber-300 border-amber-500'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {limit} Fouls {limit === 5 ? '(FIBA / High School)' : '(NBA Pro)'}
                </button>
              ))}
            </div>
          </div>

          {/* Sound & Arena FX Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="font-bold text-xs text-white">Arena Audio Feedback</div>
                <div className="text-[11px] text-zinc-500">Synthesizes swish, whistles, buzzer, & clicks</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
              className="w-5 h-5 accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Auto Assist Prompt Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="font-bold text-xs text-white">Smart Assist Prompt</div>
                <div className="text-[11px] text-zinc-500">
                  Pops quick 1-tap credit toast after made baskets
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoAssistPrompt}
              onChange={(e) => updateSettings({ autoAssistPrompt: e.target.checked })}
              className="w-5 h-5 accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Reset Game Section */}
          <div className="pt-2 border-t border-zinc-800">
            <button
              onClick={handleResetGame}
              className="w-full py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Game to Fresh Demo State</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
