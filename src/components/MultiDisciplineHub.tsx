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
    Sparkles,
    Droplets,
    Activity,
    ShieldCheck,
    Gauge
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface PipelineChainageRecord {
    id: string;
    project: string;
    clientAndOwner: string;
    pipeSpec: string;
    totalLengthKm: number;
    completedKm: number;
    operatingPressureBar: number;
    testPressureBar: number;
    waterHammerStatus: string;
    crossingType: string;
    status: 'Hydro-Test Passed' | 'NDT & Surge Verified' | 'HDD Trenchless Active' | 'SCADA Synced';
}

interface PlantTelemetryRecord {
    id: string;
    plantName: string;
    category: 'SWRO Desalination' | 'Agricultural / Tertiary WWTP' | 'Giant Irrigation Pump Station' | 'Hydrology & Flood Mitigation';
    capacityM3Day: string;
    keyMilestoneAward: string;
    hydraulicHeadOrRecovery: string;
    scadaAndPowerSpec: string;
    authorityApproval: string;
    status: 'Guinness / ENR Certified' | 'IFC & BIM Approved' | 'Commissioning Active';
}

interface DrawingSheet {
    code: string;
    title: string;
    discipline: 'Architecture' | 'Structural' | 'MEP' | 'BIM / Infrastructure';
    rev: string;
    lod: 'LOD 300' | 'LOD 350' | 'LOD 400 (IFC)';
    status: 'IFC Approved' | 'Under Authority Review' | 'Tender Package' | 'As-Built Verified';
    date: string;
    author: string;
}

interface FfeItem {
    id: string;
    space: string;
    category: 'Medical / Hospital MEP' | 'Waterfront & Lagoon Fit-Out' | 'Pump Station HV Switchgear' | 'Smart Control Valves' | 'Architectural Finishes';
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
    status: 'Passed (Watertight C40)' | 'Pending 28D Test' | 'NCR Flagged';
}

const MC_PIPELINES: PipelineChainageRecord[] = [
    {
        id: 'PIPE-TOSHKA-1600',
        project: 'Toshka Reclamation Project (395,000 Acres — Phase 1)',
        clientAndOwner: 'Armed Forces Engineering Authority – Water Dept / Watania (40B EGP)',
        pipeSpec: 'HDPE Transmission Network Ø200mm to Ø1200mm + 6.2km Canals',
        totalLengthKm: 1600,
        completedKm: 1184,
        operatingPressureBar: 10,
        testPressureBar: 15,
        waterHammerStatus: '145 Pump Stations Surge Vessels Active',
        crossingType: 'Desert Trench & Thrust Block Anchors',
        status: 'Hydro-Test Passed'
    },
    {
        id: 'PIPE-WAAD-470',
        project: 'Waad El Shamal Treated Water Transmission Lines (LOT 1 & 2 — KSA)',
        clientAndOwner: 'SNC-Lavalin International / National Water Company NWC ($610.4M USD)',
        pipeSpec: '3x Transmission Lines Ø1200mm (Arar, Shaka & Turaif • Elev 548m→905m)',
        totalLengthKm: 470,
        completedKm: 470,
        operatingPressureBar: 24,
        testPressureBar: 36,
        waterHammerStatus: '7 Booster Stations Transient Analysis Verified',
        crossingType: 'High-Head Steep Terrain Stress-Tested',
        status: 'NDT & Surge Verified'
    },
    {
        id: 'PIPE-ALAMEIN-SMART',
        project: 'New Alamein Smart City Infrastructure Networks (15,600 Acres)',
        clientAndOwner: 'NUCA / Construction Authority for Potable Water & Wastewater (12B EGP)',
        pipeSpec: '385km Water (Ø100–1000mm) + 300km Sewage + 235km Storm + 40km Irrigation',
        totalLengthKm: 960,
        completedKm: 890,
        operatingPressureBar: 8,
        testPressureBar: 12,
        waterHammerStatus: 'Smart Control Valves + 8 Force Mains SCADA',
        crossingType: '3x 40,000m³ + 1x 80,000m³ Underground Tanks',
        status: 'SCADA Synced'
    },
    {
        id: 'PIPE-NAC-210',
        project: 'New Administrative Capital Raw Water 3 Transmission Lines',
        clientAndOwner: 'Arab Contractors, Orascom, Hassan Allam & Concord / NUCA (1.8B EGP)',
        pipeSpec: '3x 70km Transmission Lines Ø2200mm + 1.5M m³/day Tank Farm',
        totalLengthKm: 210,
        completedKm: 210,
        operatingPressureBar: 16,
        testPressureBar: 24,
        waterHammerStatus: '3 Giant Booster Stations (1.5M m³/day) Surge Protected',
        crossingType: 'Nile Offshore Intake & Highway Crossings',
        status: 'Hydro-Test Passed'
    },
    {
        id: 'PIPE-JABAL-ASFAR',
        project: 'Al-Jabal Al-Asfar Force Main & Gravity Sewer Collector',
        clientAndOwner: 'CAPW / New Cairo City Authority — NUCA (4.0B EGP)',
        pipeSpec: 'Gravity Sewer Collector Ø2000mm to Ø3400mm (Suez Rd & West Ring Rd)',
        totalLengthKm: 39.7,
        completedKm: 39.7,
        operatingPressureBar: 6,
        testPressureBar: 9,
        waterHammerStatus: 'Full Hydraulic Grade Line (HGL) Verified',
        crossingType: '30.0km Open Trench + 9.7km Canal Micro-Tunneling',
        status: 'HDD Trenchless Active'
    },
    {
        id: 'PIPE-SAFAGA-HDD',
        project: 'Safaga & Marsa Alam SWRO Offshore Intake & Reject Lines',
        clientAndOwner: 'NOPWASD / Red Sea Potable Water & Wastewater Co.',
        pipeSpec: 'Offshore HDPE Intake Ø800mm & Ø630mm + Reject Lines',
        totalLengthKm: 14.5,
        completedKm: 14.5,
        operatingPressureBar: 12,
        testPressureBar: 18,
        waterHammerStatus: 'Subsea Surge & Brine Dispersion Verified',
        crossingType: 'Executed via HDD (Horizontal Directional Drilling)',
        status: 'Hydro-Test Passed'
    }
];

