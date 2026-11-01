import React, { useState } from 'react';
import {
    TrendingUp,
    DollarSign,
    Layers,
    Activity,
    Calendar,
    ArrowUpRight,
    ShieldCheck,
    CheckCircle2
} from 'lucide-react';
import clsx from 'clsx';

interface SCurvePoint {
    month: string;
    pv: number; // Planned Value (%)
    ev: number; // Earned Value (%)
    ac: number; // Actual Cost (%)
}

const DEFAULT_S_CURVE: SCurvePoint[] = [
    { month: 'Jan', pv: 5, ev: 5, ac: 4 },
    { month: 'Feb', pv: 12, ev: 14, ac: 11 },
    { month: 'Mar', pv: 24, ev: 26, ac: 22 },
    { month: 'Apr', pv: 38, ev: 41, ac: 35 },
    { month: 'May', pv: 55, ev: 57, ac: 50 },
    { month: 'Jun', pv: 70, ev: 68, ac: 63 },
    { month: 'Jul', pv: 82, ev: 80, ac: 74 },
    { month: 'Aug', pv: 91, ev: 89, ac: 83 },
    { month: 'Sep', pv: 97, ev: 95, ac: 89 },
    { month: 'Oct', pv: 100, ev: 99, ac: 93 },
];

const DISCIPLINE_UTILIZATION = [
    { discipline: 'Construction Supervision (316 Staff • 60% of MC)', allocation: 97, target: 90, color: '#10b981' },
    { discipline: 'Water, WWTP & SWRO Desalination (42 Staff)', allocation: 95, target: 90, color: '#38bdf8' },
    { discipline: 'Electromechanical, Power & SCADA (61 Staff)', allocation: 93, target: 85, color: '#f3822d' },
    { discipline: 'Structural, Civil & Highway Roads (37 Staff)', allocation: 91, target: 85, color: '#a855f7' },
    { discipline: 'Architecture, BIM 360 & Env. ESIA (39 Staff)', allocation: 89, target: 85, color: '#ec4899' },
    { discipline: 'Project Mgmt, Tenders & Corporate (32 Staff)', allocation: 94, target: 88, color: '#eab308' },
];

const CASHFLOW_FORECAST = [
    { month: 'Nov 2026', inflow: 3850000, outflow: 3120000, net: 730000, status: 'Surplus' },
    { month: 'Dec 2026', inflow: 4200000, outflow: 3450000, net: 750000, status: 'Surplus' },
    { month: 'Jan 2027', inflow: 2900000, outflow: 2600000, net: 300000, status: 'Buffer Safe' },
    { month: 'Feb 2027', inflow: 5100000, outflow: 4100000, net: 1000000, status: 'Surplus' },
    { month: 'Mar 2027', inflow: 4600000, outflow: 3900000, net: 700000, status: 'Surplus' },
    { month: 'Apr 2027', inflow: 3300000, outflow: 2800000, net: 500000, status: 'Buffer Safe' },
];

const SUBMITTAL_METRICS = [
    { type: 'Shop Drawings (SD)', total: 142, codeA: 98, codeB: 32, codeC: 10, codeD: 2, avgDays: 5.2 },
    { type: 'Material Approvals (MAT)', total: 86, codeA: 64, codeB: 18, codeC: 4, codeD: 0, avgDays: 4.1 },
    { type: 'Method Statements (MS)', total: 28, codeA: 22, codeB: 5, codeC: 1, codeD: 0, avgDays: 3.8 },
    { type: 'Work Inspection Req (WIR)', total: 312, codeA: 284, codeB: 22, codeC: 6, codeD: 0, avgDays: 1.1 },
];

