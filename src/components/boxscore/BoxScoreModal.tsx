'use client';

import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Team, Player } from '../../types/basketball';
import { X, Download, Copy, Check, FileSpreadsheet } from 'lucide-react';

interface BoxScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BoxScoreModal: React.FC<BoxScoreModalProps> = ({ isOpen, onClose }) => {
  const { gameState } = useGame();
  const [activeTab, setActiveTab] = useState<'both' | 'home' | 'away'>('both');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const { homeTeam, awayTeam } = gameState;

  // Format seconds to mm:ss
  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  // Helper for percentage
  const calcPct = (m: number, a: number) => {
    if (a === 0) return '0.0%';
    return `${((m / a) * 100).toFixed(1)}%`;
  };

  // Calculate team aggregate totals
  const calcTeamTotals = (team: Team) => {
    return team.players.reduce(
      (acc, p) => {
        acc.pts += p.stats.pts;
        acc.fgm += p.stats.fgm;
        acc.fga += p.stats.fga;
        acc.fg3m += p.stats.fg3m;
        acc.fg3a += p.stats.fg3a;
        acc.ftm += p.stats.ftm;
        acc.fta += p.stats.fta;
        acc.oreb += p.stats.oreb;
        acc.dreb += p.stats.dreb;
        acc.reb += p.stats.reb;
        acc.ast += p.stats.ast;
        acc.stl += p.stats.stl;
        acc.blk += p.stats.blk;
        acc.tov += p.stats.tov;
        acc.pf += p.stats.pf;
        acc.secondsPlayed += p.stats.secondsPlayed;
        return acc;
      },
      {
        pts: 0,
        fgm: 0,
        fga: 0,
        fg3m: 0,
        fg3a: 0,
        ftm: 0,
        fta: 0,
        oreb: 0,
        dreb: 0,
        reb: 0,
        ast: 0,
        stl: 0,
        blk: 0,
        tov: 0,
        pf: 0,
        secondsPlayed: 0,
      }
    );
  };

  const homeTotals = calcTeamTotals(homeTeam);
  const awayTotals = calcTeamTotals(awayTeam);