const MC_PLANTS: PlantTelemetryRecord[] = [
    {
        id: 'PLANT-BAHR-01',
        plantName: 'Bahr Al-Baqar Agricultural Wastewater Treatment Plant',
        category: 'Agricultural / Tertiary WWTP',
        capacityM3Day: '5,600,000 m³/day',
        keyMilestoneAward: '3x Guinness World Records + ENR 2021 Global Best Project (17B EGP)',
        hydraulicHeadOrRecovery: 'World’s Largest Ozone Disinfection & Solar Sludge Drying System',
        scadaAndPowerSpec: 'Full Redundant SCADA + Sinai Reclamation Tertiary Effluent',
        authorityApproval: 'Armed Forces Engineering Authority / Orascom & Arab Contractors',
        status: 'Guinness / ENR Certified'
    },
    {
        id: 'PLANT-NEWDELTA-02',
        plantName: 'New Delta "Mostakbal Misr" Main Irrigation Pump Stations (2, 3, 4, 5, 6)',
        category: 'Giant Irrigation Pump Station',
        capacityM3Day: '10,000,000 m³/day',
        keyMilestoneAward: '5 Giant Pumping Stations from Rosetta Branch to Sheikh Zayed (9B EGP)',
        hydraulicHeadOrRecovery: 'High-Capacity Axial/Centrifugal Pumps + Water Hammer Arrestors',
        scadaAndPowerSpec: 'HV Substation & Telemetry Synced with Toshka (8.5M & 7M m³/day)',
        authorityApproval: 'MWRI & Armed Forces Engineering Authority – Water Dept',
        status: 'Commissioning Active'
    },
    {
        id: 'PLANT-ALAMEIN-SWRO',
        plantName: 'Al Alamein & New Mansoura SWRO Seawater Desalination Plants',
        category: 'SWRO Desalination',
        capacityM3Day: '300,000 + 160,000 m³/day',
        keyMilestoneAward: 'ENR Global Best Projects Winners (2020 & 2023) — D&B Contracts',
        hydraulicHeadOrRecovery: '45% RO Membrane Recovery • Isobaric Energy Recovery Devices (ERD)',
        scadaAndPowerSpec: '3.12 kWh/m³ Specific Energy • Automated CIP & Remineralization',
        authorityApproval: 'Armed Forces Eng. Authority / NUCA / Aqualia-FCC / Hassan Allam',
        status: 'Guinness / ENR Certified'
    },
    {
        id: 'PLANT-MAHSAMA-ABURAWASH',
        plantName: 'El Mahsama (1.0M m³/day) & Abu Rawash (1.6M→2.0M m³/day) WWTPs',
        category: 'Agricultural / Tertiary WWTP',
        capacityM3Day: '3,000,000 m³/day Combined',
        keyMilestoneAward: 'ENR 2020, Capital Finance UK 2020 & Dubai Innovation Award 2019',
        hydraulicHeadOrRecovery: 'PPP Infrastructure Flagship + Secondary/Tertiary Biological nutrient removal',
        scadaAndPowerSpec: 'Biogas Cogeneration & Automated Clarifier / Filtration Skids',
        authorityApproval: 'MWRI / CAPW / Orascom-Aqualia JV / Hassan Allam-Metito JV',
        status: 'Guinness / ENR Certified'
    },
    {
        id: 'PLANT-HCT-FUJAIRAH',
        plantName: 'Higher College of Technology (HCT) Fujairah — Hydrology & Flood Control',
        category: 'Hydrology & Flood Mitigation',
        capacityM3Day: '90,000 sq.m Campus Watershed',
        keyMilestoneAward: 'Direct Joint Partnership: Client MOID / DEC (400 Million AED)',
        hydraulicHeadOrRecovery: '100-Year Return Period Wadis Hydrology & Storm Attenuation Routing',
        scadaAndPowerSpec: 'Civil 3D / BIM Infrastructure Package for Main Building, Theater & Labs',
        authorityApproval: 'MOID / DEC (دار الخليج للاستشارات الهندسية) & Fujairah Municipality',
        status: 'IFC & BIM Approved'
    }
];

