import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useTenant } from '../context/TenantContext';
import { supabase } from '../lib/supabase';
import { buildAutoVariationOrder } from '../utils/aecScopeGate';
import type { BimPin } from '../types';
import { Box, Layers, MapPin, RotateCw, ZoomIn, ZoomOut, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_PINS: BimPin[] = [
    {
        id: 'pin-seed-1',
        projectId: 'default',
        title: 'HVAC Chilled Water Riser Clash with Transfer Beam B-14',
        elementCode: 'IFC-MEP-CW-204',
        x: 44,
        y: 38,
        discipline: 'Clash',
        status: 'open',
        createdBy: 'BIM Coordinator (Navisworks Sync)',
        createdAt: '2026-03-10T10:00:00Z',
    },
    {
        id: 'pin-seed-2',
        projectId: 'default',
        title: 'Client Requested Skybridge Glazing Spec Upgrade (Triple Low-E)',
        elementCode: 'IFC-ARC-CW-109',
        x: 64,
        y: 56,
        discipline: 'Architecture',
        status: 'open',
        createdBy: 'Client Representative',
        createdAt: '2026-03-11T14:20:00Z',
    },
];

export const InteractiveBimViewer: React.FC<{ projectId?: string }> = ({ projectId }) => {
    const { projects } = useData();
    const { activeOrg } = useTenant();
    const activeProject = projects.find(p => p.id === projectId) || projects[0];

    const [bimPins, setBimPins] = useState<BimPin[]>(() => {
        try {
            const raw = localStorage.getItem('mitrixo_aec_bim_pins_v1');
            return raw ? JSON.parse(raw) : INITIAL_PINS;
        } catch {
            return INITIAL_PINS;
        }
    });

    const savePins = (next: BimPin[]) => {
        setBimPins(next);
        try {
            localStorage.setItem('mitrixo_aec_bim_pins_v1', JSON.stringify(next));
        } catch {
            // ignore quota
        }
    };

    const [rotation, setRotation] = useState<number>(28);
    const [zoom, setZoom] = useState<number>(1);
    const [layers, setLayers] = useState({
        Architecture: true,
        Structure: true,
        MEP: true,
    });
    const [pinMode, setPinMode] = useState(false);
    const [newPinTitle, setNewPinTitle] = useState('');
    const [newPinDiscipline, setNewPinDiscipline] = useState<BimPin['discipline']>('Clash');
    const [pendingCoords, setPendingCoords] = useState<{ x: number; y: number } | null>(null);

    const projectPins = bimPins.filter(
        p => !activeProject || p.projectId === activeProject.id || p.projectId === 'default'
    );

    const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!pinMode) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
        setPendingCoords({ x, y });
    };

    const handleSavePin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pendingCoords || !newPinTitle.trim()) return;
        const created: BimPin = {
            id: crypto.randomUUID(),
            projectId: activeProject?.id || 'default',
            title: newPinTitle.trim(),
            elementCode: `IFC-${newPinDiscipline.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 899)}`,
            x: pendingCoords.x,
            y: pendingCoords.y,
            discipline: newPinDiscipline,
            status: 'open',
            createdBy: 'Partner / Lead Architect',
            createdAt: new Date().toISOString(),
        };
        savePins([created, ...bimPins]);
        setPendingCoords(null);
        setNewPinTitle('');
        setPinMode(false);
        toast.success(`3D Spatial Pin ${created.elementCode} anchored!`);
    };

    const handleConvertPinToVo = async (pin: BimPin) => {
        if (!activeProject) return;
        const vo = buildAutoVariationOrder({
            project: activeProject,
            existingVoCount: Math.floor(Math.random() * 20) + 1,
            estimatedHours: 20,
            reasonTitle: `BIM Spatial Clash / Revision [${pin.elementCode}]: ${pin.title}`,
        });
        await supabase.from('variation_orders').insert({
            id: vo.id,
            organization_id: activeOrg.id,
            project_id: vo.projectId,
            code: vo.code,
            title: vo.title,
            description: vo.description,
            reason_category: vo.reasonCategory,
            status: vo.status,
            contractor_amount: vo.contractorAmount,
            engineer_assessed_amount: vo.engineerAssessedAmount,
            approved_amount: vo.approvedAmount,
            schedule_impact_days: vo.scheduleImpactDays,
            approved_time_days: vo.approvedTimeDays,
            ball_in_court: vo.ballInCourt,
            current_approval_step: vo.currentApprovalStep,
            created_at: vo.createdAt,
        });
        savePins(bimPins.map(p => (p.id === pin.id ? { ...p, status: 'converted_to_vo' } : p)));
        toast.success(`Converted BIM Pin ${pin.elementCode} to Variation Order ${vo.code}!`);
    };

    return (
        <div className="bg-white/90 rounded-[32px] border border-[#192631]/12 shadow-xl p-6 lg:p-8 relative overflow-hidden">
            {/* Top Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-black text-[#192631] tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-[#e04b2a]/10 rounded-xl border border-[#e04b2a]/25">
                            <Box className="w-5 h-5 text-[#e04b2a]" />
                        </div>
                        Interactive 3D Parametric BIM / IFC Spatial Viewer
                    </h3>
                    <p className="text-[#192631]/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ml-12">
                        Model: {activeProject?.name || 'Parametric High-Rise Core'} · IFC4 Spatial Twin
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {(['Architecture', 'Structure', 'MEP'] as const).map(layer => (
                        <button
                            key={layer}
                            type="button"
                            onClick={() => setLayers(prev => ({ ...prev, [layer]: !prev[layer] }))}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 ${
                                layers[layer]
                                    ? 'bg-[#192631] text-white border-[#192631]'
                                    : 'bg-[#f5f5f5] text-[#192631]/50 border-[#192631]/10'
                            }`}
                        >
                            <Layers className="w-3 h-3" />
                            {layer}
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() => setRotation(r => (r + 45) % 360)}
                        className="p-2 rounded-xl bg-[#f5f5f5] border border-[#192631]/12 text-[#192631] hover:text-[#e04b2a]"
                        title="Rotate Isometric Orbit"
                    >
                        <RotateCw className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setZoom(z => Math.min(1.4, Number((z + 0.1).toFixed(1))))}
                        className="p-2 rounded-xl bg-[#f5f5f5] border border-[#192631]/12 text-[#192631] hover:text-[#e04b2a]"
                        title="Zoom In"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setZoom(z => Math.max(0.8, Number((z - 0.1).toFixed(1))))}
                        className="p-2 rounded-xl bg-[#f5f5f5] border border-[#192631]/12 text-[#192631] hover:text-[#e04b2a]"
                        title="Zoom Out"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setPinMode(!pinMode)}
                        className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 ${
                            pinMode
                                ? 'bg-[#e04b2a] text-white border-[#e04b2a] shadow-md'
                                : 'bg-[#e04b2a]/10 text-[#e04b2a] border-[#e04b2a]/30 hover:bg-[#e04b2a]/20'
                        }`}
                    >
                        <MapPin className="w-3.5 h-3.5" />
                        {pinMode ? 'Click Model to Drop Pin' : '+ Drop 3D Clash Pin'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 3D Isometric SVG Viewport */}
                <div
                    onClick={handleCanvasClick}
                    className={`lg:col-span-2 relative aspect-video bg-[#192631] rounded-2xl border border-[#192631]/20 overflow-hidden flex items-center justify-center ${
                        pinMode ? 'cursor-crosshair ring-2 ring-[#e04b2a]' : 'cursor-grab'
                    }`}
                >
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage:
                                'linear-gradient(to right, rgba(224,75,42,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(224,75,42,0.22) 1px, transparent 1px)',
                            backgroundSize: '36px 36px',
                        }}
                    />

                    {/* Parametric 3D Wireframe Tower SVG */}
                    <svg
                        viewBox="0 0 600 380"
                        className="w-full h-full max-h-[360px] transition-transform duration-500"
                        style={{
                            transform: `scale(${zoom}) rotateZ(${rotation * 0.05}deg)`,
                        }}
                    >
                        {/* Podium Base */}
                        <polygon
                            points="300,320 140,250 300,190 460,250"
                            fill="rgba(15,23,42,0.75)"
                            stroke="rgba(148,163,184,0.4)"
                            strokeWidth="2"
                        />

                        {/* Structural Columns & Core (Layer: Structure) */}
                        {layers.Structure && (
                            <g stroke="#f59e0b" strokeWidth="2" opacity="0.85">
                                <line x1="220" y1="265" x2="220" y2="75" />
                                <line x1="300" y1="295" x2="300" y2="55" />
                                <line x1="380" y1="265" x2="380" y2="75" />
                                <line x1="260" y1="230" x2="260" y2="65" />
                                <line x1="340" y1="230" x2="340" y2="65" />
                                {[0, 1, 2, 3, 4].map(level => {
                                    const yOffset = 250 - level * 40;
                                    return (
                                        <polygon
                                            key={level}
                                            points={`300,${yOffset + 35} 200,${yOffset} 300,${yOffset - 35} 400,${yOffset}`}
                                            fill="rgba(245,158,11,0.08)"
                                            stroke="#f59e0b"
                                            strokeWidth="1.5"
                                        />
                                    );
                                })}
                            </g>
                        )}

                        {/* Architectural Curtain Wall Envelope (Layer: Architecture) */}
                        {layers.Architecture && (
                            <g stroke="#38bdf8" strokeWidth="1.5" fill="rgba(56,189,248,0.08)">
                                <polygon points="300,285 200,250 200,90 300,125" />
                                <polygon points="300,285 400,250 400,90 300,125" />
                                <polygon points="300,125 200,90 300,55 400,90" fill="rgba(56,189,248,0.18)" />
                            </g>
                        )}

                        {/* MEP Risers & HVAC Plant (Layer: MEP) */}
                        {layers.MEP && (
                            <g stroke="#10b981" strokeWidth="2.2" strokeDasharray="5,4">
                                <line x1="285" y1="275" x2="285" y2="65" />
                                <line x1="315" y1="275" x2="315" y2="65" />
                                <circle cx="300" cy="88" r="14" fill="rgba(16,185,129,0.25)" />
                            </g>
                        )}
                    </svg>

                    {/* Spatial Pins Overlay */}
                    {projectPins.map(pin => (
                        <div
                            key={pin.id}
                            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 group/pin z-20"
                        >
                            <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-lg cursor-pointer transition-transform group-hover/pin:scale-125 ${
                                    pin.status === 'converted_to_vo'
                                        ? 'bg-emerald-500 border-white text-white'
                                        : 'bg-[#e04b2a] border-white text-white animate-pulse'
                                }`}
                            >
                                <MapPin className="w-3.5 h-3.5" />
                            </div>
                            <div className="hidden group-hover/pin:block absolute left-8 top-0 w-60 p-3 rounded-xl bg-white border border-[#192631]/15 shadow-2xl text-left z-30">
                                <p className="text-[9px] font-black text-[#e04b2a] uppercase tracking-widest">
                                    {pin.elementCode} · {pin.discipline}
                                </p>
                                <p className="text-xs font-bold text-[#192631] mt-0.5">{pin.title}</p>
                            </div>
                        </div>
                    ))}

                    <div className="absolute bottom-3 left-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/80">
                        <span>Orbit: {rotation}°</span>
                        <span>Zoom: {(zoom * 100).toFixed(0)}%</span>
                        <span className="text-[#ff7f50]">{projectPins.length} Spatial Pins</span>
                    </div>
                </div>

                {/* Spatial Pins & Clash -> VO Action Feed */}
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    <p className="text-[10px] font-black text-[#192631]/60 uppercase tracking-widest">
                        Spatial BIM Clashes & Client Revision Pins
                    </p>

                    {pendingCoords && (
                        <form
                            onSubmit={handleSavePin}
                            className="p-4 rounded-2xl bg-[#e04b2a]/10 border border-[#e04b2a]/30 space-y-3"
                        >
                            <p className="text-[10px] font-black text-[#e04b2a] uppercase tracking-widest">
                                New Pin @ X:{pendingCoords.x}% Y:{pendingCoords.y}%
                            </p>
                            <input
                                type="text"
                                required
                                value={newPinTitle}
                                onChange={e => setNewPinTitle(e.target.value)}
                                placeholder="Describe clash or client revision..."
                                className="w-full px-3 py-2 bg-white border border-[#192631]/15 rounded-xl text-xs text-[#192631]"
                            />
                            <div className="flex items-center gap-2">
                                <select
                                    value={newPinDiscipline}
                                    onChange={e => setNewPinDiscipline(e.target.value as BimPin['discipline'])}
                                    className="px-2.5 py-1.5 bg-white border border-[#192631]/15 rounded-lg text-[10px] text-[#192631] font-bold"
                                >
                                    <option value="Clash">MEP/Struct Clash</option>
                                    <option value="Architecture">Architecture</option>
                                    <option value="Structure">Structure</option>
                                    <option value="MEP">MEP</option>
                                </select>
                                <button
                                    type="submit"
                                    className="px-3 py-1.5 bg-[#e04b2a] text-white rounded-lg text-[10px] font-black uppercase tracking-widest"
                                >
                                    Save Pin
                                </button>
                            </div>
                        </form>
                    )}

                    {projectPins.map(pin => (
                        <div
                            key={pin.id}
                            className="p-4 rounded-2xl bg-[#f5f5f5] border border-[#192631]/10 space-y-2"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-[#e04b2a] uppercase tracking-widest">
                                    {pin.elementCode}
                                </span>
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#192631]/10 text-[#192631]/75">
                                    {pin.discipline}
                                </span>
                            </div>
                            <p className="text-xs font-bold text-[#192631] leading-snug">{pin.title}</p>
                            <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] text-[#192631]/55">{pin.createdBy}</span>
                                {pin.status !== 'converted_to_vo' ? (
                                    <button
                                        type="button"
                                        onClick={() => handleConvertPinToVo(pin)}
                                        className="px-2.5 py-1 rounded-lg bg-[#e04b2a]/15 hover:bg-[#e04b2a] text-[#e04b2a] hover:text-white border border-[#e04b2a]/30 text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1"
                                    >
                                        <AlertTriangle className="w-3 h-3" />
                                        Convert to VO
                                    </button>
                                ) : (
                                    <span className="text-[9px] font-black text-[#123524] uppercase tracking-widest">
                                        ✓ Converted to VO
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
