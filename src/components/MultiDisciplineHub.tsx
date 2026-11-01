import React, { useState } from 'react';
import {
    Layers,
    Compass,
    Palette,
    HardHat,
    CheckCircle2,
    AlertCircle,
    Download,
    Search,
    Plus,
    Sparkles
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface DrawingSheet {
    code: string;
    title: string;
    discipline: 'Architecture' | 'Structural' | 'MEP' | 'Interior';
    rev: string;
    lod: 'LOD 300' | 'LOD 350' | 'LOD 400';
    status: 'IFC Approved' | 'Under Consultant Review' | 'Tender Stage' | 'Superseded';
    date: string;
    author: string;
}

interface FfeItem {
    id: string;
    space: string;
    category: 'Flooring / Marble' | 'Joinery & Wood' | 'Lighting Fixture' | 'Sanitaryware' | 'Loose Furniture';
    itemDescription: string;
    brand: string;
    supplier: string;
    unitPrice: number;
    sampleBoardSigned: boolean;
    status: 'Client Signed' | 'Sample Under Review' | 'Procurement Issued' | 'Site Delivered';
    leadTimeWeeks: number;
}

interface ConcretePourRecord {
    id: string;
    pourDate: string;
    element: string;
    volumeM3: number;
    batchPlant: string;
    slumpMm: number;
    strengthTargetMpa: number;
    sevenDayMpa: number;
    twentyEightDayMpa: number;
    status: 'Passed (Safe)' | 'Pending 28D Test' | 'NCR Flagged';
}

const SAMPLE_DRAWINGS: DrawingSheet[] = [
    { code: 'A-101', title: 'Ground Floor General Arrangement Plan', discipline: 'Architecture', rev: 'Rev 03', lod: 'LOD 400', status: 'IFC Approved', date: '2026-10-24', author: 'Eng. Michael Magdy' },
    { code: 'A-102', title: 'First Floor Executive Suite & Terrace Plan', discipline: 'Architecture', rev: 'Rev 02', lod: 'LOD 350', status: 'IFC Approved', date: '2026-10-18', author: 'Eng. Michael Magdy' },
    { code: 'A-201', title: 'North & South Exterior Facade Elevations', discipline: 'Architecture', rev: 'Rev 03', lod: 'LOD 400', status: 'IFC Approved', date: '2026-10-22', author: 'Eng. Michael Magdy' },
    { code: 'S-101', title: 'Foundation Raft & Retaining Wall Reinforcement', discipline: 'Structural', rev: 'Rev 04', lod: 'LOD 400', status: 'IFC Approved', date: '2026-10-25', author: 'Eng. Mohamed Saber' },
    { code: 'S-201', title: 'First Floor Suspended Slab & Post-Tensioning Layout', discipline: 'Structural', rev: 'Rev 02', lod: 'LOD 350', status: 'Under Consultant Review', date: '2026-10-28', author: 'Eng. Mohamed Saber' },
    { code: 'ID-401', title: 'VIP Majlis Flooring & Marble Bookmatching Pattern', discipline: 'Interior', rev: 'Rev 01', lod: 'LOD 350', status: 'IFC Approved', date: '2026-10-15', author: 'Eng. Farida Karim' },
    { code: 'ID-501', title: 'Master Dressing Room Smoked Oak Joinery Details', discipline: 'Interior', rev: 'Rev 02', lod: 'LOD 350', status: 'IFC Approved', date: '2026-10-20', author: 'Eng. Farida Karim' },
    { code: 'M-101', title: 'HVAC Chilled Water Piping & Air Distribution Layout', discipline: 'MEP', rev: 'Rev 02', lod: 'LOD 350', status: 'Under Consultant Review', date: '2026-10-27', author: 'Eng. Tarek Shawky' },
];

const SAMPLE_FFE: FfeItem[] = [
    { id: 'FFE-01', space: 'VIP Majlis & Reception', category: 'Flooring / Marble', itemDescription: 'Italian Calacatta Oro Bookmatched Marble (20mm Slabs)', brand: 'Antolini Italy', supplier: 'Al-Ain Marble Co.', unitPrice: 4200, sampleBoardSigned: true, status: 'Client Signed', leadTimeWeeks: 6 },
    { id: 'FFE-02', space: 'Executive Boardroom', category: 'Joinery & Wood', itemDescription: 'Acoustic Fluted Smoked American White Oak Paneling', brand: 'Poliform Studio', supplier: 'Nile Fine Woodworks', unitPrice: 3100, sampleBoardSigned: true, status: 'Procurement Issued', leadTimeWeeks: 4 },
    { id: 'FFE-03', space: 'Main Atrium Void', category: 'Lighting Fixture', itemDescription: 'Custom 24-Ring Brushed Brass Architectural Chandelier', brand: 'Flos Bespoke', supplier: 'Lumina Tech Dubai', unitPrice: 85000, sampleBoardSigned: true, status: 'Client Signed', leadTimeWeeks: 8 },
    { id: 'FFE-04', space: 'Master Penthouse Suite', category: 'Sanitaryware', itemDescription: 'Free-Standing Composite Stone Bathtub & Matte Black Trim', brand: 'Dornbracht MEM', supplier: 'Sanitec Luxury', unitPrice: 28500, sampleBoardSigned: true, status: 'Site Delivered', leadTimeWeeks: 2 },
    { id: 'FFE-05', space: 'Formal Dining Salon', category: 'Loose Furniture', itemDescription: 'Minotti 12-Seater Marble Top Dining Table with Brushed Steel Base', brand: 'Minotti Morgan', supplier: 'Habitat Interiors', unitPrice: 110000, sampleBoardSigned: false, status: 'Sample Under Review', leadTimeWeeks: 10 },
];

const SAMPLE_POURS: ConcretePourRecord[] = [
    { id: 'CPR-2026-088', pourDate: '2026-10-29', element: 'Basement 02 Raft Foundation (Sector B)', volumeM3: 420, batchPlant: 'Unimix Batching Plant #3', slumpMm: 130, strengthTargetMpa: 40, sevenDayMpa: 31.8, twentyEightDayMpa: 44.2, status: 'Passed (Safe)' },
    { id: 'CPR-2026-089', pourDate: '2026-10-30', element: 'Ground Floor Columns (Grid C1 to C12)', volumeM3: 65, batchPlant: 'Unimix Batching Plant #3', slumpMm: 125, strengthTargetMpa: 45, sevenDayMpa: 35.4, twentyEightDayMpa: 0, status: 'Pending 28D Test' },
    { id: 'CPR-2026-090', pourDate: '2026-10-31', element: 'First Floor Post-Tensioned Solid Slab', volumeM3: 280, batchPlant: 'Lafarge Readymix', slumpMm: 140, strengthTargetMpa: 40, sevenDayMpa: 33.1, twentyEightDayMpa: 0, status: 'Pending 28D Test' },
];

export const MultiDisciplineHub: React.FC = () => {
    const [disciplineTab, setDisciplineTab] = useState<'architecture' | 'interiors' | 'civil'>('architecture');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredDrawings = SAMPLE_DRAWINGS.filter(d =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.discipline.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredFfe = SAMPLE_FFE.filter(f =>
        f.itemDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.space.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-orange-glow">
                            <Layers className="w-4 h-4" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                            Multi-Discipline Engineering Hub
                        </h1>
                        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            AEC Unified Suite
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                        Integrated operations for Architectural Drawing Registers (MDL), Interior Design FF&E Sample Matrices, and Civil Site Pour Quality.
                    </p>
                </div>

                {/* Discipline Selector Buttons */}
                <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/5 rounded-xl self-start md:self-auto overflow-x-auto">
                    <button
                        onClick={() => setDisciplineTab('architecture')}
                        className={clsx(
                            'px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap',
                            disciplineTab === 'architecture'
                                ? 'bg-orange-500 text-white shadow-orange-glow'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <Compass className="w-3.5 h-3.5" /> Architecture & BIM (MDL)
                    </button>
                    <button
                        onClick={() => setDisciplineTab('interiors')}
                        className={clsx(
                            'px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap',
                            disciplineTab === 'interiors'
                                ? 'bg-orange-500 text-white shadow-orange-glow'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <Palette className="w-3.5 h-3.5" /> Interior Design & FF&E
                    </button>
                    <button
                        onClick={() => setDisciplineTab('civil')}
                        className={clsx(
                            'px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap',
                            disciplineTab === 'civil'
                                ? 'bg-orange-500 text-white shadow-orange-glow'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <HardHat className="w-3.5 h-3.5" /> Civil & Concrete Supervision
                    </button>
                </div>
            </div>

            {/* TAB 1: ARCHITECTURAL MASTER DRAWING REGISTER (MDL) */}
            {disciplineTab === 'architecture' && (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                            <input
                                type="text"
                                placeholder="Search sheet code, drawing title, author..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono placeholder-slate-600 outline-none focus:border-orange-500/50"
                            />
                        </div>
                        <button
                            onClick={() => toast.success('Exporting Master Drawing Register (MDL) to Excel...')}
                            className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/30 text-slate-300 hover:text-white font-mono text-xs flex items-center justify-center gap-1.5 transition-all"
                        >
                            <Download className="w-3.5 h-3.5" /> Export MDL (.XLSX)
                        </button>
                    </div>

                    <div className="glass-card rounded-2xl border border-white/5 bg-[#141414]/90 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-mono text-xs">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px] bg-black/40">
                                        <th className="py-3 px-4">Sheet No</th>
                                        <th className="py-3 px-4">Drawing Title</th>
                                        <th className="py-3 px-4">Discipline</th>
                                        <th className="py-3 px-4">Revision</th>
                                        <th className="py-3 px-4">BIM LOD</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Author</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredDrawings.map((dwg) => (
                                        <tr key={dwg.code} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="py-3 px-4 text-orange-400 font-bold">{dwg.code}</td>
                                            <td className="py-3 px-4 text-white font-medium">{dwg.title}</td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 border border-white/10 text-slate-300">
                                                    {dwg.discipline}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-cyan-400 font-semibold">{dwg.rev}</td>
                                            <td className="py-3 px-4 text-slate-400">{dwg.lod}</td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={clsx(
                                                        'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                                                        dwg.status === 'IFC Approved'
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    )}
                                                >
                                                    {dwg.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-400 text-[11px]">{dwg.author}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: INTERIOR DESIGN FF&E MATRIX */}
            {disciplineTab === 'interiors' && (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                            <input
                                type="text"
                                placeholder="Search finish, brand, space, supplier..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono placeholder-slate-600 outline-none focus:border-orange-500/50"
                            />
                        </div>
                        <button
                            onClick={() => toast.success('FF&E Procurement Pack Generated!')}
                            className="px-3.5 py-2 rounded-xl bg-orange-500 text-white font-mono text-xs font-bold shadow-orange-glow hover:bg-orange-600 flex items-center justify-center gap-1.5 transition-all"
                        >
                            <Sparkles className="w-3.5 h-3.5" /> Generate Sample Board PDF
                        </button>
                    </div>

                    <div className="glass-card rounded-2xl border border-white/5 bg-[#141414]/90 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-mono text-xs">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px] bg-black/40">
                                        <th className="py-3 px-4">Space / Room</th>
                                        <th className="py-3 px-4">Category</th>
                                        <th className="py-3 px-4">Specification Details</th>
                                        <th className="py-3 px-4">Brand & Supplier</th>
                                        <th className="py-3 px-4 text-right">Unit Rate (EGP)</th>
                                        <th className="py-3 px-4 text-center">Sample Signed</th>
                                        <th className="py-3 px-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredFfe.map((item) => (
                                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="py-3.5 px-4 text-white font-bold">{item.space}</td>
                                            <td className="py-3.5 px-4 text-slate-400">{item.category}</td>
                                            <td className="py-3.5 px-4 text-slate-200 font-medium max-w-xs">{item.itemDescription}</td>
                                            <td className="py-3.5 px-4">
                                                <div className="text-white font-semibold">{item.brand}</div>
                                                <div className="text-[10px] text-slate-500">{item.supplier} (Lead: {item.leadTimeWeeks}w)</div>
                                            </td>
                                            <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">
                                                {item.unitPrice.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                {item.sampleBoardSigned ? (
                                                    <span className="inline-flex items-center text-emerald-400 gap-1 font-bold text-[10px]">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-amber-400 gap-1 text-[10px]">
                                                        <AlertCircle className="w-3.5 h-3.5" /> Pending Sign
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10">
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: CIVIL & CONCRETE POUR SUPERVISION */}
            {disciplineTab === 'civil' && (
                <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-black text-white font-mono uppercase tracking-wider flex items-center gap-2">
                                <HardHat className="w-4 h-4 text-orange-400" /> Resident Engineer Concrete Quality Register
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5 font-mono">
                                Compressive cube break tracking: 7-Day target &ge; 70% (f_cu), 28-Day target &ge; 100% (40 to 45 MPa).
                            </p>
                        </div>
                        <button
                            onClick={() => toast.success('New Pour Ticket Logged!')}
                            className="px-3.5 py-2 rounded-xl bg-orange-500 text-white font-mono text-xs font-bold shadow-orange-glow hover:bg-orange-600 flex items-center gap-1.5 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" /> Record Pour Ticket
                        </button>
                    </div>

                    <div className="glass-card rounded-2xl border border-white/5 bg-[#141414]/90 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-mono text-xs">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px] bg-black/40">
                                        <th className="py-3 px-4">Ticket No</th>
                                        <th className="py-3 px-4">Pour Date</th>
                                        <th className="py-3 px-4">Structural Element</th>
                                        <th className="py-3 px-4">Volume (m³)</th>
                                        <th className="py-3 px-4">Slump (mm)</th>
                                        <th className="py-3 px-4">Target f_cu</th>
                                        <th className="py-3 px-4">7-Day Test</th>
                                        <th className="py-3 px-4">28-Day Test</th>
                                        <th className="py-3 px-4">Quality Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {SAMPLE_POURS.map((pour) => (
                                        <tr key={pour.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="py-3.5 px-4 text-orange-400 font-bold">{pour.id}</td>
                                            <td className="py-3.5 px-4 text-slate-300">{pour.pourDate}</td>
                                            <td className="py-3.5 px-4 text-white font-medium">{pour.element}</td>
                                            <td className="py-3.5 px-4 text-cyan-400 font-bold">{pour.volumeM3} m³</td>
                                            <td className="py-3.5 px-4 text-slate-300">{pour.slumpMm} mm</td>
                                            <td className="py-3.5 px-4 text-slate-400">{pour.strengthTargetMpa} MPa</td>
                                            <td className="py-3.5 px-4 text-emerald-400 font-bold">{pour.sevenDayMpa} MPa</td>
                                            <td className="py-3.5 px-4">
                                                {pour.twentyEightDayMpa > 0 ? (
                                                    <span className="text-emerald-400 font-black">{pour.twentyEightDayMpa} MPa</span>
                                                ) : (
                                                    <span className="text-slate-500 italic">In Curing Tank</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span
                                                    className={clsx(
                                                        'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                                                        pour.status === 'Passed (Safe)'
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    )}
                                                >
                                                    {pour.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