const SAMPLE_DRAWINGS: DrawingSheet[] = [
    { code: 'HCT-DEC-HYD-01', title: 'HCT Fujairah Campus (90,000 m²) — Hydrology & 100-Yr Flood Mitigation Master Layout (Client: MOID / DEC)', discipline: 'BIM / Infrastructure', rev: 'Rev 03', lod: 'LOD 400 (IFC)', status: 'IFC Approved', date: '2026-10-28', author: 'Prof. Dr. Sameh & Eng. Michael Magdy' },
    { code: 'SDY-ALD-BIM-02', title: 'The Groove Saadiyat Island (6.4M sq.ft) — Roads, Utilities & Hydraulic BIM Model + IFC Package (ALDAR)', discipline: 'BIM / Infrastructure', rev: 'Rev 04', lod: 'LOD 400 (IFC)', status: 'IFC Approved', date: '2026-10-26', author: 'Eng. Ahmed Abdel-Gawad (Marafek UAE)' },
    { code: 'SSMC-SEHA-03', title: 'Sheikh Shakhbout Medical City (780,000 m²) — 3-Phase Infrastructure BIM & IFT Tender Package', discipline: 'BIM / Infrastructure', rev: 'Rev 02', lod: 'LOD 400 (IFC)', status: 'IFC Approved', date: '2026-10-24', author: 'Eng. Ahmed Abdel-Gawad & BIM Team' },
    { code: 'KFSH-RIY-360', title: 'King Faisal Specialist Hospital Riyadh (1,589 Beds / >1M m² BUA) — 3D BIM 360 Model & BOQ Specs', discipline: 'Architecture', rev: 'Rev 03', lod: 'LOD 350', status: 'IFC Approved', date: '2026-10-22', author: 'Eng. Ahmed Seera & KSA Team' },
    { code: 'TSK-HDPE-145', title: 'Toshka Reclamation (395,000 Acres) — 145 Pump Stations & 1,600km HDPE Workshop & As-Built Package', discipline: 'MEP', rev: 'Rev 05', lod: 'LOD 400 (IFC)', status: 'As-Built Verified', date: '2026-10-29', author: 'Eng. Adel Abdel-Latif & Eng. Medhat Mabrouk' },
    { code: 'NDL-MPS-06', title: 'New Delta "Mostakbal Misr" (10M m³/day) — Main Pump Stations 2,3,4,5,6 Hydraulic & Structural Shop Drawings', discipline: 'Structural', rev: 'Rev 04', lod: 'LOD 400 (IFC)', status: 'IFC Approved', date: '2026-10-27', author: 'Eng. Ahmed Seera & Structural Dept' },
    { code: 'ALM-SWRO-300', title: 'Al Alamein SWRO Desalination Plant (300,000 m³/day) & 12,330 Feddan Smart City SCADA Valves', discipline: 'MEP', rev: 'Rev 03', lod: 'LOD 400 (IFC)', status: 'As-Built Verified', date: '2026-10-25', author: 'Eng. Ahmed Abdel-Gawad & Eng. Medhat Mabrouk' },
    { code: 'RYD-AVE-11B', title: 'Riyadh Avenues Mall (11B SAR) & Jeddah Airport City (GACA 12B) — Internal Roads & Hydraulic Models', discipline: 'BIM / Infrastructure', rev: 'Rev 02', lod: 'LOD 350', status: 'Under Authority Review', date: '2026-10-30', author: 'MC KSA Infrastructure Team' },
];