export const ExecutiveBiCharts: React.FC<{ selectedProjectName?: string }> = ({ selectedProjectName = 'HCT Fujairah (MOID / DEC) & Toshka 395k-Acre Reclamation' }) => {
    const [activeTab, setActiveTab] = useState<'scurve' | 'cashflow' | 'disciplines' | 'submittals'>('scurve');
    const [hoveredPoint, setHoveredPoint] = useState<SCurvePoint | null>(null);

    // Current EVM Metrics from latest data point
    const currentPoint = DEFAULT_S_CURVE[DEFAULT_S_CURVE.length - 1];
    const spi = (currentPoint.ev / currentPoint.pv).toFixed(2);
    const cpi = (currentPoint.ev / currentPoint.ac).toFixed(2);
    const scheduleStatus = Number(spi) >= 1.0 ? 'Ahead of Schedule' : 'Minor Delay';
    const costStatus = Number(cpi) >= 1.0 ? 'Under Budget / Profitable' : 'Cost Overrun Risk';

    // SVG coordinate math for S-Curve
    const svgWidth = 720;
    const svgHeight = 240;
    const paddingX = 40;
    const paddingY = 24;
    const plotWidth = svgWidth - paddingX * 2;
    const plotHeight = svgHeight - paddingY * 2;

    const getX = (index: number) => paddingX + (index / (DEFAULT_S_CURVE.length - 1)) * plotWidth;
    const getY = (val: number) => paddingY + (1 - val / 100) * plotHeight;

    const pvPath = DEFAULT_S_CURVE.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(pt.pv)}`).join(' ');
    const evPath = DEFAULT_S_CURVE.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(pt.ev)}`).join(' ');
    const acPath = DEFAULT_S_CURVE.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(pt.ac)}`).join(' ');

    return (
        <div className="glass-card rounded-2xl md:rounded-[32px] p-4 md:p-7 border border-white/5 bg-[#141414]/90 relative overflow-hidden shadow-2xl">
            {/* Ambient Background Glow */}
            <div
                className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, #f3822d 0%, transparent 70%)' }}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-5">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-orange-glow">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                            Executive BI & Project Intelligence
                        </h2>
                        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Live Feed
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                        Active Scope: <span className="text-orange-400 font-semibold">{selectedProjectName}</span> • Real-Time EVM & Operational Telemetry
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/5 rounded-xl self-start md:self-auto overflow-x-auto max-w-full">
                    <button
                        onClick={() => setActiveTab('scurve')}
                        className={clsx(
                            'px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap',
                            activeTab === 'scurve'
                                ? 'bg-orange-500 text-white shadow-orange-glow'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <TrendingUp className="w-3.5 h-3.5" /> S-Curve (EVM)
                    </button>
                    <button
                        onClick={() => setActiveTab('cashflow')}
                        className={clsx(
                            'px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap',
                            activeTab === 'cashflow'
                                ? 'bg-orange-500 text-white shadow-orange-glow'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <DollarSign className="w-3.5 h-3.5" /> Cashflow Cone
                    </button>
                    <button
                        onClick={() => setActiveTab('disciplines')}
                        className={clsx(
                            'px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap',
                            activeTab === 'disciplines'
                                ? 'bg-orange-500 text-white shadow-orange-glow'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <Layers className="w-3.5 h-3.5" /> Disciplines
                    </button>
                    <button
                        onClick={() => setActiveTab('submittals')}
                        className={clsx(
                            'px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap',
                            activeTab === 'submittals'
                                ? 'bg-orange-500 text-white shadow-orange-glow'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Submittals (SD/MAT)
                    </button>
                </div>
            </div>

            {/* TAB 1: S-CURVE (EARNED VALUE MANAGEMENT) */}
            {activeTab === 'scurve' && (
                <div>
                    {/* Top EVM KPI Badges */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                                Schedule Performance (SPI)
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className={clsx('text-2xl font-black font-mono', Number(spi) >= 1 ? 'text-emerald-400' : 'text-amber-400')}>
                                    {spi}
                                </span>
                                <span className="text-[10px] font-semibold text-emerald-400 flex items-center">
                                    <ArrowUpRight className="w-3 h-3" /> +4% Fast
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-0.5">{scheduleStatus}</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                                Cost Performance (CPI)
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className={clsx('text-2xl font-black font-mono', Number(cpi) >= 1 ? 'text-emerald-400' : 'text-red-400')}>
                                    {cpi}
                                </span>
                                <span className="text-[10px] font-semibold text-emerald-400 flex items-center">
                                    <ArrowUpRight className="w-3 h-3" /> +8% Marg
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-0.5">{costStatus}</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                                Earned Value (EV)
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black font-mono text-orange-400">
                                    {currentPoint.ev}%
                                </span>
                                <span className="text-[10px] font-semibold text-slate-400">
                                    vs {currentPoint.pv}% PV
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-0.5">EGP 24.8M Completed</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                                Actual Cost vs Budget (AC)
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black font-mono text-cyan-400">
                                    {currentPoint.ac}%
                                </span>
                                <span className="text-[10px] font-semibold text-emerald-400">
                                    Save 6%
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-0.5">EGP 22.9M Spent (BAC: 26M)</span>
                        </div>
                    </div>

                    {/* Interactive SVG S-Curve */}
                    <div className="relative bg-black/50 border border-white/5 rounded-2xl p-4 overflow-hidden">
                        <div className="flex items-center justify-between mb-3 text-xs font-mono">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5 text-slate-400">
                                    <span className="w-3 h-0.5 bg-slate-500 border-t border-dashed border-slate-300"></span> Planned Value (PV Baseline)
                                </span>
                                <span className="flex items-center gap-1.5 text-orange-400 font-semibold">
                                    <span className="w-3 h-1 bg-orange-500 rounded-full"></span> Earned Value (EV Live)
                                </span>
                                <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                                    <span className="w-3 h-1 bg-cyan-400 rounded-full"></span> Actual Cost (AC)
                                </span>
                            </div>
                            <span className="text-slate-500 text-[11px]">Hover nodes for details</span>
                        </div>

                        <div className="w-full overflow-x-auto">
                            <svg
                                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                                className="w-full h-48 md:h-64 select-none"
                            >
                                {/* Grid Lines */}
                                {[0, 25, 50, 75, 100].map(val => (
                                    <g key={val}>
                                        <line
                                            x1={paddingX}
                                            y1={getY(val)}
                                            x2={svgWidth - paddingX}
                                            y2={getY(val)}
                                            stroke="rgba(255,255,255,0.06)"
                                            strokeDasharray="4 4"
                                        />
                                        <text
                                            x={paddingX - 8}
                                            y={getY(val) + 4}
                                            fill="#64748b"
                                            fontSize="9"
                                            textAnchor="end"
                                            fontFamily="monospace"
                                        >
                                            {val}%
                                        </text>
                                    </g>
                                ))}

                                {/* PV Curve (Dashed) */}
                                <path
                                    d={pvPath}
                                    fill="none"
                                    stroke="#64748b"
                                    strokeWidth="2"
                                    strokeDasharray="5 5"
                                    opacity="0.7"
                                />

                                {/* AC Curve (Cyan) */}
                                <path
                                    d={acPath}
                                    fill="none"
                                    stroke="#38bdf8"
                                    strokeWidth="2.5"
                                />

                                {/* EV Curve (Orange Glowing) */}
                                <path
                                    d={evPath}
                                    fill="none"
                                    stroke="#f3822d"
                                    strokeWidth="3.5"
                                    filter="drop-shadow(0 0 6px rgba(243, 130, 45, 0.4))"
                                />

                                {/* Interactive Data Nodes */}
                                {DEFAULT_S_CURVE.map((pt, i) => {
                                    const cx = getX(i);
                                    const cy = getY(pt.ev);
                                    return (
                                        <g
                                            key={pt.month}
                                            className="cursor-pointer group"
                                            onMouseEnter={() => setHoveredPoint(pt)}
                                            onMouseLeave={() => setHoveredPoint(null)}
                                        >
                                            {/* Hover vertical rule */}
                                            <line
                                                x1={cx}
                                                y1={paddingY}
                                                x2={cx}
                                                y2={svgHeight - paddingY}
                                                stroke="rgba(243, 130, 45, 0.2)"
                                                strokeWidth="1"
                                                opacity={hoveredPoint?.month === pt.month ? 1 : 0}
                                            />
                                            {/* Node circle */}
                                            <circle
                                                cx={cx}
                                                cy={cy}
                                                r={hoveredPoint?.month === pt.month ? 6 : 4}
                                                fill="#f3822d"
                                                stroke="#0f0f0f"
                                                strokeWidth="2"
                                                className="transition-all duration-200"
                                            />
                                            {/* Month Label */}
                                            <text
                                                x={cx}
                                                y={svgHeight - 6}
                                                fill={hoveredPoint?.month === pt.month ? '#f3822d' : '#94a3b8'}
                                                fontSize="10"
                                                textAnchor="middle"
                                                fontFamily="monospace"
                                                fontWeight={hoveredPoint?.month === pt.month ? 'bold' : 'normal'}
                                            >
                                                {pt.month}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>

                        {/* Node Tooltip Card */}
                        {hoveredPoint && (
                            <div className="mt-2 p-2.5 rounded-xl bg-black/80 border border-orange-500/30 flex items-center justify-between text-xs font-mono">
                                <span className="text-white font-bold">{hoveredPoint.month} Milestone Report:</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-slate-400">PV: <strong className="text-slate-200">{hoveredPoint.pv}%</strong></span>
                                    <span className="text-orange-400">EV: <strong className="text-white">{hoveredPoint.ev}%</strong></span>
                                    <span className="text-cyan-400">AC: <strong className="text-white">{hoveredPoint.ac}%</strong></span>
                                    <span className="text-emerald-400">Delta: +{(hoveredPoint.ev - hoveredPoint.ac).toFixed(1)}% Net Margin</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: 6-MONTH ROLLING CASHFLOW FORECAST CONE */}
            {activeTab === 'cashflow' && (
                <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-black text-white font-mono uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Executive Treasury Liquidity Shield
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Automated 6-month predictive model syncing milestone completion billing with subcontractor payment cycles.
                            </p>
                        </div>
                        <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold text-xs">
                            Current Safe Liquidity: EGP 4,280,000
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-xs">
                            <thead>
                                <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                                    <th className="py-3 px-3">Forecast Period</th>
                                    <th className="py-3 px-3 text-right">Projected Inflow (Client Milestone)</th>
                                    <th className="py-3 px-3 text-right">Committed Outflow (Subs & Supplies)</th>
                                    <th className="py-3 px-3 text-right">Net Monthly Surplus</th>
                                    <th className="py-3 px-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {CASHFLOW_FORECAST.map((row) => (
                                    <tr key={row.month} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3.5 px-3 text-white font-bold flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-orange-400" /> {row.month}
                                        </td>
                                        <td className="py-3.5 px-3 text-right text-emerald-400 font-semibold">
                                            +EGP {row.inflow.toLocaleString()}
                                        </td>
                                        <td className="py-3.5 px-3 text-right text-slate-300">
                                            -EGP {row.outflow.toLocaleString()}
                                        </td>
                                        <td className="py-3.5 px-3 text-right text-white font-black">
                                            EGP {row.net.toLocaleString()}
                                        </td>
                                        <td className="py-3.5 px-3 text-center">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: MULTI-DISCIPLINE CAPACITY & UTILIZATION */}
            {activeTab === 'disciplines' && (
                <div className="space-y-4">
                    <p className="text-xs text-slate-400 font-mono">
                        Real-time workload index balancing office CAD/BIM deep-work with civil resident site engineers across 5 engineering disciplines.
                    </p>

                    <div className="space-y-3.5">
                        {DISCIPLINE_UTILIZATION.map((item) => (
                            <div key={item.discipline} className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                                <div className="flex items-center justify-between text-xs font-mono">
                                    <span className="text-white font-bold">{item.discipline}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-500">Target: {item.target}%</span>
                                        <span className="font-bold text-white px-2 py-0.5 rounded-lg bg-white/5 border border-white/10" style={{ color: item.color }}>
                                            {item.allocation}% Utilized
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                            width: `${item.allocation}%`,
                                            backgroundColor: item.color,
                                            boxShadow: `0 0 10px ${item.color}40`
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 4: SUBMITTAL VELOCITY & APPROVAL FUNNEL */}
            {activeTab === 'submittals' && (
                <div className="space-y-4">
                    <p className="text-xs text-slate-400 font-mono">
                        Consultant & Supervising Review Metrics. Target turnaround SLA: &le; 7 calendar days per submittal.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {SUBMITTAL_METRICS.map((sub) => {
                            const codeAPercent = Math.round((sub.codeA / sub.total) * 100);
                            return (
                                <div key={sub.type} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-white font-mono">{sub.type}</h4>
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            Avg SLA: {sub.avgDays} Days
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2 text-center font-mono">
                                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                            <span className="text-[9px] text-emerald-300 block">Code A (Apprv)</span>
                                            <span className="text-base font-black text-emerald-400">{sub.codeA}</span>
                                        </div>
                                        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                            <span className="text-[9px] text-cyan-300 block">Code B (Comms)</span>
                                            <span className="text-base font-black text-cyan-400">{sub.codeB}</span>
                                        </div>
                                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                            <span className="text-[9px] text-amber-300 block">Code C (Revise)</span>
                                            <span className="text-base font-black text-amber-400">{sub.codeC}</span>
                                        </div>
                                        <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                                            <span className="text-[9px] text-red-300 block">Code D (Reject)</span>
                                            <span className="text-base font-black text-red-400">{sub.codeD}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                                        <span>First-Pass Approval Rate</span>
                                        <span className="text-emerald-400 font-bold">{codeAPercent}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
