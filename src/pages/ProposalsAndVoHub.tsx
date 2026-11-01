import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useTenant } from '../context/TenantContext';
import { supabase } from '../lib/supabase';
import { buildAutoVariationOrder } from '../utils/aecScopeGate';
import type { BidProposal, RibaStageFeeRow, VariationOrder } from '../types';
import {
    FileSignature,
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    Plus,
    PenTool,
    Lock,
    Unlock,
    ArrowRight,
    FileCheck,
    Sparkles,
    Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const DEFAULT_RIBA_STAGES: RibaStageFeeRow[] = [
    { stageCode: 'RIBA-1', stageName: 'Stage 1: Preparation & Brief', feePercentage: 10, feeAmount: 45000, estimatedHours: 180, includedRevisionRounds: 2 },
    { stageCode: 'RIBA-2', stageName: 'Stage 2: Concept Design', feePercentage: 20, feeAmount: 90000, estimatedHours: 360, includedRevisionRounds: 2 },
    { stageCode: 'RIBA-3', stageName: 'Stage 3: Spatial Coordination', feePercentage: 25, feeAmount: 112500, estimatedHours: 450, includedRevisionRounds: 2 },
    { stageCode: 'RIBA-4', stageName: 'Stage 4: Technical Design (IFC)', feePercentage: 30, feeAmount: 135000, estimatedHours: 540, includedRevisionRounds: 1 },
    { stageCode: 'RIBA-5', stageName: 'Stage 5: Construction Supervision', feePercentage: 15, feeAmount: 67500, estimatedHours: 270, includedRevisionRounds: 1 },
];

const INITIAL_PROPOSALS: BidProposal[] = [
    {
        id: 'prop-seed-1',
        proposalNumber: 'PROP-2026-001',
        clientName: 'Aldar Development PJSC',
        clientEmail: 'contracts@aldar-demo.ae',
        projectTitle: 'Saadiyat Waterfront Cultural Pavilion & Marina',
        branchLocation: 'New Cairo - 5th Settlement',
        currency: 'EGP',
        totalFee: 450000,
        retainerPercentage: 20,
        stages: DEFAULT_RIBA_STAGES,
        status: 'signed',
        proposalSigned: true,
        authorityNocUploaded: true,
        retainerPaid: true,
        siteSurveyUploaded: true,
        signedByName: 'Eng. Tariq Al-Mansoori (VP Development)',
        signedAt: '2026-03-01T11:30:00Z',
        createdAt: '2026-02-24T09:00:00Z',
    },
    {
        id: 'prop-seed-2',
        proposalNumber: 'PROP-2026-002',
        clientName: 'SODIC Misr Developments',
        clientEmail: 'tenders@sodic-demo.eg',
        projectTitle: 'New Zayed Executive Twin Towers (G+28)',
        branchLocation: 'El Nozha El Gedida HQ',
        currency: 'EGP',
        totalFee: 1200000,
        retainerPercentage: 15,
        stages: DEFAULT_RIBA_STAGES.map(s => ({
            ...s,
            feeAmount: Math.round((1200000 * s.feePercentage) / 100),
        })),
        status: 'sent',
        proposalSigned: true,
        authorityNocUploaded: false,
        retainerPaid: true,
        siteSurveyUploaded: false,
        createdAt: '2026-03-05T14:00:00Z',
    },
];

export const ProposalsAndVoHub: React.FC = () => {
    const {
        projects,
        milestones,
        addProject,
        addMilestone,
        updateMilestone,
    } = useData();
    const { activeOrg } = useTenant();
    const navigate = useNavigate();

    const [activeSection, setActiveSection] = useState<'proposals' | 'vo_gate'>('proposals');
    const [proposals, setProposals] = useState<BidProposal[]>(() => {
        try {
            const raw = localStorage.getItem('mitrixo_aec_proposals_v1');
            return raw ? JSON.parse(raw) : INITIAL_PROPOSALS;
        } catch {
            return INITIAL_PROPOSALS;
        }
    });
    const [variationOrders, setVariationOrders] = useState<VariationOrder[]>([]);

    useEffect(() => {
        const loadVos = async () => {
            const { data } = await supabase.from('variation_orders').select('*');
            if (data) {
                setVariationOrders(
                    data.map((r: any) => ({
                        id: r.id,
                        organizationId: r.organization_id || activeOrg.id,
                        projectId: r.project_id,
                        code: r.code || 'VO-001',
                        title: r.title || '',
                        description: r.description || '',
                        reasonCategory: r.reason_category || 'client_request',
                        status: r.status || 'submitted',
                        contractorAmount: Number(r.contractor_amount || 0),
                        engineerAssessedAmount: Number(r.engineer_assessed_amount || 0),
                        approvedAmount: Number(r.approved_amount || 0),
                        scheduleImpactDays: Number(r.schedule_impact_days || 0),
                        approvedTimeDays: Number(r.approved_time_days || 0),
                        ballInCourt: r.ball_in_court || 'Client Representative',
                        currentApprovalStep: r.current_approval_step || 2,
                        linkedRfiId: r.linked_rfi_id,
                        createdAt: r.created_at,
                    }))
                );
            }
        };
        void loadVos();
    }, [activeOrg.id]);

    const saveProposals = (next: BidProposal[]) => {
        setProposals(next);
        try {
            localStorage.setItem('mitrixo_aec_proposals_v1', JSON.stringify(next));
        } catch {
            // ignore quota
        }
    };

    // New Proposal Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [projectTitle, setProjectTitle] = useState('');
    const [branchLocation, setBranchLocation] = useState<string>(activeOrg.branches[0] || 'El Nozha El Gedida HQ');
    const [currency, setCurrency] = useState<string>(activeOrg.currency || 'EGP');
    const [totalFee, setTotalFee] = useState<number>(600000);
    const [retainerPercentage] = useState<number>(20);

    // Signature Modal State
    const [signingProposal, setSigningProposal] = useState<BidProposal | null>(null);
    const [signerName, setSignerName] = useState('');
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawnSignature, setHasDrawnSignature] = useState(false);

    // Auto-VO Simulator State
    const [selectedVoProjectId, setSelectedVoProjectId] = useState<string>(projects[0]?.id || '');
    const [voTitle, setVoTitle] = useState('');
    const [voHours, setVoHours] = useState<number>(32);
    const [voScheduleDays, setVoScheduleDays] = useState<number>(5);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        ctx.strokeStyle = activeOrg.primaryColor || '#e04b2a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        setIsDrawing(true);
        setHasDrawnSignature(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => setIsDrawing(false);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawnSignature(false);
    };

    const handleCreateProposal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientName.trim() || !projectTitle.trim()) return;

        const nextNum = proposals.length + 1;
        const newProposal: BidProposal = {
            id: crypto.randomUUID(),
            proposalNumber: `PROP-2026-${String(nextNum).padStart(3, '0')}`,
            clientName: clientName.trim(),
            clientEmail: clientEmail.trim() || 'client@partner.com',
            projectTitle: projectTitle.trim(),
            branchLocation,
            currency,
            totalFee: Number(totalFee) || 500000,
            retainerPercentage: Number(retainerPercentage) || 20,
            stages: DEFAULT_RIBA_STAGES.map(s => ({
                ...s,
                feeAmount: Math.round(((Number(totalFee) || 500000) * s.feePercentage) / 100),
            })),
            status: 'sent',
            proposalSigned: false,
            authorityNocUploaded: false,
            retainerPaid: false,
            siteSurveyUploaded: false,
            createdAt: new Date().toISOString(),
        };

        saveProposals([newProposal, ...proposals]);
        setIsCreateOpen(false);
        setClientName('');
        setClientEmail('');
        setProjectTitle('');
        toast.success(`RIBA Proposal ${newProposal.proposalNumber} generated!`);
    };

    const togglePreContractDoc = (proposal: BidProposal, field: 'proposalSigned' | 'authorityNocUploaded' | 'retainerPaid' | 'siteSurveyUploaded') => {
        const updated: BidProposal = {
            ...proposal,
            [field]: !proposal[field],
        };
        saveProposals(proposals.map(p => (p.id === proposal.id ? updated : p)));
    };

    const handleCompleteSignature = () => {
        if (!signingProposal || !signerName.trim()) {
            toast.error('Please enter the authorized signatory name');
            return;
        }
        const sigData = canvasRef.current?.toDataURL('image/png') || 'digital-sig-verified';
        const updated: BidProposal = {
            ...signingProposal,
            status: 'signed',
            proposalSigned: true,
            signedByName: signerName.trim(),
            signedAt: new Date().toISOString(),
            signatureDataUrl: sigData,
        };
        saveProposals(proposals.map(p => (p.id === signingProposal.id ? updated : p)));
        setSigningProposal(null);
        setSignerName('');
        setHasDrawnSignature(false);
        toast.success('Digital Client Signature & Stamp recorded!');
    };

    const handleConvertToProject = async (proposal: BidProposal) => {
        const all4DocsReady =
            proposal.proposalSigned &&
            proposal.authorityNocUploaded &&
            proposal.retainerPaid &&
            proposal.siteSurveyUploaded;

        if (!all4DocsReady) {
            toast.error('4-Document Pre-Contract Gate Blocked: All 4 mandatory documents must be verified before activating project.');
            return;
        }

        const newProjectId = crypto.randomUUID();
        const hourlyRate = 150;

        await addProject({
            id: newProjectId,
            name: proposal.projectTitle,
            hourlyRate,
            budget: proposal.totalFee,
            phase: 'Concept Design',
            startDate: new Date().toISOString().split('T')[0],
            clientName: proposal.clientName,
            branchLocation: proposal.branchLocation,
            currency: proposal.currency,
            proposalSigned: true,
            authorityNocUploaded: true,
            retainerPaid: true,
            siteSurveyUploaded: true,
            allowedRevisionRounds: 2,
        });

        for (let idx = 0; idx < proposal.stages.length; idx++) {
            const stage = proposal.stages[idx];
            await addMilestone({
                id: crypto.randomUUID(),
                projectId: newProjectId,
                name: stage.stageName,
                ribaStageCode: stage.stageCode,
                completedPercentage: idx === 0 ? 15 : 0,
                clientStatus: 'pending',
                revisionCount: 0,
                maxRevisions: stage.includedRevisionRounds,
                feePercentage: stage.feePercentage,
                ipcPaid: idx === 0,
                createdAt: new Date(Date.now() + idx * 1000).toISOString(),
            });
        }

        const updated: BidProposal = {
            ...proposal,
            status: 'converted',
            projectId: newProjectId,
        };
        saveProposals(proposals.map(p => (p.id === proposal.id ? updated : p)));
        toast.success(`Project "${proposal.projectTitle}" activated with 5 RIBA Stages!`);
        navigate(`/projects/${newProjectId}`);
    };

    const handleRaiseVariationOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        const targetProject = projects.find(p => p.id === selectedVoProjectId) || projects[0];
        if (!targetProject) {
            toast.error('Select a valid project first');
            return;
        }
        const projectStages = milestones.filter(m => m.projectId === targetProject.id);
        const activeStage = projectStages.find(m => m.clientStatus !== 'approved') || projectStages[0];

        const autoVo = buildAutoVariationOrder({
            project: targetProject,
            milestone: activeStage,
            existingVoCount: variationOrders.length,
            estimatedHours: Number(voHours) || 24,
            scheduleImpactDays: Number(voScheduleDays) || 4,
            reasonTitle: voTitle.trim() || undefined,
        });

        await supabase.from('variation_orders').insert({
            id: autoVo.id,
            organization_id: activeOrg.id,
            project_id: autoVo.projectId,
            code: autoVo.code,
            title: autoVo.title,
            description: autoVo.description,
            reason_category: autoVo.reasonCategory,
            status: autoVo.status,
            contractor_amount: autoVo.contractorAmount,
            engineer_assessed_amount: autoVo.engineerAssessedAmount,
            approved_amount: autoVo.approvedAmount,
            schedule_impact_days: autoVo.scheduleImpactDays,
            approved_time_days: autoVo.approvedTimeDays,
            ball_in_court: autoVo.ballInCourt,
            current_approval_step: autoVo.currentApprovalStep,
            created_at: autoVo.createdAt,
        });

        setVariationOrders(prev => [autoVo, ...prev]);

        if (activeStage) {
            await updateMilestone({
                ...activeStage,
                clientStatus: 'revision',
                revisionCount: (activeStage.revisionCount ?? 2) + 1,
                isFrozenByVo: true,
            });
        }

        setVoTitle('');
        toast.success(`Variation Order ${autoVo.code} issued & stage frozen until client sign-off!`);
    };

    const handleApproveVo = async (vo: VariationOrder) => {
        await supabase.from('variation_orders').update({ status: 'approved', current_approval_step: 3 }).eq('id', vo.id);
        setVariationOrders(prev => prev.map(item => (item.id === vo.id ? { ...item, status: 'approved', currentApprovalStep: 3 } : item)));

        const relatedMilestones = milestones.filter(m => m.projectId === vo.projectId);
        for (const m of relatedMilestones) {
            if (m.isFrozenByVo) {
                await updateMilestone({
                    ...m,
                    isFrozenByVo: false,
                    maxRevisions: (m.maxRevisions ?? 2) + 1,
                });
            }
        }
        toast.success(`${vo.code} commercially approved — Stage freeze lifted!`);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e04b2a]/10 border border-[#e04b2a]/25 text-[#e04b2a] text-[10px] font-black uppercase tracking-widest mb-3">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        5-Gate Commercial & Scope Governance
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-black text-[#192631] tracking-tight">
                        RIBA Proposals & <span className="text-[#e04b2a]">5-Gate VO Shield</span>
                    </h2>
                    <p className="text-[#192631]/65 text-sm font-medium mt-1">
                        Enforce the 4-Document Pre-Contract Gate, digital client signatures, and automated Variation Order (VO) stage freezes.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-white p-1 rounded-2xl border border-[#192631]/12 shadow-sm">
                        <button
                            type="button"
                            onClick={() => setActiveSection('proposals')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                activeSection === 'proposals'
                                    ? 'bg-[#e04b2a] text-white shadow-sm'
                                    : 'text-[#192631]/70 hover:text-[#192631]'
                            }`}
                        >
                            RIBA Fee Proposals ({proposals.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveSection('vo_gate')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                activeSection === 'vo_gate'
                                    ? 'bg-[#e04b2a] text-white shadow-sm'
                                    : 'text-[#192631]/70 hover:text-[#192631]'
                            }`}
                        >
                            5-Gate VO Shield ({variationOrders.length})
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#192631] hover:bg-[#e04b2a] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        New RIBA Proposal
                    </button>
                </div>
            </div>

            {activeSection === 'proposals' ? (
                <div className="grid grid-cols-1 gap-6">
                    {proposals.map(proposal => {
                        const docsReadyCount = [
                            proposal.proposalSigned,
                            proposal.authorityNocUploaded,
                            proposal.retainerPaid,
                            proposal.siteSurveyUploaded,
                        ].filter(Boolean).length;
                        const gatePassed = docsReadyCount === 4;

                        return (
                            <div
                                key={proposal.id}
                                className="bg-white/90 rounded-3xl border border-[#192631]/12 p-6 lg:p-8 shadow-sm relative overflow-hidden"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#192631]/10">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <span className="px-3 py-1 rounded-lg bg-[#e04b2a]/10 border border-[#e04b2a]/25 text-[#e04b2a] text-[10px] font-black uppercase tracking-widest">
                                                {proposal.proposalNumber}
                                            </span>
                                            <span className="px-3 py-1 rounded-lg bg-[#192631]/5 border border-[#192631]/10 text-[#192631]/80 text-[10px] font-black uppercase tracking-widest">
                                                {proposal.branchLocation} · {proposal.currency}
                                            </span>
                                            <span
                                                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                                    gatePassed
                                                        ? 'bg-[#123524]/10 text-[#123524] border-[#123524]/25'
                                                        : 'bg-amber-500/10 text-amber-700 border-amber-500/30'
                                                }`}
                                            >
                                                {gatePassed ? '4/4 Pre-Contract Gate Ready' : `${docsReadyCount}/4 Gate Docs Verified`}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-black text-[#192631] tracking-tight">{proposal.projectTitle}</h3>
                                        <p className="text-sm text-[#192631]/65 font-medium mt-0.5">
                                            Client: <span className="text-[#192631] font-bold">{proposal.clientName}</span> ({proposal.clientEmail})
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-[#192631]/50 uppercase tracking-widest">Total RIBA Contract Fee</p>
                                            <p className="text-2xl font-black text-[#192631]">
                                                {proposal.currency} {proposal.totalFee.toLocaleString()}
                                            </p>
                                            <p className="text-[10px] text-[#e04b2a] font-bold">
                                                Retainer ({proposal.retainerPercentage}%): {proposal.currency}{' '}
                                                {Math.round((proposal.totalFee * proposal.retainerPercentage) / 100).toLocaleString()}
                                            </p>
                                        </div>

                                        {!proposal.proposalSigned && (
                                            <button
                                                type="button"
                                                onClick={() => setSigningProposal(proposal)}
                                                className="flex items-center gap-2 px-4 py-3 bg-[#e04b2a]/10 hover:bg-[#e04b2a] text-[#e04b2a] hover:text-white border border-[#e04b2a]/30 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                                            >
                                                <PenTool className="w-4 h-4" />
                                                Client E-Sign
                                            </button>
                                        )}

                                        {proposal.status !== 'converted' ? (
                                            <button
                                                type="button"
                                                onClick={() => handleConvertToProject(proposal)}
                                                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                                                    gatePassed
                                                        ? 'bg-[#123524] hover:bg-[#e04b2a] text-white shadow-md'
                                                        : 'bg-[#192631]/5 text-[#192631]/40 border border-[#192631]/10 cursor-not-allowed'
                                                }`}
                                            >
                                                {gatePassed ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                                Activate Project
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => proposal.projectId && navigate(`/projects/${proposal.projectId}`)}
                                                className="flex items-center gap-2 px-5 py-3 bg-[#192631] hover:bg-[#e04b2a] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                                            >
                                                Open Active Project
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* 4-Document Pre-Contract Gate Checklist */}
                                <div className="mt-6">
                                    <p className="text-[10px] font-black text-[#192631]/60 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <FileCheck className="w-3.5 h-3.5 text-[#e04b2a]" />
                                        Gate 1: Mandatory 4-Document Pre-Contract Verification (Click to toggle verification)
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        {[
                                            { key: 'proposalSigned' as const, label: '1. Signed RIBA Fee Proposal', sub: proposal.signedByName || 'Awaiting E-Signature' },
                                            { key: 'authorityNocUploaded' as const, label: '2. Municipality / Authority NOC', sub: ' Zoning & Building Permit Clearance' },
                                            { key: 'retainerPaid' as const, label: '3. Retainer Mobilization IPC', sub: `${proposal.retainerPercentage}% Advance Receipt` },
                                            { key: 'siteSurveyUploaded' as const, label: '4. Site Survey & GIS Coordinates', sub: 'Topographic & Boundary CAD Verified' },
                                        ].map(docItem => {
                                            const checked = proposal[docItem.key];
                                            return (
                                                <button
                                                    type="button"
                                                    key={docItem.key}
                                                    onClick={() => togglePreContractDoc(proposal, docItem.key)}
                                                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                                                        checked
                                                            ? 'bg-[#123524]/10 border-[#123524]/30 text-[#123524]'
                                                            : 'bg-[#f5f5f5] border-[#192631]/10 text-[#192631]/70 hover:border-[#e04b2a]/35'
                                                    }`}
                                                >
                                                    <CheckCircle2
                                                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                                                            checked ? 'text-[#123524]' : 'text-[#192631]/30'
                                                        }`}
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-black tracking-tight truncate">{docItem.label}</p>
                                                        <p className="text-[10px] text-[#192631]/60 truncate mt-0.5">{docItem.sub}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* RIBA Stages 1-5 Breakdown */}
                                <div className="mt-6 pt-6 border-t border-[#192631]/10">
                                    <p className="text-[10px] font-black text-[#192631]/60 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Layers className="w-3.5 h-3.5 text-[#e04b2a]" />
                                        RIBA Plan of Work Stages 1–5 Fee & Revision Quota Matrix
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                        {proposal.stages.map(stage => (
                                            <div
                                                key={stage.stageCode}
                                                className="p-3.5 rounded-2xl bg-[#f5f5f5] border border-[#192631]/10"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[10px] font-black text-[#e04b2a] uppercase tracking-widest">
                                                        {stage.stageCode}
                                                    </span>
                                                    <span className="text-[10px] font-black text-[#192631]/60">{stage.feePercentage}%</span>
                                                </div>
                                                <p className="text-xs font-bold text-[#192631] line-clamp-1 mb-2">{stage.stageName}</p>
                                                <p className="text-sm font-black text-[#123524]">
                                                    {proposal.currency} {stage.feeAmount.toLocaleString()}
                                                </p>
                                                <p className="text-[10px] text-[#192631]/60 mt-1">
                                                    Max Revisions: <strong className="text-[#192631]">{stage.includedRevisionRounds} rounds</strong>
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* 5-Gate Variation Order (VO) Scope-Creep Shield */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white/90 rounded-3xl border border-[#192631]/12 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-[#e04b2a]/10 border border-[#e04b2a]/25 text-[#e04b2a]">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-[#192631]">Raise Scope-Creep VO</h3>
                                <p className="text-[11px] text-[#192631]/60">Auto-freezes stage until Client Commercial Sign-Off</p>
                            </div>
                        </div>

                        <form onSubmit={handleRaiseVariationOrder} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-[#192631]/70 uppercase tracking-widest mb-1.5">
                                    Target Venture / Project
                                </label>
                                <select
                                    value={selectedVoProjectId}
                                    onChange={e => setSelectedVoProjectId(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-[#f5f5f5] border border-[#192631]/15 rounded-xl text-[#192631] text-xs font-bold"
                                >
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-[#192631]/70 uppercase tracking-widest mb-1.5">
                                    Variation / Out-of-Scope Revision Title
                                </label>
                                <input
                                    type="text"
                                    value={voTitle}
                                    onChange={e => setVoTitle(e.target.value)}
                                    placeholder="e.g., Revision #3: Facade Curtain Wall Mullion Redesign"
                                    className="w-full px-3.5 py-2.5 bg-[#f5f5f5] border border-[#192631]/15 rounded-xl text-[#192631] text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-[#192631]/70 uppercase tracking-widest mb-1.5">
                                        Extra Eng. Hours
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={voHours}
                                        onChange={e => setVoHours(Number(e.target.value))}
                                        className="w-full px-3.5 py-2.5 bg-[#f5f5f5] border border-[#192631]/15 rounded-xl text-[#192631] text-xs font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-[#192631]/70 uppercase tracking-widest mb-1.5">
                                        Schedule Shift (Days)
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={voScheduleDays}
                                        onChange={e => setVoScheduleDays(Number(e.target.value))}
                                        className="w-full px-3.5 py-2.5 bg-[#f5f5f5] border border-[#192631]/15 rounded-xl text-[#192631] text-xs font-bold"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-[#e04b2a] hover:bg-[#192631] text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md"
                            >
                                Issue Variation Order & Freeze Stage
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        {variationOrders.map(vo => {
                            const proj = projects.find(p => p.id === vo.projectId);
                            const isApproved = vo.status === 'approved';
                            return (
                                <div
                                    key={vo.id}
                                    className="bg-white/90 rounded-3xl border border-[#192631]/12 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                                >
                                    <div className="space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="px-2.5 py-1 rounded-lg bg-[#e04b2a]/10 border border-[#e04b2a]/25 text-[#e04b2a] text-[10px] font-black uppercase tracking-widest">
                                                {vo.code}
                                            </span>
                                            <span className="text-xs font-bold text-[#192631]/65">
                                                {proj?.name || 'Enterprise Venture'}
                                            </span>
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                    isApproved
                                                        ? 'bg-[#123524]/10 text-[#123524] border-[#123524]/25'
                                                        : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                                                }`}
                                            >
                                                {isApproved ? 'Approved & Unfrozen' : 'Stage Frozen — Pending Client Sign-Off'}
                                            </span>
                                        </div>
                                        <h4 className="text-base font-black text-[#192631]">{vo.title}</h4>
                                        <p className="text-xs text-[#192631]/65 leading-relaxed">{vo.description}</p>
                                        <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] font-bold text-[#192631]/75">
                                            <span className="text-[#123524]">
                                                Commercial Impact: +{activeOrg.currency} {vo.approvedAmount.toLocaleString()}
                                            </span>
                                            <span className="text-[#e04b2a]">Schedule Impact: +{vo.scheduleImpactDays} Days</span>
                                        </div>
                                    </div>

                                    {!isApproved && (
                                        <button
                                            type="button"
                                            onClick={() => handleApproveVo(vo)}
                                            className="px-4 py-2.5 bg-[#123524] hover:bg-[#e04b2a] text-white rounded-xl text-xs font-black uppercase tracking-widest shrink-0 transition-all shadow-md"
                                        >
                                            Approve VO & Unfreeze
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Create Proposal Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 bg-[#192631]/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white border border-[#192631]/15 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-[#192631] flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-[#e04b2a]" />
                                Create RIBA Stages 1–5 Fee Proposal
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(false)}
                                className="text-[#192631]/60 hover:text-[#192631] text-sm font-bold"
                            >
                                Close
                            </button>
                        </div>

                        <form onSubmit={handleCreateProposal} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-[#192631]/70 uppercase tracking-widest mb-1">
                                    Project / Venture Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={projectTitle}
                                    onChange={e => setProjectTitle(e.target.value)}
                                    placeholder="e.g., Al Reem Island Parametric Residential Tower"
                                    className="w-full px-3.5 py-2.5 bg-[#f5f5f5] border border-[#192631]/15 rounded-xl text-[#192631] text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-[#192631]/70 uppercase tracking-widest mb-1">
                                        Client Organization
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={clientName}
                                        onChange={e => setClientName(e.target.value)}
                                        placeholder="e.g., Mubadala / Emaar"
                                        className="w-full px-3.5 py-2.5 bg-[#f5f5f5] border border-[#192631]/15 rounded-xl text-[#192631] text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-[#192631]/70 uppercase tracking-widest mb-1">
                                        Client Email
                                    </label>
                                    <input
                                        type="email"
                                        value={clientEmail}
                                        onChange={e => setClientEmail(e.target.value)}
                                        placeholder="contracts@client.ae"
                                        className="w-full px-3.5 py-2.5 bg-[#f5f5f5] border border-[#192631]/15 rounded-xl text-[#192631] text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-[#192631]/70 uppercase tracking-widest mb-1">
                                        Branch Office
                                    </label>
                                    <select
                                        value={branchLocation}
                                        onChange={e => setBranchLocation(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-[#f5f5f5] border border-[#192631]/15 rounded-xl text-[#192631] text-xs font-bold"
                                    >
                                        {activeOrg.branches.map(b => (
                                            <option key={b} value={b}>
                                                {b}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-[#192631]/70 uppercase tracking-widest mb-1">
                                        Currency
                                    </label>
                                    <select
                                        value={currency}
                                        onChange={e => setCurrency(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-[#f5f5f5] border border-[#192631]/15 rounded-xl text-[#192631] text-xs font-bold"
                                    >
                                        <option value="EGP">EGP</option>
                                        <option value="AED">AED</option>
                                        <option value="SAR">SAR</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-[#192631]/70 uppercase tracking-widest mb-1">
                                        Total Fee
                                    </label>
                                    <input
                                        type="number"
                                        min={10000}
                                        step={5000}
                                        value={totalFee}
                                        onChange={e => setTotalFee(Number(e.target.value))}
                                        className="w-full px-3 py-2.5 bg-[#f5f5f5] border border-[#192631]/15 rounded-xl text-[#192631] text-xs font-bold"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-[#192631]/15 text-[#192631]/70 text-xs font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-[#e04b2a] hover:bg-[#192631] text-white text-xs font-black uppercase tracking-widest"
                                >
                                    Generate RIBA Proposal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Digital Signature Pad Modal */}
            {signingProposal && (
                <div className="fixed inset-0 z-50 bg-[#192631]/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white border border-[#192631]/15 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-[#192631] flex items-center gap-2">
                                <FileSignature className="w-5 h-5 text-[#e04b2a]" />
                                Client Digital Sign-Off
                            </h3>
                            <button
                                type="button"
                                onClick={() => setSigningProposal(null)}
                                className="text-[#192631]/60 hover:text-[#192631] text-xs font-bold"
                            >
                                Close
                            </button>
                        </div>

                        <p className="text-xs text-[#192631]/70">
                            Signing <strong className="text-[#192631]">{signingProposal.proposalNumber}</strong> for{' '}
                            <strong className="text-[#e04b2a]">{signingProposal.projectTitle}</strong> (
                            {signingProposal.currency} {signingProposal.totalFee.toLocaleString()}).
                        </p>

                        <div>
                            <label className="block text-[10px] font-black text-[#192631]/70 uppercase tracking-widest mb-1">
                                Authorized Signatory Name & Title
                            </label>
                            <input
                                type="text"
                                value={signerName}
                                onChange={e => setSignerName(e.target.value)}
                                placeholder="e.g., Eng. Hassan El-Khouly — Chief Development Officer"
                                className="w-full px-3.5 py-2.5 bg-[#f5f5f5] border border-[#192631]/15 rounded-xl text-[#192631] text-xs"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black text-[#192631]/70 uppercase tracking-widest">
                                    Draw Signature Below
                                </span>
                                <button
                                    type="button"
                                    onClick={clearCanvas}
                                    className="text-[10px] font-bold text-[#e04b2a] hover:underline"
                                >
                                    Clear Pad
                                </button>
                            </div>
                            <canvas
                                ref={canvasRef}
                                width={380}
                                height={130}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                className="w-full h-32 bg-[#f5f5f5] border border-[#192631]/15 rounded-2xl cursor-crosshair"
                            />
                            {!hasDrawnSignature && (
                                <p className="text-[10px] text-[#192631]/50 mt-1">
                                    Click and drag on the pad above to sign electronically.
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleCompleteSignature}
                            className="w-full py-3 bg-[#123524] hover:bg-[#e04b2a] text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md"
                        >
                            Certify & Lock Digital Signature
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