const SAMPLE_FFE: FfeItem[] = [
    { id: 'EQ-SWRO-01', space: 'Al Alamein & New Mansoura SWRO Plants', category: 'Smart Control Valves', itemDescription: 'Duplex Super-Austenitic High-Pressure RO Membrane Skids & Isobaric Energy Recovery', brand: 'Toray / Danfoss ERD', supplier: 'Aqualia-FCC & Hassan Allam JV', unitPrice: 1450000, sampleBoardSigned: true, status: 'Site Delivered', leadTimeWeeks: 12 },
    { id: 'EQ-PUMP-02', space: 'New Delta (10M m³/d) & Toshka (15.5M m³/d)', category: 'Pump Station HV Switchgear', itemDescription: 'Medium Voltage 11kV Soft-Starter Switchgear, SCADA PLC & Water Hammer Surge Vessels', brand: 'ABB / Schneider / KSB', supplier: 'Elsewedy Electric & Orascom', unitPrice: 2800000, sampleBoardSigned: true, status: 'Procurement Issued', leadTimeWeeks: 14 },
    { id: 'EQ-MED-03', space: 'King Faisal Hospital (1,589 Beds) & SSMC Abu Dhabi', category: 'Medical / Hospital MEP', itemDescription: 'Hospital Medical Gas Manifolds, Hygienic AHU Chillers & Seismic BIM Hangers', brand: 'Dräger / Carrier', supplier: 'SEHA & Specialist Group KSA', unitPrice: 920000, sampleBoardSigned: true, status: 'Client Signed', leadTimeWeeks: 10 },
    { id: 'EQ-URB-04', space: 'Walkway of Ahl Masr & Maspero Triangle Towers', category: 'Waterfront & Lagoon Fit-Out', itemDescription: 'Nile Promenade Architectural Lighting, Fountain Hydraulics & Fire-Rated Cladding', brand: 'iGuzzini / Grundfos', supplier: 'NUCA Approved Vendors', unitPrice: 410000, sampleBoardSigned: true, status: 'Site Delivered', leadTimeWeeks: 6 },
    { id: 'EQ-RES-05', space: 'Saadiyat Island St. Regis Villas & Japanese Park UAE', category: 'Architectural Finishes', itemDescription: 'Marine-Grade Chilled Water Sub-Stations, Olympic Pool Filtration (ADSP) & Stone Paving', brand: 'Pentair / ALDAR Spec', supplier: 'Abu Dhabi Approved Vendors', unitPrice: 540000, sampleBoardSigned: false, status: 'Sample Under Review', leadTimeWeeks: 8 },
];

const SAMPLE_POURS: ConcretePourRecord[] = [
    { id: 'CPR-BAHR-01', pourDate: '2026-10-28', element: 'Bahr Al-Baqar WWTP — Ozone Contact Tank & Clarifier Raft (Watertight C40)', volumeM3: 1450, batchPlant: 'Orascom Sinai Batch Plant #1', slumpMm: 135, strengthTargetMpa: 40, sevenDayMpa: 33.4, twentyEightDayMpa: 45.8, status: 'Passed (Watertight C40)' },
    { id: 'CPR-NDELTA-02', pourDate: '2026-10-29', element: 'New Delta Main Pump Station #4 — Suction Sump & Thrust Block Anchor', volumeM3: 880, batchPlant: 'Concord / Elsewedy Site Batch', slumpMm: 130, strengthTargetMpa: 45, sevenDayMpa: 36.2, twentyEightDayMpa: 48.1, status: 'Passed (Watertight C40)' },
    { id: 'CPR-HCT-DEC-03', pourDate: '2026-10-30', element: 'HCT Fujairah (MOID / DEC) — Flood Mitigation Box Culvert & Theater Foundation', volumeM3: 520, batchPlant: 'Fujairah Readymix #2', slumpMm: 125, strengthTargetMpa: 40, sevenDayMpa: 34.0, twentyEightDayMpa: 0, status: 'Pending 28D Test' },
    { id: 'CPR-COAST-04', pourDate: '2026-10-31', element: 'International Coastal Road (80km Alex–Alamein) — Post-Tensioned Bridge Pier Cap', volumeM3: 640, batchPlant: 'Arab Contractors Batching', slumpMm: 140, strengthTargetMpa: 50, sevenDayMpa: 39.5, twentyEightDayMpa: 0, status: 'Pending 28D Test' },
];