  const handleCopyClipboard = () => {
    const formatTeamText = (t: Team, totals: ReturnType<typeof calcTeamTotals>) => {
      let txt = `=== ${t.city} ${t.name} (${t.score} PTS) ===\n`;
      txt += `NO | PLAYER | POS | MIN | PTS | FGM-A (FG%) | 3PM-A (3P%) | FTM-A (FT%) | REB (O/D) | AST | STL | BLK | TO | PF | +/-\n`;
      t.players.forEach((p) => {
        const s = p.stats;
        txt += `#${p.number} ${p.name} | ${p.position} | ${formatSeconds(s.secondsPlayed)} | ${s.pts} | ${s.fgm}-${s.fga} (${calcPct(s.fgm, s.fga)}) | ${s.fg3m}-${s.fg3a} (${calcPct(s.fg3m, s.fg3a)}) | ${s.ftm}-${s.fta} (${calcPct(s.ftm, s.fta)}) | ${s.reb} (${s.oreb}/${s.dreb}) | ${s.ast} | ${s.stl} | ${s.blk} | ${s.tov} | ${s.pf} | ${s.plusMinus > 0 ? '+' : ''}${s.plusMinus}\n`;
      });
      txt += `TOTALS: ${t.score} PTS | ${totals.fgm}-${totals.fga} (${calcPct(totals.fgm, totals.fga)}) | ${totals.fg3m}-${totals.fg3a} | ${totals.ftm}-${totals.fta} | ${totals.reb} REB | ${totals.ast} AST | ${totals.stl} STL | ${totals.blk} BLK | ${totals.tov} TO | ${totals.pf} PF\n\n`;
      return txt;
    };

    const textToCopy = `${homeTeam.city} ${homeTeam.name} ${homeTeam.score} vs ${awayTeam.city} ${awayTeam.name} ${awayTeam.score}\n\n` +
      formatTeamText(homeTeam, homeTotals) +
      formatTeamText(awayTeam, awayTotals);

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    let csv = `Team,Number,Name,Position,Status,MIN,PTS,FGM,FGA,FG_PCT,3PM,3PA,3P_PCT,FTM,FTA,FT_PCT,OREB,DREB,REB,AST,STL,BLK,TOV,PF,PLUS_MINUS\n`;

    const addTeamRows = (t: Team) => {
      t.players.forEach((p) => {
        const s = p.stats;
        csv += `"${t.name}",${p.number},"${p.name}","${p.position}","${p.isOnCourt ? 'ACTIVE' : 'BENCH'}",${formatSeconds(s.secondsPlayed)},${s.pts},${s.fgm},${s.fga},${calcPct(s.fgm, s.fga)},${s.fg3m},${s.fg3a},${calcPct(s.fg3m, s.fg3a)},${s.ftm},${s.fta},${calcPct(s.ftm, s.fta)},${s.oreb},${s.dreb},${s.reb},${s.ast},${s.stl},${s.blk},${s.tov},${s.pf},${s.plusMinus}\n`;
      });
    };

    addTeamRows(homeTeam);
    addTeamRows(awayTeam);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `boxscore-${homeTeam.abbreviation}-vs-${awayTeam.abbreviation}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTable = (team: Team, totals: ReturnType<typeof calcTeamTotals>) => {
    return (
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-lg">
        {/* Team Table Header */}
        <div
          className="px-4 py-3 flex items-center justify-between border-b border-zinc-800"
          style={{ backgroundColor: `${team.primaryColor}10` }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: team.primaryColor }}
            />
            <h4 className="text-base font-black uppercase text-white tracking-wide">
              {team.city} {team.name}
            </h4>
          </div>
          <span className="font-mono text-2xl font-black" style={{ color: team.primaryColor }}>
            {team.score} PTS
          </span>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Player</th>
                <th className="py-2.5 px-2">Pos</th>
                <th className="py-2.5 px-2">Status</th>
                <th className="py-2.5 px-2 text-right">PTS</th>
                <th className="py-2.5 px-2 text-right">FG</th>
                <th className="py-2.5 px-2 text-right">FG%</th>
                <th className="py-2.5 px-2 text-right">3PT</th>
                <th className="py-2.5 px-2 text-right">3P%</th>
                <th className="py-2.5 px-2 text-right">FT</th>
                <th className="py-2.5 px-2 text-right">FT%</th>
                <th className="py-2.5 px-2 text-right">OREB</th>
                <th className="py-2.5 px-2 text-right">DREB</th>
                <th className="py-2.5 px-2 text-right">REB</th>
                <th className="py-2.5 px-2 text-right">AST</th>
                <th className="py-2.5 px-2 text-right">STL</th>
                <th className="py-2.5 px-2 text-right">BLK</th>
                <th className="py-2.5 px-2 text-right">TO</th>
                <th className="py-2.5 px-2 text-right">PF</th>
                <th className="py-2.5 px-3 text-right">+/-</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {team.players.map((p) => {
                const s = p.stats;
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-zinc-900/50 transition-colors ${
                      p.isOnCourt ? 'text-zinc-100 font-semibold' : 'text-zinc-400'
                    }`}
                  >
                    <td className="py-2 px-3 text-zinc-400">#{p.number}</td>
                    <td className="py-2 px-3 font-sans font-bold whitespace-nowrap text-white">
                      {p.name}
                    </td>
                    <td className="py-2 px-2 text-zinc-400">{p.position}</td>
                    <td className="py-2 px-2">
                      {p.isOnCourt ? (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          ON COURT
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-medium uppercase bg-zinc-800 text-zinc-500">
                          BENCH
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-right font-black text-amber-400 text-sm">
                      {s.pts}
                    </td>
                    <td className="py-2 px-2 text-right whitespace-nowrap">
                      {s.fgm}-{s.fga}
                    </td>
                    <td className="py-2 px-2 text-right text-zinc-400">
                      {calcPct(s.fgm, s.fga)}
                    </td>
                    <td className="py-2 px-2 text-right whitespace-nowrap">
                      {s.fg3m}-{s.fg3a}
                    </td>
                    <td className="py-2 px-2 text-right text-zinc-400">
                      {calcPct(s.fg3m, s.fg3a)}
                    </td>
                    <td className="py-2 px-2 text-right whitespace-nowrap">
                      {s.ftm}-{s.fta}
                    </td>
                    <td className="py-2 px-2 text-right text-zinc-400">
                      {calcPct(s.ftm, s.fta)}
                    </td>
                    <td className="py-2 px-2 text-right">{s.oreb}</td>
                    <td className="py-2 px-2 text-right">{s.dreb}</td>
                    <td className="py-2 px-2 text-right font-bold text-cyan-400">{s.reb}</td>
                    <td className="py-2 px-2 text-right font-bold text-sky-400">{s.ast}</td>
                    <td className="py-2 px-2 text-right">{s.stl}</td>
                    <td className="py-2 px-2 text-right">{s.blk}</td>
                    <td className="py-2 px-2 text-right text-orange-400">{s.tov}</td>
                    <td className="py-2 px-2 text-right text-rose-400">{s.pf}</td>
                    <td
                      className={`py-2 px-3 text-right font-bold ${
                        s.plusMinus > 0
                          ? 'text-emerald-400'
                          : s.plusMinus < 0
                          ? 'text-rose-400'
                          : 'text-zinc-500'
                      }`}
                    >
                      {s.plusMinus > 0 ? `+${s.plusMinus}` : s.plusMinus}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totals Footer Row */}
            <tfoot>
              <tr className="bg-zinc-900 border-t-2 border-zinc-700 font-bold text-white text-xs">
                <td className="py-2.5 px-3" colSpan={4}>
                  TEAM TOTALS
                </td>
                <td className="py-2.5 px-2 text-right text-amber-400 text-sm">{team.score}</td>
                <td className="py-2.5 px-2 text-right whitespace-nowrap">
                  {totals.fgm}-{totals.fga}
                </td>
                <td className="py-2.5 px-2 text-right">{calcPct(totals.fgm, totals.fga)}</td>
                <td className="py-2.5 px-2 text-right whitespace-nowrap">
                  {totals.fg3m}-{totals.fg3a}
                </td>
                <td className="py-2.5 px-2 text-right">{calcPct(totals.fg3m, totals.fg3a)}</td>
                <td className="py-2.5 px-2 text-right whitespace-nowrap">
                  {totals.ftm}-{totals.fta}
                </td>
                <td className="py-2.5 px-2 text-right">{calcPct(totals.ftm, totals.fta)}</td>
                <td className="py-2.5 px-2 text-right">{totals.oreb}</td>
                <td className="py-2.5 px-2 text-right">{totals.dreb}</td>
                <td className="py-2.5 px-2 text-right text-cyan-400">{totals.reb}</td>
                <td className="py-2.5 px-2 text-right text-sky-400">{totals.ast}</td>
                <td className="py-2.5 px-2 text-right">{totals.stl}</td>
                <td className="py-2.5 px-2 text-right">{totals.blk}</td>
                <td className="py-2.5 px-2 text-right text-orange-400">{totals.tov}</td>
                <td className="py-2.5 px-2 text-right text-rose-400">{totals.pf}</td>
                <td className="py-2.5 px-3 text-right text-zinc-500">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-6xl max-h-[95vh] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                Official FIBA/NBA Box Score
              </h3>
              <p className="text-xs text-zinc-400">
                {homeTeam.city} {homeTeam.name} ({homeTeam.score}) vs {awayTeam.city}{' '}
                {awayTeam.name} ({awayTeam.score})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Button */}
            <button
              onClick={handleCopyClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Table'}</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="px-6 py-2.5 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('both')}
            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'both' ? 'bg-zinc-800 text-white border border-zinc-600' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Both Teams
          </button>
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'home'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {homeTeam.name} ({homeTeam.score})
          </button>
          <button
            onClick={() => setActiveTab('away')}
            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'away'
                ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {awayTeam.name} ({awayTeam.score})
          </button>
        </div>

        {/* Modal Body / Tables */}
        <div className="p-6 overflow-y-auto flex-1">
          {(activeTab === 'both' || activeTab === 'home') && renderTable(homeTeam, homeTotals)}
          {(activeTab === 'both' || activeTab === 'away') && renderTable(awayTeam, awayTotals)}
        </div>
      </div>
    </div>
  );
};
