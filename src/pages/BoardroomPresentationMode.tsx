import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Maximize2,
    Minimize2,
    Eye,
    EyeOff,
    ArrowLeft,
    ShieldCheck,
    Layers,
    Camera,
    CheckCircle2,
    Building2
} from 'lucide-react';
import clsx from 'clsx';
import { InteractiveBimViewer } from '../components/InteractiveBimViewer';
import { FLAGSHIP_PROJECTS } from '../data/flagshipSeedData';

export const BoardroomPresentationMode: React.FC = () => {
    const navigate = useNavigate();
    const [selectedProject, setSelectedProject] = useState(FLAGSHIP_PROJECTS[0]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isClientConfidentialMode, setIsClientConfidentialMode] = useState(true);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a] text-white flex flex-col overflow-y-auto lg:overflow-hidden select-none font-sans">
            {/* Top Boardroom Control Bar */}
            <div className="min-h-16 py-2.5 bg-[#111] border-b border-white/10 px-3 sm:px-6 flex flex-wrap items-center justify-between gap-2 shrink-0 sticky top-0 z-30">
                <div className="flex items-center flex-wrap gap-2 sm:gap-4 min-w-0 flex-1">
                    <button
                        onClick={() => navigate('/')}
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-all shrink-0"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Exit</span> Boardroom
                    </button>

                    <div className="h-4 w-px bg-white/10 hidden sm:block"></div>

                    {/* Project Selector */}
                    <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
                        <Building2 className="w-4 h-4 text-orange-400 shrink-0 hidden sm:block" />
                        <select
                            value={selectedProject.id}
                            onChange={(e) => {
                                const found = FLAGSHIP_PROJECTS.find(p => p.id === e.target.value);
                                if (found) setSelectedProject(found);
                            }}
                            className="bg-black/60 border border-white/10 text-white text-xs font-mono font-bold rounded-xl px-2.5 sm:px-3 py-1.5 outline-none focus:border-orange-500/50 max-w-[200px] sm:max-w-[340px] md:max-w-md truncate"
                        >
                            {FLAGSHIP_PROJECTS.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.currency})</option>
                            ))}
                        </select>
                    </div>

                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase hidden xl:inline shrink-0">
                        Boardroom Executive Display
                    </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <a
                        href="/MisrConsult-Apple-Teaser.mp4"
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap"
                        title="Watch 45s Apple-Style Commercial Teaser Video"
                    >
                        🎬 <span className="hidden sm:inline">45s</span> Teaser
                    </a>
                    <a
                        href="/DEC-MisrConsult-Executive-Pitch.pptx"
                        download
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap"
                        title="Download Presenton Editable 12-Slide PowerPoint Deck"
                    >
                        ⬇ <span className="hidden sm:inline">Pitch</span> PPTX
                    </a>
                    <a
                        href="/DEC-MisrConsult-Executive-Pitch.pdf"
                        download
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap"
                        title="Download Presenton 12-Slide PDF Deck"
                    >
                        ⬇ PDF
                    </a>
                    <a
                        href="/pitch-deck.html"
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap"
                        title="Open Interactive 12-Slide Presenton Deck"
                    >
                        12-Slide Deck
                    </a>
                    {/* Toggle Client Confidential View (hides internal contractor markup) */}
                    <button
                        onClick={() => setIsClientConfidentialMode(!isClientConfidentialMode)}
                        className={clsx(
                            'px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap',
                            isClientConfidentialMode
                                ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                        )}
                        title="Toggle internal margins vs client view"
                    >
                        {isClientConfidentialMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span className="hidden md:inline">{isClientConfidentialMode ? 'Client Mode (Clean)' : 'Internal Contractor View'}</span>
                        <span className="md:hidden">{isClientConfidentialMode ? 'Client' : 'Internal'}</span>
                    </button>

                    {/* Fullscreen Button */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all"
                        title="Toggle Fullscreen (F11)"
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Main Boardroom Canvas */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-3 sm:p-4 md:p-6 lg:overflow-hidden">
                {/* Left 7 Columns: Interactive 3D BIM Model / Hologram */}
                <div className="lg:col-span-7 flex flex-col min-h-[380px] sm:min-h-[450px] lg:min-h-0 lg:h-full rounded-2xl sm:rounded-3xl bg-[#121212] border border-white/10 overflow-hidden relative shadow-2xl">
                    <div className="p-3 sm:p-4 bg-black/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-orange-400 shrink-0" />
                            <h3 className="text-xs sm:text-sm font-black font-mono text-white">
                                3D BIM Architectural & Structural Twin
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>IFC LOD 400 • Navisworks Synced</span>
                        </div>
                    </div>

                    <div className="flex-1 p-2 sm:p-3 overflow-hidden min-h-[320px]">
                        <InteractiveBimViewer projectId={selectedProject.id} />
                    </div>
                </div>

                {/* Right 5 Columns: Executive Vital Signs & S-Curve Health */}
                <div className="lg:col-span-5 flex flex-col gap-4 lg:overflow-y-auto no-scrollbar font-mono text-xs pb-6 lg:pb-0">
                    {/* Card 1: Project Vital Signs */}
                    <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#141414] border border-white/10 shadow-xl space-y-4">
                        <div className="flex items-start sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                            <div className="min-w-0">
                                <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
                                    {selectedProject.branchLocation} Region
                                </span>
                                <h2 className="text-sm sm:text-base font-black text-white break-words">{selectedProject.name}</h2>
                            </div>
                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                {selectedProject.phase}
                            </span>
                        </div>

                        {/* Financial Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
                            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                                <span className="text-[10px] text-slate-400 block uppercase">Total Contract Value</span>
                                <span className="text-base sm:text-lg font-black text-white mt-1 block">
                                    {selectedProject.currency} {(selectedProject.budget || 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                                <span className="text-[10px] text-slate-400 block uppercase">Earned Value (EV)</span>
                                <span className="text-base sm:text-lg font-black text-emerald-400 mt-1 block">
                                    {selectedProject.currency} {Math.round((selectedProject.budget || 0) * 0.62).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* EVM Ratios */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
                                <span className="text-slate-400 text-[11px]">Schedule (SPI):</span>
                                <span className="text-emerald-400 font-black text-sm">1.04 (Ahead)</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-between">
                                <span className="text-slate-400 text-[11px]">Cost (CPI):</span>
                                <span className="text-cyan-400 font-black text-sm">1.08 (Under Budget)</span>
                            </div>
                        </div>

                        {/* Internal Contractor Margin Box — Hidden when Client Confidential Mode is active */}
                        {!isClientConfidentialMode && (
                            <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/30 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-orange-400 font-bold uppercase">Internal Contractor Net Margin</span>
                                    <span className="text-orange-400 font-black">18.4% Protected</span>
                                </div>
                                <p className="text-[10px] text-slate-300">
                                    Includes 12% OH&P + 6.4% bulk steel/HDPE procurement savings locked via 5-Gate Shield.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Card 2: 5-Gate Scope & FIDIC Protection Status */}
                    <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#141414] border border-white/10 shadow-xl space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 5-Gate Contractual Shield
                            </h4>
                            <span className="text-[10px] text-emerald-400 font-bold">100% Compliant</span>
                        </div>

                        <div className="space-y-2">
                            {[
                                { label: 'Gate 1: Pre-Contract 4-Doc Verification', status: 'Verified & Signed' },
                                { label: 'Gate 2: RIBA Stage 1–5 Revision Cap (Max 2)', status: 'Active (0 Overruns)' },
                                { label: 'Gate 3: FIDIC Clause 20.1 28-Day Notice Bar', status: 'All Notices Safe' },
                                { label: 'Gate 4: Subcontractor 10% Retention Escrow', status: 'Locked in Vault' },
                            ].map((gate, i) => (
                                <div key={i} className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2">
                                    <span className="text-slate-300 text-[11px] truncate">{gate.label}</span>
                                    <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1 shrink-0">
                                        <CheckCircle2 className="w-3 h-3" /> {gate.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card 3: Live Site Telemetry & Drones */}
                    <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#141414] border border-white/10 shadow-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                                <Camera className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-xs font-black text-white truncate">Site Drone & RTK Telemetry</h4>
                                <p className="text-[10px] text-slate-400 truncate">316 Supervision Engineers • GPS Geofence Active</p>
                            </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold shrink-0">
                            LIVE
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
