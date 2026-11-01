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
        <div className="fixed inset-0 z-50 bg-[#0a0a0a] text-white flex flex-col overflow-hidden select-none font-sans">
            {/* Top Boardroom Control Bar */}
            <div className="h-16 bg-[#111] border-b border-white/10 px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-all"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Exit Boardroom
                    </button>

                    <div className="h-4 w-px bg-white/10"></div>

                    {/* Project Selector */}
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-orange-400" />
                        <select
                            value={selectedProject.id}
                            onChange={(e) => {
                                const found = FLAGSHIP_PROJECTS.find(p => p.id === e.target.value);
                                if (found) setSelectedProject(found);
                            }}
                            className="bg-black/60 border border-white/10 text-white text-xs font-mono font-bold rounded-xl px-3 py-1.5 outline-none focus:border-orange-500/50"
                        >
                            {FLAGSHIP_PROJECTS.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.currency})</option>
                            ))}
                        </select>
                    </div>

                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase hidden md:inline">
                        Boardroom Executive Display
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Toggle Client Confidential View (hides internal contractor markup) */}
                    <button
                        onClick={() => setIsClientConfidentialMode(!isClientConfidentialMode)}
                        className={clsx(
                            'px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all',
                            isClientConfidentialMode
                                ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                        )}
                        title="Toggle internal margins vs client view"
                    >
                        {isClientConfidentialMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {isClientConfidentialMode ? 'Client Mode (Clean)' : 'Internal Contractor View'}
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
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 md:p-6 overflow-hidden">
                {/* Left 7 Columns: Interactive 3D BIM Model / Hologram */}
                <div className="lg:col-span-7 flex flex-col h-full rounded-3xl bg-[#121212] border border-white/10 overflow-hidden relative shadow-2xl">
                    <div className="p-4 bg-black/40 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-orange-400" />
                            <h3 className="text-sm font-black font-mono text-white">
                                3D BIM Architectural & Structural Twin
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>IFC LOD 400 • Navisworks Synced</span>
                        </div>
                    </div>

                    <div className="flex-1 p-3 overflow-hidden">
                        <InteractiveBimViewer projectId={selectedProject.id} />
                    </div>
                </div>

                {/* Right 5 Columns: Executive Vital Signs & S-Curve Health */}
                <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto no-scrollbar font-mono text-xs">
                    {/* Card 1: Project Vital Signs */}
                    <div className="p-5 rounded-3xl bg-[#141414] border border-white/10 shadow-xl space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div>
                                <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
                                    {selectedProject.branchLocation} Region
                                </span>
                                <h2 className="text-base font-black text-white">{selectedProject.name}</h2>
                            </div>
                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {selectedProject.phase}
                            </span>
                        </div>

                        {/* Financial Metrics */}
                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                                <span className="text-[10px] text-slate-400 block uppercase">Total Contract Value</span>
                                <span className="text-lg font-black text-white mt-1 block">
                                    {selectedProject.currency} {(selectedProject.budget || 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                                <span className="text-[10px] text-slate-400 block uppercase">Earned Value (EV)</span>
                                <span className="text-lg font-black text-emerald-400 mt-1 block">
                                    {selectedProject.currency} {Math.round((selectedProject.budget || 0) * 0.62).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* EVM Ratios */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
                                <span className="text-slate-400 text-[11px]">Schedule (SPI):</span>
                                <span className="text-emerald-400 font-black text-sm">1.04 (Ahead)</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-between">
                                <span className="text-slate-400 text-[11px]">Cost (CPI):</span>
                                <span className="text-cyan-400 font-black text-sm">1.08 (Under Budget)</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: 5-Gate Scope Shield Status */}
                    <div className="p-5 rounded-3xl bg-[#141414] border border-white/10 shadow-xl space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-white flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-orange-400" /> 5-Gate Scope Governance
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                Protected
                            </span>
                        </div>

                        <div className="space-y-2 text-[11px]">
                            <div className="flex justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                                <span className="text-slate-400">Pre-Contract Governance Gate:</span>
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> 4/4 Passed (NOC / Retainer / Contract)
                                </span>
                            </div>
                            <div className="flex justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                                <span className="text-slate-400">Revision Cap Status:</span>
                                <span className="text-orange-400 font-bold">1 / 2 Free Rounds Used</span>
                            </div>
                            <div className="flex justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                                <span className="text-slate-400">Contractual Retention Held:</span>
                                <span className="text-white font-bold">{selectedProject.currency} {Math.round((selectedProject.budget || 0) * 0.05).toLocaleString()} (5%)</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Live Site Cam & Drone Weather Simulator */}
                    <div className="p-5 rounded-3xl bg-[#141414] border border-white/10 shadow-xl space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-white flex items-center gap-2">
                                <Camera className="w-4 h-4 text-emerald-400" /> Live Site Telemetry Feed
                            </span>
                            <span className="text-[10px] text-slate-400">Drone Cam 04</span>
                        </div>

                        <div className="h-28 rounded-2xl bg-black/80 border border-white/5 relative overflow-hidden flex items-center justify-center">
                            <div className="absolute top-2 left-2 text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> REC 4K LIVE
                            </div>
                            <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 font-mono">
                                28°C Clear • Wind: 11 km/h • 48 Staff On-Site
                            </div>
                            <span className="text-slate-600 text-xs font-mono">Saadiyat Zone 4 Site Panoramic Camera</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