const AUTHORITY_PARTNERS = [
    { code: 'MOID / DEC', name: 'Ministry of Infrastructure & DEC (UAE Joint Partner — Page 11 & 46)', count: '38+ UAE Projects' },
    { code: 'AFEA / MOD', name: 'Armed Forces Engineering Authority (Water & Military Works Depts)', count: 'Toshka, New Delta, Bahr Al-Baqar' },
    { code: 'NUCA / CAPW / NOPWASD', name: 'New Urban Communities & Potable Water/Wastewater Authorities', count: '1,400+ Egypt Projects' },
    { code: 'NWC / GACA / SEHA', name: 'National Water Co. KSA, Civil Aviation & Abu Dhabi Health', count: '50+ KSA & 38+ UAE Projects' },
    { code: 'WORLD BANK / KfW / EBRD', name: 'International Donor Funded (ISSIP-1, USAID, GIZ, UNDP, Arab Fund)', count: 'ISO 9001 & ISO 14001 Certified' },
    { code: 'EEAA (200+ ESIA)', name: 'Egyptian Environmental Affairs Agency — Environmental Impact Studies', count: 'House of Expertise #35' },
];

export const MultiDisciplineHub: React.FC = () => {
    const [disciplineTab, setDisciplineTab] = useState<'water_infra' | 'architecture' | 'civil' | 'interiors'>('water_infra');
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

    const filteredPipelines = MC_PIPELINES.filter(p =>
        p.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.pipeSpec.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientAndOwner.toLowerCase().includes(searchQuery.toLowerCase())
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
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                            House of Expertise #35 • 527 Staff
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                        Unified command for Water/SWRO Desalination, 8,000km Transmission Lines, BIM 360 (IFC LOD 400), Structural QA & Electromechanical SCADA.
                    </p>
                </div>

                {/* Discipline Selector Tabs */}
                <div className="flex items-center gap-1.5 p-1.5 bg-[#141414] border border-white/5 rounded-2xl self-start overflow-x-auto max-w-full">
                    <button
                        onClick={() => setDisciplineTab('water_infra')}
                        className={clsx(
                            'px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap',
                            disciplineTab === 'water_infra'
                                ? 'bg-orange-500 text-white shadow-orange-glow'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <Droplets className="w-3.5 h-3.5" /> Water, SWRO & 8,000km Pipelines
                    </button>
                    <button
                        onClick={() => setDisciplineTab('architecture')}
                        className={clsx(
                            'px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap',
                            disciplineTab === 'architecture'
                                ? 'bg-orange-500 text-white shadow-orange-glow'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <Compass className="w-3.5 h-3.5" /> BIM 360, Arch & MDL (IFC)
                    </button>
                    <button
                        onClick={() => setDisciplineTab('civil')}
                        className={clsx(
                            'px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap',
                            disciplineTab === 'civil'
                                ? 'bg-orange-500 text-white shadow-orange-glow'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <HardHat className="w-3.5 h-3.5" /> Civil, Tanks & Concrete QA
                    </button>
                    <button
                        onClick={() => setDisciplineTab('interiors')}
                        className={clsx(
                            'px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap',
                            disciplineTab === 'interiors'
                                ? 'bg-orange-500 text-white shadow-orange-glow'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <Palette className="w-3.5 h-3.5" /> Electromechanical & Fit-Out Specs
                    </button>
                </div>
            </div>

            {/* Search & Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Toshka, Bahr Al-Baqar, HCT Fujairah (DEC), Alamein SWRO, Waad El Shamal..."
                        className="w-full bg-[#141414] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 font-mono"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => toast.success('AI Copilot pre-auditing hydraulic transient & BIM LOD 400 package...')}
                        className="px-3.5 py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                    >
                        <Sparkles className="w-3.5 h-3.5" /> AI Hydraulic & BIM Audit
                    </button>
                    <button
                        onClick={() => toast.success('Exporting ISO 9001:2015 / ISO 14001:2015 Register to Excel...')}
                        className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                    >
                        <Download className="w-3.5 h-3.5" /> Export ISO Register
                    </button>
                </div>
            </div>

            {/* TAB 0: WATER, SWRO, PIPELINES & ELECTROMECHANICAL (MC CORE) */}
            {disciplineTab === 'water_infra' && (
                <div className="space-y-6">
                    {/* 40-Year Track Record Banner from Brochure Page 6 */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="glass-card p-3.5 rounded-2xl bg-[#141414] border border-orange-500/20">
                            <p className="text-[10px] font-mono text-slate-400 uppercase">Transmission Lines</p>
                            <p className="text-lg font-black text-orange-400 font-mono mt-0.5">8,000 KM</p>
                            <p className="text-[10px] font-mono text-slate-500 mt-0.5">Force Main & Gravity</p>
                        </div>
                        <div className="glass-card p-3.5 rounded-2xl bg-[#141414] border border-sky-500/20">
                            <p className="text-[10px] font-mono text-slate-400 uppercase">Irrigation & Reclam.</p>
                            <p className="text-lg font-black text-sky-400 font-mono mt-0.5">26.0M m³/d</p>
                            <p className="text-[10px] font-mono text-slate-500 mt-0.5">1M Feddan Reclaimed</p>
                        </div>
                        <div className="glass-card p-3.5 rounded-2xl bg-[#141414] border border-emerald-500/20">
                            <p className="text-[10px] font-mono text-slate-400 uppercase">Treated Wastewater</p>
                            <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">7.0M m³/d</p>
                            <p className="text-[10px] font-mono text-slate-500 mt-0.5">3x Guinness Records</p>
                        </div>
                        <div className="glass-card p-3.5 rounded-2xl bg-[#141414] border border-cyan-500/20">
                            <p className="text-[10px] font-mono text-slate-400 uppercase">Potable Water WTP</p>
                            <p className="text-lg font-black text-cyan-400 font-mono mt-0.5">5.0M m³/d</p>
                            <p className="text-[10px] font-mono text-slate-500 mt-0.5">NOPWASD / CAPW / NUCA</p>
                        </div>
                        <div className="glass-card p-3.5 rounded-2xl bg-[#141414] border border-purple-500/20">
                            <p className="text-[10px] font-mono text-slate-400 uppercase">SWRO Desalination</p>
                            <p className="text-lg font-black text-purple-400 font-mono mt-0.5">750k m³/d</p>
                            <p className="text-[10px] font-mono text-slate-500 mt-0.5">ENR Global Best Winners</p>
                        </div>
                        <div className="glass-card p-3.5 rounded-2xl bg-[#141414] border border-amber-500/20">
                            <p className="text-[10px] font-mono text-slate-400 uppercase">Site Supervision</p>
                            <p className="text-lg font-black text-amber-400 font-mono mt-0.5">316 / 527</p>
                            <p className="text-[10px] font-mono text-slate-500 mt-0.5">13 Countries • $5.3B</p>
                        </div>
                    </div>

                    {/* Section A: Linear Pipeline Chainage, HDD & Hydro-Testing Matrix */}
                    <div className="glass-card rounded-2xl md:rounded-[32px] border border-white/5 bg-[#141414]/90 overflow-hidden shadow-2xl">
                        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h3 className="text-sm font-black text-white font-mono uppercase tracking-wider flex items-center gap-2">
                                    <Gauge className="w-4 h-4 text-orange-400" /> Linear Pipeline Chainage, Water Hammer Surge & Hydro-Test Matrix
                                </h3>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">
                                    Live supervision of Steel, RC, and HDPE transmission mains (Ø200mm–Ø3400mm), HDD trenchless crossings & booster stations.
                                </p>
                            </div>
                            <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold">
                                6 Mega Corridors Active
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-[10px] font-mono text-slate-500 uppercase bg-black/40">
                                        <th className="py-3.5 px-4">Project & Corridor</th>
                                        <th className="py-3.5 px-4">Pipe Spec & Diameter</th>
                                        <th className="py-3.5 px-4">Chainage Progress</th>
                                        <th className="py-3.5 px-4">Working / Test Bar</th>
                                        <th className="py-3.5 px-4">Transient / Surge & Crossing</th>
                                        <th className="py-3.5 px-4">QA Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-xs font-mono">
                                    {filteredPipelines.map((pipe) => {
                                        const pct = Math.round((pipe.completedKm / pipe.totalLengthKm) * 100);
                                        return (
                                            <tr key={pipe.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3.5 px-4">
                                                    <div className="text-white font-bold font-sans">{pipe.project}</div>
                                                    <div className="text-[10px] text-slate-500 mt-0.5">{pipe.clientAndOwner}</div>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-300">{pipe.pipeSpec}</td>
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center justify-between text-[11px] mb-1">
                                                        <span className="text-orange-400 font-bold">{pipe.completedKm} / {pipe.totalLengthKm} KM</span>
                                                        <span className="text-slate-400">{pct}%</span>
                                                    </div>
                                                    <div className="w-36 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="text-slate-300">{pipe.operatingPressureBar} Bar</span>
                                                    <span className="text-slate-500"> / </span>
                                                    <span className="text-emerald-400 font-bold">{pipe.testPressureBar} Bar Test</span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="text-slate-200 text-[11px]">{pipe.waterHammerStatus}</div>
                                                    <div className="text-[10px] text-sky-400 mt-0.5">{pipe.crossingType}</div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> {pipe.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section B: SWRO Desalination, WWTP & Giant Pump Station Hydraulic Telemetry */}
                    <div className="glass-card rounded-2xl md:rounded-[32px] border border-white/5 bg-[#141414]/90 overflow-hidden shadow-2xl">
                        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h3 className="text-sm font-black text-white font-mono uppercase tracking-wider flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-sky-400" /> Treatment Plants, SWRO Desalination & Hydrology Telemetry
                                </h3>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">
                                    Process design verification, RO membrane recovery, ozone/sludge drying & flood mitigation models.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5">
                            {MC_PLANTS.map((plant) => (
                                <div key={plant.id} className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-orange-500/30 transition-all space-y-2.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold">
                                                {plant.category}
                                            </span>
                                            <h4 className="text-sm font-black text-white mt-1.5">{plant.plantName}</h4>
                                        </div>
                                        <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 shrink-0">
                                            {plant.capacityM3Day}
                                        </span>
                                    </div>
                                    <p className="text-xs text-amber-400 font-mono font-semibold">{plant.keyMilestoneAward}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono pt-1 border-t border-white/5">
                                        <div>
                                            <span className="text-slate-500 block">Hydraulic / Process Spec:</span>
                                            <span className="text-slate-200">{plant.hydraulicHeadOrRecovery}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block">Authority / Client:</span>
                                            <span className="text-sky-400 font-semibold">{plant.authorityApproval}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section C: Authority & International Donor Compliance Gate */}
                    <div className="glass-card rounded-2xl p-5 border border-white/5 bg-[#141414]/90">
                        <h3 className="text-xs font-black text-white font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Certified Authorities, International Donors & Strategic Alliances (Brochure Pages 4, 8, 11 & 49)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {AUTHORITY_PARTNERS.map((auth) => (
                                <div key={auth.code} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2">
                                    <div>
                                        <div className="text-xs font-mono font-black text-orange-400">{auth.code}</div>
                                        <div className="text-[11px] text-slate-300 mt-0.5">{auth.name}</div>
                                    </div>
                                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 shrink-0">
                                        {auth.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 1: ARCHITECTURE, BIM 360 & MASTER DRAWING LIST (MDL) */}
            {disciplineTab === 'architecture' && (
                <div className="glass-card rounded-2xl md:rounded-[32px] border border-white/5 bg-[#141414]/90 overflow-hidden shadow-2xl">
                    <div className="p-5 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-white font-mono uppercase tracking-wider">
                                Master Drawing List (MDL), BIM 360 & IFC Packages (Egypt, KSA & UAE)
                            </h3>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                                Live deliverable register for HCT Fujairah (MOID / DEC), Saadiyat Grove (ALDAR), SSMC Abu Dhabi, King Faisal Hospital & New Alamein.
                            </p>
                        </div>
                        <button
                            onClick={() => toast.success('New Drawing Sheet Revision modal opened')}
                            className="px-3 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-orange-glow"
                        >
                            <Plus className="w-3.5 h-3.5" /> Issue Revision
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-[10px] font-mono text-slate-500 uppercase bg-black/40">
                                    <th className="py-3.5 px-4">Sheet Code</th>
                                    <th className="py-3.5 px-4">Drawing / BIM Model Title</th>
                                    <th className="py-3.5 px-4">Discipline</th>
                                    <th className="py-3.5 px-4">Revision</th>
                                    <th className="py-3.5 px-4">BIM LOD</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4">Lead Engineer</th>
                                    <th className="py-3.5 px-4">Issued Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-xs font-mono">
                                {filteredDrawings.map(sheet => (
                                    <tr key={sheet.code} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3.5 px-4 font-bold text-orange-400">{sheet.code}</td>
                                        <td className="py-3.5 px-4 text-white font-sans font-medium">{sheet.title}</td>
                                        <td className="py-3.5 px-4 text-slate-300">{sheet.discipline}</td>
                                        <td className="py-3.5 px-4">
                                            <span className="px-2 py-0.5 rounded bg-white/5 text-slate-200 border border-white/10">
                                                {sheet.rev}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-sky-400">{sheet.lod}</td>
                                        <td className="py-3.5 px-4">
                                            <span
                                                className={clsx(
                                                    'px-2.5 py-0.5 rounded-full text-[10px] font-bold border',
                                                    sheet.status === 'IFC Approved' || sheet.status === 'As-Built Verified'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                )}
                                            >
                                                {sheet.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-400">{sheet.author}</td>
                                        <td className="py-3.5 px-4 text-slate-500">{sheet.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: ELECTROMECHANICAL, HEALTHCARE & FIT-OUT SPECS */}
            {disciplineTab === 'interiors' && (
                <div className="glass-card rounded-2xl md:rounded-[32px] border border-white/5 bg-[#141414]/90 overflow-hidden shadow-2xl">
                    <div className="p-5 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-white font-mono uppercase tracking-wider">
                                Electromechanical Equipment, SWRO Skids, Healthcare MEP & Fit-Out Matrix
                            </h3>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                                Tracks long-lead HV switchgear, RO membranes, 8,000-bed hospital medical gas systems, and waterfront promenade specs.
                            </p>
                        </div>
                        <button
                            onClick={() => toast.success('New Material / Equipment Submittal modal opened')}
                            className="px-3 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-orange-glow"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Equipment / Material
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-[10px] font-mono text-slate-500 uppercase bg-black/40">
                                    <th className="py-3.5 px-4">Spec ID</th>
                                    <th className="py-3.5 px-4">Project / Zone</th>
                                    <th className="py-3.5 px-4">Category</th>
                                    <th className="py-3.5 px-4">Specification & Description</th>
                                    <th className="py-3.5 px-4">Manufacturer & Contractor</th>
                                    <th className="py-3.5 px-4">Package Value</th>
                                    <th className="py-3.5 px-4">Submittal Sign-Off</th>
                                    <th className="py-3.5 px-4">Procurement Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-xs font-mono">
                                {filteredFfe.map(item => (
                                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3.5 px-4 font-bold text-orange-400">{item.id}</td>
                                        <td className="py-3.5 px-4 text-white font-bold">{item.space}</td>
                                        <td className="py-3.5 px-4 text-slate-400">{item.category}</td>
                                        <td className="py-3.5 px-4 text-slate-200 font-sans">{item.itemDescription}</td>
                                        <td className="py-3.5 px-4">
                                            <div className="text-white">{item.brand}</div>
                                            <div className="text-[10px] text-slate-500">{item.supplier}</div>
                                        </td>
                                        <td className="py-3.5 px-4 text-emerald-400 font-bold">
                                            ${item.unitPrice.toLocaleString()}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {item.sampleBoardSigned ? (
                                                <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Code A Signed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-amber-400 text-[11px]">
                                                    <AlertCircle className="w-3.5 h-3.5" /> Under Review
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10">
                                                {item.status} ({item.leadTimeWeeks}w)
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: CIVIL, WATER TANKS, THRUST BLOCKS & CONCRETE POUR QA */}
            {disciplineTab === 'civil' && (
                <div className="glass-card rounded-2xl md:rounded-[32px] border border-white/5 bg-[#141414]/90 overflow-hidden shadow-2xl">
                    <div className="p-5 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-white font-mono uppercase tracking-wider">
                                Watertight Concrete Tanks (80,000 m³), Clarifier Rafts, Thrust Blocks & Highway Bridges (f_cu (MPa))
                            </h3>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                                Tracks slump test, 7-day & 28-day cylinder crushing strength (f_cu (MPa)), and water-retention permeability across MC sites.
                            </p>
                        </div>
                        <button
                            onClick={() => toast.success('Concrete Pour Card & Cube Test Logger opened')}
                            className="px-3 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-orange-glow"
                        >
                            <Plus className="w-3.5 h-3.5" /> Log Concrete Pour
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-[10px] font-mono text-slate-500 uppercase bg-black/40">
                                    <th className="py-3.5 px-4">Pour ID</th>
                                    <th className="py-3.5 px-4">Date</th>
                                    <th className="py-3.5 px-4">Structural Element & Project</th>
                                    <th className="py-3.5 px-4">Volume</th>
                                    <th className="py-3.5 px-4">Slump</th>
                                    <th className="py-3.5 px-4">Target f_cu (MPa)</th>
                                    <th className="py-3.5 px-4">7-Day Result</th>
                                    <th className="py-3.5 px-4">28-Day Result</th>
                                    <th className="py-3.5 px-4">QA Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-xs font-mono">
                                {SAMPLE_POURS.map(pour => (
                                    <tr key={pour.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3.5 px-4 font-bold text-orange-400">{pour.id}</td>
                                        <td className="py-3.5 px-4 text-slate-400">{pour.pourDate}</td>
                                        <td className="py-3.5 px-4">
                                            <div className="text-white font-sans font-medium">{pour.element}</div>
                                            <div className="text-[10px] text-slate-500">{pour.batchPlant}</div>
                                        </td>
                                        <td className="py-3.5 px-4 text-white font-bold">{pour.volumeM3} m³</td>
                                        <td className="py-3.5 px-4 text-slate-300">{pour.slumpMm} mm</td>
                                        <td className="py-3.5 px-4 text-sky-400 font-bold">{pour.strengthTargetMpa} MPa</td>
                                        <td className="py-3.5 px-4 text-emerald-400 font-bold">{pour.sevenDayMpa} MPa</td>
                                        <td className="py-3.5 px-4">
                                            {pour.twentyEightDayMpa > 0 ? (
                                                <span className="text-emerald-400 font-bold">{pour.twentyEightDayMpa} MPa</span>
                                            ) : (
                                                <span className="text-slate-500">Awaiting 28D Cure</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span
                                                className={clsx(
                                                    'px-2.5 py-0.5 rounded-full text-[10px] font-bold border',
                                                    pour.status.includes('Passed')
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
            )}
        </div>
    );
};
