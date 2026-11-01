import React, { useState } from 'react';
import {
    Award,
    MapPin,
    Sparkles
} from 'lucide-react';
import clsx from 'clsx';
import { SAMPLE_ENGINEER_PROFILES, calculateEpiScore } from '../utils/epiScoringEngine';
import type { EpiScoreResult } from '../utils/epiScoringEngine';

export const EpiScoreboard: React.FC = () => {
    const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All');

    const scoreResults: EpiScoreResult[] = SAMPLE_ENGINEER_PROFILES.map(p => calculateEpiScore(p))
        .sort((a, b) => b.epiScore - a.epiScore);

    const filteredResults = selectedDiscipline === 'All'
        ? scoreResults
        : scoreResults.filter(r => r.discipline.includes(selectedDiscipline));

    return (
        <div className="glass-card rounded-2xl md:rounded-[32px] p-4 sm:p-6 md:p-7 border border-white/5 bg-[#141414]/90 relative overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-5">
                <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1.5">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-orange-glow shrink-0">
                            <Award className="w-4 h-4" />
                        </div>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight">
                            360° Engineer Performance Index (EPI)
                        </h2>
                        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 whitespace-nowrap">
                            Proprietary Multi-Factor
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono leading-relaxed">
                        Holistic scoring: 35% Deep CAD Workstation Telemetry + 25% Geofenced Site GPS + 25% Submittal Pass Rate + 15% Milestone Log.
                    </p>
                </div>

                {/* Filter — Horizontally scrollable on mobile/tablet with non-wrapping pill buttons */}
                <div className="flex items-center gap-1.5 p-1.5 bg-black/40 border border-white/5 rounded-xl overflow-x-auto max-w-full no-scrollbar shrink-0">
                    {['All', 'Water & SWRO', 'Site Supervision', 'Electromechanical', 'BIM & Architecture', 'Civil'].map(disc => (
                        <button
                            key={disc}
                            onClick={() => setSelectedDiscipline(disc)}
                            className={clsx(
                                'px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap shrink-0',
                                selectedDiscipline === disc
                                    ? 'bg-orange-500 text-white shadow-orange-glow'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            )}
                        >
                            {disc}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leaderboard Cards — Structured 2-Tier Responsive Layout so metrics never crush */}
            <div className="space-y-3.5">
                {filteredResults.map((engineer, index) => {
                    const isTop1 = index === 0;
                    return (
                        <div
                            key={engineer.engineerId}
                            className={clsx(
                                'p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col gap-3.5',
                                isTop1
                                    ? 'bg-gradient-to-r from-orange-500/10 via-black/40 to-black/40 border-orange-500/30 shadow-orange-glow'
                                    : 'bg-black/30 border-white/5 hover:border-white/10'
                            )}
                        >
                            {/* Top Tier: Left = Rank + Name + Discipline + Location | Right = EPI Score + Tier Badge */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                                    <div
                                        className={clsx(
                                            'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm shrink-0',
                                            isTop1
                                                ? 'bg-orange-500 text-white shadow-orange-glow'
                                                : index === 1
                                                ? 'bg-slate-300 text-black font-bold'
                                                : index === 2
                                                ? 'bg-amber-600/60 text-white'
                                                : 'bg-white/5 text-slate-400 border border-white/5'
                                        )}
                                    >
                                        #{index + 1}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center flex-wrap gap-2">
                                            <h4 className="text-sm sm:text-base font-bold text-white font-mono break-words">
                                                {engineer.name}
                                            </h4>
                                            {isTop1 && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20 whitespace-nowrap shrink-0">
                                                    <Sparkles className="w-2.5 h-2.5" /> Studio MVP
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-slate-400 mt-1">
                                            <span className="font-medium text-slate-300">{engineer.discipline}</span>
                                            <span className="hidden sm:inline text-slate-600">•</span>
                                            <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
                                                <MapPin className="w-3 h-3 text-orange-400 shrink-0" /> {engineer.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* EPI Final Score & Badge */}
                                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 font-mono pl-12 sm:pl-0">
                                    <div className="text-left sm:text-right whitespace-nowrap">
                                        <span className="text-2xl sm:text-3xl font-black text-white">{engineer.epiScore}</span>
                                        <span className="text-slate-500 text-xs"> / 100</span>
                                    </div>
                                    <span
                                        className={clsx(
                                            'px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap shrink-0',
                                            engineer.rankTier === 'Tier 1 Elite'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : engineer.rankTier === 'Tier 2 Proficient'
                                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        )}
                                    >
                                        {engineer.rankTier}
                                    </span>
                                </div>
                            </div>

                            {/* Bottom Tier: 4 Full-Width Breakdown Progress Bars */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3 border-t border-white/5 font-mono text-xs">
                                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="text-[10px] text-slate-400 uppercase truncate">CAD Hours (35%)</span>
                                        <span className="text-white font-bold text-xs shrink-0">{engineer.cadScore}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-400 rounded-full transition-all duration-500" style={{ width: `${engineer.cadScore}%` }} />
                                    </div>
                                </div>

                                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="text-[10px] text-slate-400 uppercase truncate">Site GPS (25%)</span>
                                        <span className="text-white font-bold text-xs shrink-0">{engineer.attendanceScore}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${engineer.attendanceScore}%` }} />
                                    </div>
                                </div>

                                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="text-[10px] text-slate-400 uppercase truncate">Submittal QA (25%)</span>
                                        <span className="text-white font-bold text-xs shrink-0">{engineer.qualityScore}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-400 rounded-full transition-all duration-500" style={{ width: `${engineer.qualityScore}%` }} />
                                    </div>
                                </div>

                                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="text-[10px] text-slate-400 uppercase truncate">Logs & MS (15%)</span>
                                        <span className="text-white font-bold text-xs shrink-0">{engineer.complianceScore}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-400 rounded-full transition-all duration-500" style={{ width: `${engineer.complianceScore}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
