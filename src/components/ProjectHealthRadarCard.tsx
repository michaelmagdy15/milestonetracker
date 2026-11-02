import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, Coins, ShieldAlert, Radar } from 'lucide-react';
import clsx from 'clsx';
import { useData } from '../context/DataContext';
import { computeProjectRisks, type ProjectRiskType } from '../utils/projectHealthRadar';

const RISK_META: Record<ProjectRiskType, { label: string; icon: React.ElementType; cls: string }> = {
    FIDIC_TIME_BAR: { label: 'FIDIC 28-Day', icon: ShieldAlert, cls: 'text-red-400 bg-red-500/10 border-red-500/30' },
    FEE_UNCOLLECTED: { label: 'Fee Collection', icon: Coins, cls: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    MILESTONE_DUE: { label: 'Milestone Due', icon: Clock, cls: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
    STALLED: { label: 'Stalled', icon: AlertTriangle, cls: 'text-slate-300 bg-white/5 border-white/15' },
};

const FILTERS: Array<ProjectRiskType | 'ALL'> = ['ALL', 'FIDIC_TIME_BAR', 'FEE_UNCOLLECTED', 'MILESTONE_DUE', 'STALLED'];

/** Dashboard card: ranks what needs a director's attention today (ported from MitrixoGYM's Retention Radar). */
export const ProjectHealthRadarCard: React.FC = () => {
    const { projects, entries, milestones } = useData();
    const navigate = useNavigate();
    const [filter, setFilter] = useState<ProjectRiskType | 'ALL'>('ALL');

    const risks = useMemo(() => computeProjectRisks(projects, entries, milestones), [projects, entries, milestones]);
    const counts = useMemo(() => {
        const c: Record<string, number> = { ALL: risks.length };
        for (const r of risks) c[r.riskType] = (c[r.riskType] || 0) + 1;
        return c;
    }, [risks]);
    const visible = (filter === 'ALL' ? risks : risks.filter(r => r.riskType === filter)).slice(0, 8);

    return (
        <div className="p-4 sm:p-5 rounded-3xl bg-[#121212] border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                        <Radar className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-black text-white">Project Health Radar</h3>
                        <p className="text-[11px] text-slate-400 font-mono">What needs your attention today, ranked by urgency</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={clsx(
                                'px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all',
                                filter === f ? 'bg-orange-500 text-white border-orange-400' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                            )}
                        >
                            {f === 'ALL' ? 'All' : RISK_META[f].label} ({counts[f] || 0})
                        </button>
                    ))}
                </div>
            </div>

            {visible.length === 0 ? (
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-center text-xs font-mono text-emerald-400">
                    Nothing flagged. Every project has recent activity, no overdue milestones, and no open FIDIC deadlines.
                </div>
            ) : (
                <div className="space-y-2">
                    {visible.map(r => {
                        const meta = RISK_META[r.riskType];
                        const Icon = meta.icon;
                        return (
                            <button
                                key={r.id}
                                onClick={() => navigate(`/projects/${r.project.id}`)}
                                className="w-full text-left p-3 rounded-2xl bg-black/40 border border-white/5 hover:border-white/20 flex items-start gap-3 transition-all"
                            >
                                <span className={clsx('px-2 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 shrink-0', meta.cls)}>
                                    <Icon className="w-3 h-3" /> {meta.label}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="text-xs font-bold text-white truncate">{r.title}</div>
                                    <div className="text-[11px] text-slate-400 font-mono truncate">
                                        {r.project.name} · {r.detail}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
