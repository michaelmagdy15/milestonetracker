import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useTenant } from '../context/TenantContext';
import { supabase } from '../lib/supabase';
import type {
    BOQItem,
    Subcontractor,
    PaymentApplication,
    VariationOrder,
    ContractingRFI,
} from '../types';
import {
    Calculator,
    HardHat,
    FileDiff,
    MessageSquareWarning,
    TrendingUp,
    Plus,
    CheckCircle2,
    ShieldCheck,
    ArrowRight,
    Sparkles,
    Trash2,
    Check,
    X,
    FileCheck2,
    Scale,
    Building2,
    DollarSign,
    Clock,
    Layers,
    FileText,
    PackageCheck,
    Receipt,
    Wallet,
    Users,
    MapPin,
} from 'lucide-react';
import clsx from 'clsx';
import { DocumentControlHub } from '../components/nexus/DocumentControlHub';
import { PricingEngineHub } from '../components/nexus/PricingEngineHub';
import { ProcurementWarehouseHub } from '../components/nexus/ProcurementWarehouseHub';
import { ExtractsStatementsHub } from '../components/nexus/ExtractsStatementsHub';
import { TreasuryCashBankHub } from '../components/nexus/TreasuryCashBankHub';
import { SubcontractorsDirectoryHub } from '../components/nexus/SubcontractorsDirectoryHub';
import { HrWhereaboutsHub } from '../components/nexus/HrWhereaboutsHub';

type ErpTab =
    | 'nexus_extracts'
    | 'nexus_pricing'
    | 'nexus_doc_control'
    | 'nexus_procurement'
    | 'nexus_treasury'
    | 'nexus_subcontractors'
    | 'nexus_hr_gps'
    | 'boq'
    | 'subcontractors'
    | 'variations'
    | 'rfis'
    | 'evm';

interface BOQAuditFinding {
    ruleId: string;
    severity: 'error' | 'warning' | 'info';
    itemCode: string;
    title: string;
    message: string;
    suggestion: string;
}

export const ContractingERP: React.FC<{ defaultTab?: ErpTab }> = ({ defaultTab = 'nexus_extracts' }) => {
    const { projects, entries, engineers, officeExpenses, addProject } = useData();
    const { activeOrg } = useTenant();
    const orgId = activeOrg?.id || 'org-default';
    const currencySymbol = activeOrg?.currency || 'EGP';

    const [activeTab, setActiveTab] = useState<ErpTab>(defaultTab);
    useEffect(() => {
        setActiveTab(defaultTab);
    }, [defaultTab]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

    const [boqItems, setBoqItems] = useState<BOQItem[]>([]);
    const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
    const [paymentApps, setPaymentApps] = useState<PaymentApplication[]>([]);
    const [variationOrders, setVariationOrders] = useState<VariationOrder[]>([]);
    const [rfis, setRfis] = useState<ContractingRFI[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [statusBanner, setStatusBanner] = useState<string | null>(null);

    // Modals / Forms state
    const [showAddBoq, setShowAddBoq] = useState(false);
    const [showAddSub, setShowAddSub] = useState(false);
    const [showAddIpc, setShowAddIpc] = useState(false);
    const [showAddVo, setShowAddVo] = useState(false);
    const [showAddRfi, setShowAddRfi] = useState(false);

    // New BOQ Form
    const [boqCode, setBoqCode] = useState('01.01');
    const [boqSection, setBoqSection] = useState('Substructure');
    const [boqDesc, setBoqDesc] = useState('');
    const [boqUnit, setBoqUnit] = useState('m3');
    const [boqQty, setBoqQty] = useState(100);
    const [boqNetCost, setBoqNetCost] = useState(420);
    const [boqTargetRate, setBoqTargetRate] = useState(480);
    const [boqSaleRate, setBoqSaleRate] = useState(550);
    const [boqBasis, setBoqBasis] = useState<BOQItem['priceBasis']>('catalogue');
    const [boqRisk, setBoqRisk] = useState(0.08);

    // New Subcontractor Form
    const [subName, setSubName] = useState('');
    const [subTrades, setSubTrades] = useState('MEP, HVAC');
    const [subContact, setSubContact] = useState('');
    const [subEmail, setSubEmail] = useState('');
    const [subPhone] = useState('');
    const [subPrequalScore, setSubPrequalScore] = useState(88);
    const [subInsuranceExpiry, setSubInsuranceExpiry] = useState('2027-06-30');
    const [subLienWaiver, setSubLienWaiver] = useState(true);

    // New IPC Form
    const [ipcSubId, setIpcSubId] = useState('');
    const [ipcNumber, setIpcNumber] = useState('IPC-001');
    const [ipcPackage, setIpcPackage] = useState('MEP Rough-In & Ductwork');
    const [ipcContractVal, setIpcContractVal] = useState(450000);
    const [ipcRetentionPct, setIpcRetentionPct] = useState(10);
    const [ipcClaimedGross, setIpcClaimedGross] = useState(125000);
    const [ipcCertifiedGross, setIpcCertifiedGross] = useState(118000);
    const [ipcAdvanceRecovery] = useState(10000);

    // New Variation Order Form
    const [voCode, setVoCode] = useState('VO-001');
    const [voTitle, setVoTitle] = useState('');
    const [voDesc, setVoDesc] = useState('');
    const [voReason, setVoReason] = useState<VariationOrder['reasonCategory']>('client_request');
    const [voContractorAmt, setVoContractorAmt] = useState(85000);
    const [voEngineerAmt, setVoEngineerAmt] = useState(78000);
    const [voDays, setVoDays] = useState(14);
    const [voBallInCourt, setVoBallInCourt] = useState('Commercial QS Lead');

    // New RFI Form
    const [rfiNumber, setRfiNumber] = useState('RFI-001');
    const [rfiSubject, setRfiSubject] = useState('');
    const [rfiDiscipline, setRfiDiscipline] = useState<ContractingRFI['discipline']>('Structural');
    const [rfiPriority, setRfiPriority] = useState<ContractingRFI['priority']>('high');
    const [rfiQuestion, setRfiQuestion] = useState('');
    const [rfiBallInCourt, setRfiBallInCourt] = useState('Lead Structural Consultant');
    const [rfiCostImpact] = useState(true);
    const [rfiCostEst, setRfiCostEst] = useState(45000);
    const [rfiSchedImpact] = useState(true);
    const [rfiSchedDays, setRfiSchedDays] = useState(7);

    const flashBanner = (msg: string) => {
        setStatusBanner(msg);
        setTimeout(() => setStatusBanner(null), 4000);
    };

    const fetchErpData = async () => {
        const [boqRes, subRes, ipcRes, voRes, rfiRes] = await Promise.all([
            supabase.from('boq_items').select('*'),
            supabase.from('subcontractors').select('*'),
            supabase.from('payment_applications').select('*'),
            supabase.from('variation_orders').select('*'),
            supabase.from('rfis').select('*'),
        ]);

        const belongsToOrg = (row: any) => !row.organization_id || row.organization_id === orgId;

        if (boqRes.data) {
            setBoqItems(
                boqRes.data.filter(belongsToOrg).map((r: any) => ({
                    id: r.id,
                    organizationId: r.organization_id || orgId,
                    projectId: r.project_id,
                    code: r.code || '01.01',
                    section: r.section || 'General',
                    description: r.description || '',
                    unit: r.unit || 'm2',
                    quantity: Number(r.quantity || 0),
                    netCostRate: Number(r.net_cost_rate || 0),
                    targetRate: Number(r.target_rate || 0),
                    saleRate: Number(r.sale_rate || 0),
                    claimedQty: Number(r.claimed_qty || 0),
                    certifiedQty: Number(r.certified_qty || 0),
                    priceBasis: r.price_basis || 'catalogue',
                    riskDispersion: Number(r.risk_dispersion ?? 0.05),
                    isLocked: Boolean(r.is_locked),
                    createdAt: r.created_at,
                }))
            );
        }

        if (subRes.data) {
            setSubcontractors(
                subRes.data.filter(belongsToOrg).map((r: any) => ({
                    id: r.id,
                    organizationId: r.organization_id || orgId,
                    legalName: r.legal_name || '',
                    tradeCategories: Array.isArray(r.trade_categories) ? r.trade_categories : ['General'],
                    taxId: r.tax_id || '',
                    contactName: r.contact_name || '',
                    email: r.email || '',
                    phone: r.phone || '',
                    prequalificationStatus: r.prequalification_status || 'approved',
                    prequalScore: Number(r.prequal_score ?? 85),
                    ratingScore: Number(r.rating_score ?? 4.5),
                    insuranceExpiryDate: r.insurance_expiry_date || '2027-12-31',
                    requiresLienWaiver: Boolean(r.requires_lien_waiver),
                    createdAt: r.created_at,
                }))
            );
        }

        if (ipcRes.data) {
            setPaymentApps(
                ipcRes.data.filter(belongsToOrg).map((r: any) => ({
                    id: r.id,
                    organizationId: r.organization_id || orgId,
                    projectId: r.project_id,
                    subcontractorId: r.subcontractor_id,
                    subcontractorName: r.subcontractor_name || 'Subcontractor',
                    applicationNumber: r.application_number || 'IPC-001',
                    workPackageName: r.work_package_name || '',
                    contractValue: Number(r.contract_value || 0),
                    retentionPercent: Number(r.retention_percent ?? 10),
                    claimedGross: Number(r.claimed_gross || 0),
                    certifiedGross: Number(r.certified_gross || 0),
                    approvedGross: Number(r.approved_gross || 0),
                    retentionHeld: Number(r.retention_held || 0),
                    retentionReleased: Number(r.retention_released || 0),
                    advanceRecovery: Number(r.advance_recovery || 0),
                    netPayable: Number(r.net_payable || 0),
                    lienWaiverSigned: Boolean(r.lien_waiver_signed),
                    status: r.status || 'submitted',
                    periodEnd: r.period_end || new Date().toISOString().split('T')[0],
                    createdAt: r.created_at,
                }))
            );
        }

        if (voRes.data) {
            setVariationOrders(
                voRes.data.filter(belongsToOrg).map((r: any) => ({
                    id: r.id,
                    organizationId: r.organization_id || orgId,
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
                    ballInCourt: r.ball_in_court || 'QS Lead',
                    currentApprovalStep: (r.current_approval_step || 1) as 1 | 2 | 3,
                    linkedRfiId: r.linked_rfi_id,
                    createdAt: r.created_at,
                }))
            );
        }

        if (rfiRes.data) {
            setRfis(
                rfiRes.data.filter(belongsToOrg).map((r: any) => ({
                    id: r.id,
                    organizationId: r.organization_id || orgId,
                    projectId: r.project_id,
                    rfiNumber: r.rfi_number || 'RFI-001',
                    subject: r.subject || '',
                    discipline: r.discipline || 'Structural',
                    priority: r.priority || 'high',
                    question: r.question || '',
                    officialResponse: r.official_response || '',
                    raisedBy: r.raised_by || 'Site Engineer',
                    ballInCourt: r.ball_in_court || 'Consultant',
                    status: r.status || 'open',
                    costImpact: Boolean(r.cost_impact),
                    costImpactEstimate: Number(r.cost_impact_estimate || 0),
                    scheduleImpact: Boolean(r.schedule_impact),
                    scheduleImpactDays: Number(r.schedule_impact_days || 0),
                    dueDate: r.due_date || new Date().toISOString().split('T')[0],
                    linkedVoId: r.linked_vo_id,
                    createdAt: r.created_at,
                }))
            );
        }

        setIsLoading(false);
    };

    useEffect(() => {
        fetchErpData();
        const ch = supabase
            .channel('erp-realtime')
            .on('postgres_changes', { table: 'boq_items' }, fetchErpData)
            .on('postgres_changes', { table: 'subcontractors' }, fetchErpData)
            .on('postgres_changes', { table: 'payment_applications' }, fetchErpData)
            .on('postgres_changes', { table: 'variation_orders' }, fetchErpData)
            .on('postgres_changes', { table: 'rfis' }, fetchErpData)
            .subscribe();

        return () => {
            supabase.removeChannel(ch);
        };
    }, [orgId]);

    const activeProjectId = useMemo(() => {
        if (selectedProjectId !== 'all') return selectedProjectId;
        return projects[0]?.id || 'proj-default-1';
    }, [selectedProjectId, projects]);

    // Filtered datasets by project
    const filteredBoq = useMemo(
        () => (selectedProjectId === 'all' ? boqItems : boqItems.filter(b => b.projectId === selectedProjectId)),
        [boqItems, selectedProjectId]
    );
    const filteredIpcs = useMemo(
        () => (selectedProjectId === 'all' ? paymentApps : paymentApps.filter(p => p.projectId === selectedProjectId)),
        [paymentApps, selectedProjectId]
    );
    const filteredVos = useMemo(
        () => (selectedProjectId === 'all' ? variationOrders : variationOrders.filter(v => v.projectId === selectedProjectId)),
        [variationOrders, selectedProjectId]
    );
    const filteredRfis = useMemo(
        () => (selectedProjectId === 'all' ? rfis : rfis.filter(r => r.projectId === selectedProjectId)),
        [rfis, selectedProjectId]
    );

    // ─── BOQ Smart Audit Engine (ported from KanadeK/boq-check + OpenConstructionERP) ───
    const boqAuditFindings = useMemo<BOQAuditFinding[]>(() => {
        const findings: BOQAuditFinding[] = [];
        const seenCodes = new Set<string>();

        filteredBoq.forEach(item => {
            if (seenCodes.has(`${item.projectId}:${item.code}`)) {
                findings.push({
                    ruleId: 'BQ001',
                    severity: 'error',
                    itemCode: item.code,
                    title: 'Duplicate BOQ Ordinal Code',
                    message: `Item ${item.code} ("${item.description}") shares its code with another position.`,
                    suggestion: 'Assign a unique hierarchical WBS code (e.g., 01.02, 01.03) per GAEB/ISO standard.',
                });
            }
            seenCodes.add(`${item.projectId}:${item.code}`);

            if (item.saleRate < item.netCostRate) {
                findings.push({
                    ruleId: 'BQ004',
                    severity: 'error',
                    itemCode: item.code,
                    title: 'Negative Contractor Margin (Loss Leader)',
                    message: `Client Sale Rate (${currencySymbol} ${item.saleRate}) is below Direct Net Cost Rate (${currencySymbol} ${item.netCostRate}).`,
                    suggestion: 'Increase Client Sale Rate above Target Rate or negotiate subcontractor rate reduction.',
                });
            }

            if (item.claimedQty > item.quantity) {
                findings.push({
                    ruleId: 'BQ008',
                    severity: 'warning',
                    itemCode: item.code,
                    title: 'Quantity Overrun Beyond Baseline BOQ',
                    message: `Claimed quantity (${item.claimedQty} ${item.unit}) exceeds baseline contract quantity (${item.quantity} ${item.unit}).`,
                    suggestion: 'Raise a Variation Order (VO) for the excess re-measured quantity before certifying.',
                });
            }

            if (item.claimedQty > item.certifiedQty) {
                findings.push({
                    ruleId: 'BQ011',
                    severity: 'info',
                    itemCode: item.code,
                    title: 'Pending QS Measurement Certification',
                    message: `${(item.claimedQty - item.certifiedQty).toFixed(1)} ${item.unit} claimed on site awaits QS certification.`,
                    suggestion: 'Verify joint site measurement sheet and update Certified Quantity.',
                });
            }

            if (item.riskDispersion >= 0.2) {
                findings.push({
                    ruleId: 'BQ014',
                    severity: 'warning',
                    itemCode: item.code,
                    title: 'High Risk Sigma Dispersion (≥20%)',
                    message: `Item carries ${(item.riskDispersion * 100).toFixed(0)}% price uncertainty (${item.priceBasis}).`,
                    suggestion: 'Lock in a firm subcontractor quotation or allocate contingency reserve.',
                });
            }
        });

        return findings;
    }, [filteredBoq, currencySymbol]);

    // ─── Seed Realistic Contracting ERP Dataset ───
    const handleSeedErpData = async () => {
        let targetProjId = projects[0]?.id;
        if (!targetProjId) {
            targetProjId = 'proj-marina-tower';
            await addProject({
                id: targetProjId,
                organizationId: orgId,
                name: 'Marina Gate Commercial Tower & Podium',
                budget: 4500000,
                hourlyRate: 180,
                phase: 'Site Execution & Construction',
                startDate: '2026-01-15',
                endDate: '2027-06-30',
            });
        }

        const now = new Date().toISOString();

        const sampleBoq = [
            {
                id: 'boq-1',
                organization_id: orgId,
                project_id: targetProjId,
                code: '01.01',
                section: 'Substructure & Piling',
                description: 'Reinforced Concrete Raft Foundation C50/60 incl. waterproofing membrane & blinding',
                unit: 'm3',
                quantity: 1850,
                net_cost_rate: 620,
                target_rate: 710,
                sale_rate: 840,
                claimed_qty: 1850,
                certified_qty: 1850,
                price_basis: 'subcontractor_quote',
                risk_dispersion: 0.05,
                is_locked: true,
                created_at: now,
            },
            {
                id: 'boq-2',
                organization_id: orgId,
                project_id: targetProjId,
                code: '02.01',
                section: 'Superstructure',
                description: 'Post-Tensioned Concrete Slabs & Shear Walls (Typical Floors L1–L18)',
                unit: 'm3',
                quantity: 4200,
                net_cost_rate: 740,
                target_rate: 850,
                sale_rate: 980,
                claimed_qty: 2950,
                certified_qty: 2700,
                price_basis: 'catalogue',
                risk_dispersion: 0.08,
                is_locked: false,
                created_at: now,
            },
            {
                id: 'boq-3',
                organization_id: orgId,
                project_id: targetProjId,
                code: '03.01',
                section: 'Facade & Curtain Wall',
                description: 'Unitized Double-Glazed Low-E Curtain Wall System with Thermal Break Aluminum Profiles',
                unit: 'm2',
                quantity: 6400,
                net_cost_rate: 1150,
                target_rate: 1320,
                sale_rate: 1550,
                claimed_qty: 2100,
                certified_qty: 1800,
                price_basis: 'subcontractor_quote',
                risk_dispersion: 0.12,
                is_locked: false,
                created_at: now,
            },
            {
                id: 'boq-4',
                organization_id: orgId,
                project_id: targetProjId,
                code: '04.01',
                section: 'MEP & HVAC Systems',
                description: 'Chilled Water Plant, FAHUs, BMS Controls & Fire Fighting Sprinkler Network',
                unit: 'ls',
                quantity: 1,
                net_cost_rate: 2800000,
                target_rate: 3150000,
                sale_rate: 3650000,
                claimed_qty: 0.45,
                certified_qty: 0.4,
                price_basis: 'provisional',
                risk_dispersion: 0.22,
                is_locked: false,
                created_at: now,
            },
        ];

        const sampleSubs = [
            {
                id: 'sub-1',
                organization_id: orgId,
                legal_name: 'Gulf Electro-Mechanical & HVAC LLC',
                trade_categories: ['MEP', 'HVAC', 'Fire Fighting'],
                tax_id: 'TRN-100492817200003',
                contact_name: 'Eng. Tariq Al-Mansoori',
                email: 'tariq@gulfmep.ae',
                phone: '+971 50 492 8172',
                prequalification_status: 'approved',
                prequal_score: 94,
                rating_score: 4.8,
                insurance_expiry_date: '2027-09-30',
                requires_lien_waiver: true,
                created_at: now,
            },
            {
                id: 'sub-2',
                organization_id: orgId,
                legal_name: 'Al-Noor Structural & Facade Glazing Co.',
                trade_categories: ['Facade', 'Curtain Wall', 'Structural Steel'],
                tax_id: 'TRN-100837192300003',
                contact_name: 'Eng. Karim Hassan',
                email: 'khassan@alnoorfacade.com',
                phone: '+971 52 831 9044',
                prequalification_status: 'approved',
                prequal_score: 89,
                rating_score: 4.6,
                insurance_expiry_date: '2027-05-15',
                requires_lien_waiver: true,
                created_at: now,
            },
        ];

        const sampleIpcs = [
            {
                id: 'ipc-1',
                organization_id: orgId,
                project_id: targetProjId,
                subcontractor_id: 'sub-1',
                subcontractor_name: 'Gulf Electro-Mechanical & HVAC LLC',
                application_number: 'IPC-004',
                work_package_name: 'MEP Chilled Water Risers & Basement Ductwork',
                contract_value: 3150000,
                retention_percent: 10,
                claimed_gross: 840000,
                certified_gross: 795000,
                approved_gross: 795000,
                retention_held: 79500,
                retention_released: 0,
                advance_recovery: 45000,
                net_payable: 670500,
                lien_waiver_signed: true,
                status: 'finance_approved',
                period_end: '2026-10-15',
                created_at: now,
            },
            {
                id: 'ipc-2',
                organization_id: orgId,
                project_id: targetProjId,
                subcontractor_id: 'sub-2',
                subcontractor_name: 'Al-Noor Structural & Facade Glazing Co.',
                application_number: 'IPC-002',
                work_package_name: 'Podium & Tower L1-L8 Curtain Wall Mullions & Glazing',
                contract_value: 4800000,
                retention_percent: 10,
                claimed_gross: 1120000,
                certified_gross: 1050000,
                approved_gross: 0,
                retention_held: 105000,
                retention_released: 0,
                advance_recovery: 60000,
                net_payable: 885000,
                lien_waiver_signed: false,
                status: 'qs_certified',
                period_end: '2026-10-15',
                created_at: now,
            },
        ];

        const sampleVos = [
            {
                id: 'vo-1',
                organization_id: orgId,
                project_id: targetProjId,
                code: 'VO-001',
                title: 'Acoustic Louvers & Chiller Plant Structural Steel Up-sizing',
                description: 'Addition of acoustic attenuation louvers around roof chiller yard and heavier HEB300 steel grillage per revised tenant load.',
                reason_category: 'client_request',
                status: 'approved',
                contractor_amount: 420000,
                engineer_assessed_amount: 385000,
                approved_amount: 385000,
                schedule_impact_days: 12,
                approved_time_days: 10,
                ball_in_court: 'Closed / Approved',
                current_approval_step: 3,
                created_at: now,
            },
            {
                id: 'vo-2',
                organization_id: orgId,
                project_id: targetProjId,
                code: 'VO-002',
                title: 'Podium Atrium Feature Skylight & Smoke Extract Damper Upgrade',
                description: 'Upgrading atrium glazing to fire-rated 120-min system with automated EN-12101 smoke actuators.',
                reason_category: 'design_change',
                status: 'commercial_approved',
                contractor_amount: 295000,
                engineer_assessed_amount: 268000,
                approved_amount: 268000,
                schedule_impact_days: 18,
                approved_time_days: 14,
                ball_in_court: 'Client Project Director',
                current_approval_step: 2,
                created_at: now,
            },
        ];

        const sampleRfis = [
            {
                id: 'rfi-1',
                organization_id: orgId,
                project_id: targetProjId,
                rfi_number: 'RFI-014',
                subject: 'Clash Between Post-Tension Tendon Anchorage & Main Smoke Duct at Grid C-7',
                discipline: 'Structural',
                priority: 'critical',
                question: 'Main 1200x600 smoke extract riser clashes with PT live-end anchorage zone at L4 transfer beam. Requesting approved sleeve offset detail.',
                official_response: 'Relocate penetration 850mm East of Grid C-7 with additional U-bar trimmers per sketch SK-STR-042.',
                raised_by: 'Eng. Tariq Al-Mansoori',
                ball_in_court: 'Site Execution Team',
                status: 'answered',
                cost_impact: true,
                cost_impact_estimate: 65000,
                schedule_impact: true,
                schedule_impact_days: 5,
                due_date: '2026-10-20',
                created_at: now,
            },
            {
                id: 'rfi-2',
                organization_id: orgId,
                project_id: targetProjId,
                rfi_number: 'RFI-015',
                subject: 'Transformer Room MV Switchgear Trench Depth Clarification',
                discipline: 'MEP',
                priority: 'high',
                question: 'Local utility authority specification requires 1400mm bending radius trench depth whereas IFC drawing shows 1000mm. Please confirm depression slab thickness.',
                official_response: '',
                raised_by: 'Platform Administrator',
                ball_in_court: 'Lead MEP Consultant',
                status: 'open',
                cost_impact: true,
                cost_impact_estimate: 42000,
                schedule_impact: true,
                schedule_impact_days: 7,
                due_date: '2026-10-25',
                created_at: now,
            },
        ];

        await Promise.all([
            supabase.from('boq_items').insert(sampleBoq),
            supabase.from('subcontractors').insert(sampleSubs),
            supabase.from('payment_applications').insert(sampleIpcs),
            supabase.from('variation_orders').insert(sampleVos),
            supabase.from('rfis').insert(sampleRfis),
        ]);

        await fetchErpData();
        flashBanner('Sample Contracting ERP dataset (BOQ, Subcontractors, IPCs, Variation Orders & RFIs) synced to Firebase Cloud Firestore!');
    };

    // ─── Handlers for BOQ ───
    const handleCreateBoqItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!boqDesc.trim()) return;
        const newItem = {
            id: `boq-${crypto.randomUUID().slice(0, 8)}`,
            organization_id: orgId,
            project_id: activeProjectId,
            code: boqCode.trim(),
            section: boqSection.trim(),
            description: boqDesc.trim(),
            unit: boqUnit,
            quantity: Number(boqQty),
            net_cost_rate: Number(boqNetCost),
            target_rate: Number(boqTargetRate),
            sale_rate: Number(boqSaleRate),
            claimed_qty: 0,
            certified_qty: 0,
            price_basis: boqBasis,
            risk_dispersion: Number(boqRisk),
            is_locked: false,
            created_at: new Date().toISOString(),
        };
        await supabase.from('boq_items').insert([newItem]);
        setShowAddBoq(false);
        setBoqDesc('');
        await fetchErpData();
        flashBanner(`Added BOQ item ${newItem.code} to Firestore.`);
    };

    const handleCertifyBoqQuantity = async (item: BOQItem, newClaimed: number, newCertified: number) => {
        await supabase
            .from('boq_items')
            .update({ claimed_qty: newClaimed, certified_qty: newCertified })
            .eq('id', item.id);
        await fetchErpData();
    };

    const handleDeleteBoqItem = async (id: string) => {
        await supabase.from('boq_items').delete().eq('id', id);
        await fetchErpData();
    };

    // ─── Handlers for Subcontractors & IPCs ───
    const handleCreateSubcontractor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subName.trim()) return;
        const newSub = {
            id: `sub-${crypto.randomUUID().slice(0, 8)}`,
            organization_id: orgId,
            legal_name: subName.trim(),
            trade_categories: subTrades.split(',').map(s => s.trim()).filter(Boolean),
            contact_name: subContact.trim() || 'Operations Manager',
            email: subEmail.trim(),
            phone: subPhone.trim(),
            prequalification_status: subPrequalScore >= 75 ? 'approved' : 'conditional',
            prequal_score: Number(subPrequalScore),
            rating_score: 4.5,
            insurance_expiry_date: subInsuranceExpiry,
            requires_lien_waiver: subLienWaiver,
            created_at: new Date().toISOString(),
        };
        await supabase.from('subcontractors').insert([newSub]);
        setShowAddSub(false);
        setSubName('');
        await fetchErpData();
        flashBanner(`Subcontractor "${newSub.legal_name}" registered & prequalified.`);
    };

    const handleCreateIpc = async (e: React.FormEvent) => {
        e.preventDefault();
        const sub = subcontractors.find(s => s.id === ipcSubId) || subcontractors[0];
        const retHeld = (ipcCertifiedGross * ipcRetentionPct) / 100;
        const net = Math.max(0, ipcCertifiedGross - retHeld - ipcAdvanceRecovery);

        const newIpc = {
            id: `ipc-${crypto.randomUUID().slice(0, 8)}`,
            organization_id: orgId,
            project_id: activeProjectId,
            subcontractor_id: sub?.id || 'sub-general',
            subcontractor_name: sub?.legalName || 'Specialist Subcontractor',
            application_number: ipcNumber.trim(),
            work_package_name: ipcPackage.trim(),
            contract_value: Number(ipcContractVal),
            retention_percent: Number(ipcRetentionPct),
            claimed_gross: Number(ipcClaimedGross),
            certified_gross: Number(ipcCertifiedGross),
            approved_gross: Number(ipcCertifiedGross),
            retention_held: retHeld,
            retention_released: 0,
            advance_recovery: Number(ipcAdvanceRecovery),
            net_payable: net,
            lien_waiver_signed: false,
            status: 'submitted',
            period_end: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
        };
        await supabase.from('payment_applications').insert([newIpc]);
        setShowAddIpc(false);
        await fetchErpData();
        flashBanner(`Payment Application ${newIpc.application_number} created.`);
    };

    const handleAdvanceIpcStatus = async (ipc: PaymentApplication, nextStatus: PaymentApplication['status'], signWaiver = false) => {
        const updates: Record<string, any> = { status: nextStatus };
        if (signWaiver) updates.lien_waiver_signed = true;
        if (nextStatus === 'finance_approved' || nextStatus === 'paid') {
            updates.approved_gross = ipc.certifiedGross;
        }
        await supabase.from('payment_applications').update(updates).eq('id', ipc.id);
        await fetchErpData();
        flashBanner(`Updated ${ipc.applicationNumber} to ${nextStatus.replace('_', ' ').toUpperCase()}.`);
    };

    const handleReleaseRetention = async (ipc: PaymentApplication) => {
        if (ipc.retentionHeld <= 0) return;
        const releaseAmt = ipc.retentionHeld;
        await supabase
            .from('payment_applications')
            .update({
                retention_held: 0,
                retention_released: (ipc.retentionReleased || 0) + releaseAmt,
                net_payable: ipc.netPayable + releaseAmt,
            })
            .eq('id', ipc.id);
        await fetchErpData();
        flashBanner(`Released ${currencySymbol} ${releaseAmt.toLocaleString()} retention for ${ipc.applicationNumber}.`);
    };

    // ─── Handlers for Variation Orders ───
    const handleCreateVo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!voTitle.trim()) return;
        const newVo = {
            id: `vo-${crypto.randomUUID().slice(0, 8)}`,
            organization_id: orgId,
            project_id: activeProjectId,
            code: voCode.trim(),
            title: voTitle.trim(),
            description: voDesc.trim(),
            reason_category: voReason,
            status: 'submitted',
            contractor_amount: Number(voContractorAmt),
            engineer_assessed_amount: Number(voEngineerAmt),
            approved_amount: Number(voEngineerAmt),
            schedule_impact_days: Number(voDays),
            approved_time_days: Number(voDays),
            ball_in_court: voBallInCourt,
            current_approval_step: 1,
            created_at: new Date().toISOString(),
        };
        await supabase.from('variation_orders').insert([newVo]);
        setShowAddVo(false);
        setVoTitle('');
        setVoDesc('');
        await fetchErpData();
        flashBanner(`Variation Order ${newVo.code} submitted into 3-step approval chain.`);
    };

    const handleAdvanceVoApproval = async (vo: VariationOrder) => {
        let nextStep: 1 | 2 | 3 = vo.currentApprovalStep;
        let nextStatus: VariationOrder['status'] = vo.status;
        let nextBall = vo.ballInCourt;

        if (vo.currentApprovalStep === 1 && vo.status === 'submitted') {
            nextStep = 2;
            nextStatus = 'technical_approved';
            nextBall = 'Commercial QS Director';
        } else if (vo.currentApprovalStep === 2 || vo.status === 'technical_approved') {
            nextStep = 3;
            nextStatus = 'commercial_approved';
            nextBall = 'Client Representative';
        } else {
            nextStep = 3;
            nextStatus = 'approved';
            nextBall = 'Closed / Approved';
        }

        await supabase
            .from('variation_orders')
            .update({
                current_approval_step: nextStep,
                status: nextStatus,
                ball_in_court: nextBall,
                approved_amount: vo.engineerAssessedAmount,
            })
            .eq('id', vo.id);
        await fetchErpData();
        flashBanner(`Variation Order ${vo.code} advanced to ${nextStatus.replace('_', ' ').toUpperCase()}.`);
    };

    // ─── Handlers for RFIs & 1-Click Escalation to VO ───
    const handleCreateRfi = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rfiSubject.trim()) return;
        const newRfi = {
            id: `rfi-${crypto.randomUUID().slice(0, 8)}`,
            organization_id: orgId,
            project_id: activeProjectId,
            rfi_number: rfiNumber.trim(),
            subject: rfiSubject.trim(),
            discipline: rfiDiscipline,
            priority: rfiPriority,
            question: rfiQuestion.trim(),
            official_response: '',
            raised_by: 'Platform Administrator',
            ball_in_court: rfiBallInCourt,
            status: 'open',
            cost_impact: rfiCostImpact,
            cost_impact_estimate: Number(rfiCostEst),
            schedule_impact: rfiSchedImpact,
            schedule_impact_days: Number(rfiSchedDays),
            due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            created_at: new Date().toISOString(),
        };
        await supabase.from('rfis').insert([newRfi]);
        setShowAddRfi(false);
        setRfiSubject('');
        setRfiQuestion('');
        await fetchErpData();
        flashBanner(`RFI ${newRfi.rfi_number} logged in Firestore.`);
    };

    const handleConvertRfiToVo = async (rfi: ContractingRFI) => {
        const nextVoCode = `VO-00${variationOrders.length + 1}`;
        const voId = `vo-${crypto.randomUUID().slice(0, 8)}`;
        const newVo = {
            id: voId,
            organization_id: orgId,
            project_id: rfi.projectId || activeProjectId,
            code: nextVoCode,
            title: `[From ${rfi.rfiNumber}] ${rfi.subject}`,
            description: `Escalated from Technical ${rfi.rfiNumber}: ${rfi.question}`,
            reason_category: 'design_change',
            status: 'submitted',
            contractor_amount: rfi.costImpactEstimate || 50000,
            engineer_assessed_amount: rfi.costImpactEstimate || 50000,
            approved_amount: rfi.costImpactEstimate || 50000,
            schedule_impact_days: rfi.scheduleImpactDays || 7,
            approved_time_days: rfi.scheduleImpactDays || 7,
            ball_in_court: 'Commercial QS Lead',
            current_approval_step: 1,
            linked_rfi_id: rfi.id,
            created_at: new Date().toISOString(),
        };

        await Promise.all([
            supabase.from('variation_orders').insert([newVo]),
            supabase
                .from('rfis')
                .update({ status: 'converted_to_vo', linked_vo_id: voId })
                .eq('id', rfi.id),
        ]);

        await fetchErpData();
        setActiveTab('variations');
        flashBanner(`Escalated ${rfi.rfiNumber} to Variation Order ${nextVoCode}!`);
    };

    // ─── 5D Earned Value (EVM) & Cost-Value Reconciliation (CVR) Engine ───
    const evmMetrics = useMemo(() => {
        const boqBaselineContract = filteredBoq.reduce((sum, item) => sum + item.quantity * item.saleRate, 0);
        const boqTargetCost = filteredBoq.reduce((sum, item) => sum + item.quantity * item.netCostRate, 0);
        const boqEarnedValue = filteredBoq.reduce((sum, item) => sum + item.certifiedQty * item.saleRate, 0);
        const boqClaimedValue = filteredBoq.reduce((sum, item) => sum + item.claimedQty * item.saleRate, 0);

        const approvedVoValue = filteredVos
            .filter(v => v.status === 'approved')
            .reduce((sum, v) => sum + v.approvedAmount, 0);
        const pendingVoExposure = filteredVos
            .filter(v => v.status !== 'approved' && v.status !== 'rejected')
            .reduce((sum, v) => sum + v.contractorAmount, 0);

        const revisedBac = (boqBaselineContract || 3500000) + approvedVoValue;
        const plannedValue = revisedBac * 0.55; // Baseline schedule planned progress
        const earnedValue = boqEarnedValue > 0 ? boqEarnedValue + approvedVoValue * 0.5 : revisedBac * 0.52;

        // Actual Cost = Subcontractor Certified Gross + Engineer Timesheet Cost + Office Expenses
        const subCertifiedTotal = filteredIpcs.reduce((sum, ipc) => sum + ipc.certifiedGross, 0);
        const totalRetentionHeld = filteredIpcs.reduce((sum, ipc) => sum + ipc.retentionHeld, 0);
        const timesheetCost = entries.reduce((sum, e) => {
            const eng = engineers.find(en => en.id === e.engineerId);
            return sum + e.timeSpent * (eng?.hourlyRate || 150);
        }, 0);
        const expenseCost = officeExpenses.reduce((sum, ex) => sum + ex.amount, 0);

        const rawActualCost = subCertifiedTotal + timesheetCost + expenseCost;
        const actualCost = rawActualCost > 0 ? rawActualCost : Math.round(earnedValue / 1.12);
        const cpi = earnedValue / actualCost;
        const spi = plannedValue > 0 ? earnedValue / plannedValue : 1;
        const eac = cpi > 0 ? revisedBac / cpi : revisedBac;
        const vac = revisedBac - eac;
        const tcpi =
            revisedBac - actualCost > 0
                ? (revisedBac - earnedValue) / (revisedBac - actualCost)
                : 1;

        return {
            boqBaselineContract,
            boqTargetCost,
            boqEarnedValue,
            boqClaimedValue,
            approvedVoValue,
            pendingVoExposure,
            revisedBac,
            plannedValue,
            earnedValue,
            actualCost,
            subCertifiedTotal,
            totalRetentionHeld,
            timesheetCost,
            cpi,
            spi,
            eac,
            vac,
            tcpi,
        };
    }, [filteredBoq, filteredVos, filteredIpcs, entries, engineers, officeExpenses]);

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e04b2a]/10 border border-[#e04b2a]/25 text-[#e04b2a] text-[11px] font-black uppercase tracking-wider mb-3">
                        <Layers className="w-3.5 h-3.5" />
                        Nexus Contracting ERP · R02 Work Map · Document Control · Live Extracts
                    </div>
                    <h1 className="text-3xl lg:text-5xl font-black text-[#192631] tracking-tight">
                        Nexus <span className="text-[#e04b2a]">& Contracting ERP</span>
                    </h1>
                    <p className="text-[#192631]/75 text-sm mt-2 max-w-3xl leading-relaxed">
                        Unified Nexus Contracting ERP & Milestone Tracker: Live Cumulative Works Extracts (مستخلصات جارية), Client Account Statements (كشف حساب عميل), R02 Tendering & Granular Cost Breakdown (839 Items), 51-Clause Document Control & Submittals (MS/DR/MIR/SL/SIR), Submittal-Gated Procurement & 4-Warehouse Custody, 56 Subcontractors Directory, Treasury/Credit Cards (738,284.19 EGP), and HR GPS Whereabouts.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={selectedProjectId}
                        onChange={e => setSelectedProjectId(e.target.value)}
                        className="bg-white/85 backdrop-blur-md border border-[#192631]/15 rounded-xl px-4 py-2.5 text-xs font-bold text-[#192631] focus:outline-none focus:border-[#e04b2a] shadow-sm"
                    >
                        <option value="all">All Active Projects ({projects.length})</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleSeedErpData}
                        className="px-4 py-2.5 rounded-xl bg-white/85 hover:bg-[#e04b2a]/10 border border-[#e04b2a]/30 text-xs font-bold text-[#e04b2a] flex items-center gap-2 transition-all shadow-sm"
                    >
                        <Sparkles className="w-4 h-4" />
                        Load Sample Contracting ERP Data
                    </button>
                </div>
            </div>

            {statusBanner && (
                <div className="p-4 rounded-2xl bg-[#123524]/10 border border-[#123524]/25 text-[#123524] text-xs font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#123524]" />
                        {statusBanner}
                    </span>
                    <button onClick={() => setStatusBanner(null)} className="text-[#123524] hover:text-[#192631]">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Top Executive Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white/80 backdrop-blur-xl border border-[#192631]/10 rounded-2xl p-5 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#192631]/60 mb-1">Spendable Nexus Liquidity</p>
                    <p className="text-2xl font-black text-[#123524]">
                        EGP 738,284.19
                    </p>
                    <p className="text-[11px] text-[#192631]/70 font-bold mt-1">
                        Cash: 254,833.88 · Cards: 483,450.31
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl border border-[#192631]/10 rounded-2xl p-5 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#192631]/60 mb-1">C096 Works Extract #4 Net</p>
                    <p className="text-2xl font-black text-[#e04b2a]">
                        EGP 164,896.00
                    </p>
                    <p className="text-[11px] text-[#192631]/70 font-medium mt-1">
                        Achieved: EGP 909,969 · Actual: 1,042,730
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl border border-[#192631]/10 rounded-2xl p-5 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#192631]/60 mb-1">C096 Client Ledger Balance</p>
                    <p className="text-2xl font-black text-[#192631]">
                        EGP 107,048.10
                    </p>
                    <p className="text-[11px] text-[#192631]/70 font-medium mt-1">
                        Debit: 957,048.10 · Paid: 850,000.00
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl border border-[#192631]/10 rounded-2xl p-5 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#192631]/60 mb-1">Nexus R02 Work Map & Submittals</p>
                    <p className="text-2xl font-black text-[#192631]">
                        34 Pkgs · 839 Items
                    </p>
                    <p className="text-[11px] text-[#192631]/70 font-medium mt-1">
                        51 Submittal Clauses · 56 Subcontractors
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl border border-[#192631]/10 rounded-2xl p-5 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#192631]/60 mb-1">Cost Performance (CPI)</p>
                    <p className={clsx('text-2xl font-black', evmMetrics.cpi >= 1 ? 'text-[#123524]' : 'text-red-700')}>
                        {evmMetrics.cpi.toFixed(2)}x
                    </p>
                    <p className="text-[11px] text-[#192631]/70 font-medium mt-1">
                        46 Active Nexus Projects · 16 GPS Staff
                    </p>
                </div>
            </div>

            {/* Module Navigation Tabs */}
            <div className="flex flex-wrap gap-2 bg-white/75 backdrop-blur-xl p-2.5 rounded-2xl border border-[#192631]/10 shadow-sm">
                {[
                    { id: 'nexus_extracts', label: 'Works Extracts & Client Ledger (مستخلصات وكشف حساب)', icon: Receipt, badge: 'PDF 1-3' },
                    { id: 'nexus_pricing', label: 'R02 Tendering & Pricing Engine (التسعير وتحليل الأسعار)', icon: Calculator, badge: '839' },
                    { id: 'nexus_doc_control', label: 'Doc Control & 51 Submittals (الاعتمادات والتكويد)', icon: FileText, badge: '51' },
                    { id: 'nexus_procurement', label: 'Procurement, OCR & 4 Warehouses (المشتريات والمخازن)', icon: PackageCheck, badge: '4 Loc' },
                    { id: 'nexus_treasury', label: 'Treasury, 7 Cards & 46 Projects (الخزينة والسيولة)', icon: Wallet, badge: '46 Proj' },
                    { id: 'nexus_subcontractors', label: '56 Subcontractors & CPO/ST (مقاولو الباطن)', icon: Users, badge: '56' },
                    { id: 'nexus_hr_gps', label: 'HR GPS & Surprise Check (الحضور والـ GPS)', icon: MapPin, badge: '16' },
                    { id: 'boq', label: 'BOQ & Smart Auditor', icon: Calculator, badge: filteredBoq.length },
                    { id: 'subcontractors', label: 'Subcontracts & IPC Billing', icon: HardHat, badge: filteredIpcs.length },
                    { id: 'variations', label: 'Variation Orders (VO)', icon: FileDiff, badge: filteredVos.length },
                    { id: 'rfis', label: 'Technical RFIs', icon: MessageSquareWarning, badge: filteredRfis.length },
                    { id: 'evm', label: '5D EVM & CVR Reconciliation', icon: TrendingUp },
                ].map(t => {
                    const Icon = t.icon;
                    const active = activeTab === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id as ErpTab)}
                            className={clsx(
                                'px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-normal flex items-center gap-2 transition-all',
                                active
                                    ? 'bg-[#e04b2a] text-white shadow-md shadow-[#e04b2a]/25'
                                    : 'text-[#192631]/75 hover:text-[#192631] hover:bg-[#192631]/[0.06]'
                            )}
                        >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{t.label}</span>
                            {t.badge !== undefined && (
                                <span
                                    className={clsx(
                                        'px-2 py-0.5 rounded-full text-[10px] font-bold',
                                        active ? 'bg-white/25 text-white' : 'bg-[#192631]/[0.07] text-[#192631]/85'
                                    )}
                                >
                                    {t.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ───────────────── Nexus ERP INTEGRATED HUBS ───────────────── */}
            {activeTab === 'nexus_extracts' && <ExtractsStatementsHub />}
            {activeTab === 'nexus_pricing' && <PricingEngineHub />}
            {activeTab === 'nexus_doc_control' && <DocumentControlHub />}
            {activeTab === 'nexus_procurement' && <ProcurementWarehouseHub />}
            {activeTab === 'nexus_treasury' && <TreasuryCashBankHub />}
            {activeTab === 'nexus_subcontractors' && <SubcontractorsDirectoryHub />}
            {activeTab === 'nexus_hr_gps' && <HrWhereaboutsHub />}

            {isLoading && !activeTab.startsWith('nexus_') ? (
                <div className="p-12 text-center text-[#192631]/70 font-bold">Loading Contracting ERP modules from Cloud Firestore...</div>
            ) : (
                <>
                    {/* ───────────────── TAB 1: BOQ & SMART AUDITOR ───────────────── */}
                    {activeTab === 'boq' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-[#192631]/10">
                                <div>
                                    <h2 className="text-xl font-black text-[#192631] flex items-center gap-2">
                                        <Calculator className="w-5 h-5 text-[#e04b2a]" />
                                        Bill of Quantities (3-Tier Contractor Pricing & QS Measurement)
                                    </h2>
                                    <p className="text-xs text-[#192631]/70 mt-1">
                                        Tracks Net Cost Rate → Target Rate → Client Sale Rate, cumulative QS site measurements, and automated BOQ-Check audit rules.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowAddBoq(!showAddBoq)}
                                    className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 self-start"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add BOQ Position
                                </button>
                            </div>

                            {showAddBoq && (
                                <form onSubmit={handleCreateBoqItem} className="bg-[#181818] border border-[#e04b2a]/25 rounded-2xl p-6 space-y-4">
                                    <h3 className="text-sm font-black text-[#192631] uppercase tracking-wider">New BOQ Line Item</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">WBS / Item Code</label>
                                            <input
                                                value={boqCode}
                                                onChange={e => setBoqCode(e.target.value)}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                                placeholder="01.02"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Trade Section</label>
                                            <input
                                                value={boqSection}
                                                onChange={e => setBoqSection(e.target.value)}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                                placeholder="Substructure / MEP"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Unit</label>
                                            <select
                                                value={boqUnit}
                                                onChange={e => setBoqUnit(e.target.value)}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            >
                                                <option value="m3">m³ (Cubic Meter)</option>
                                                <option value="m2">m² (Square Meter)</option>
                                                <option value="lm">lm (Linear Meter)</option>
                                                <option value="ton">Ton</option>
                                                <option value="no">No. (Item)</option>
                                                <option value="ls">Lump Sum (LS)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Contract Quantity</label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={boqQty}
                                                onChange={e => setBoqQty(Number(e.target.value))}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-[#192631]/70">Scope Description</label>
                                        <input
                                            value={boqDesc}
                                            onChange={e => setBoqDesc(e.target.value)}
                                            className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            placeholder="Supply and install C50/60 reinforced concrete columns..."
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Net Cost Rate ({currencySymbol})</label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={boqNetCost}
                                                onChange={e => setBoqNetCost(Number(e.target.value))}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Target Rate ({currencySymbol})</label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={boqTargetRate}
                                                onChange={e => setBoqTargetRate(Number(e.target.value))}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Client Sale Rate ({currencySymbol})</label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={boqSaleRate}
                                                onChange={e => setBoqSaleRate(Number(e.target.value))}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Price Basis</label>
                                            <select
                                                value={boqBasis}
                                                onChange={e => setBoqBasis(e.target.value as BOQItem['priceBasis'])}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            >
                                                <option value="catalogue">Cost Catalogue (CWICR)</option>
                                                <option value="subcontractor_quote">Subcontractor Quote</option>
                                                <option value="historical">Historical Benchmark</option>
                                                <option value="provisional">Provisional Allowance</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Risk Dispersion (σ)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="1"
                                                value={boqRisk}
                                                onChange={e => setBoqRisk(Number(e.target.value))}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddBoq(false)}
                                            className="px-4 py-2 rounded-xl bg-[#192631]/[0.05] text-xs font-bold text-[#192631]/70"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-5 py-2 rounded-xl bg-orange-500 text-black text-xs font-black uppercase tracking-wider"
                                        >
                                            Save BOQ Position
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* BOQ Table */}
                            <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-[#192631]/10 text-[10px] font-black uppercase tracking-widest text-[#192631]/60 bg-[#f5f5f5]/85">
                                                <th className="py-3.5 px-4">Code / Section</th>
                                                <th className="py-3.5 px-4">Description</th>
                                                <th className="py-3.5 px-4 text-right">Contract Qty</th>
                                                <th className="py-3.5 px-4 text-right">3-Tier Rates ({currencySymbol})</th>
                                                <th className="py-3.5 px-4 text-right">Contract Total</th>
                                                <th className="py-3.5 px-4">QS Measurement (Claimed / Certified)</th>
                                                <th className="py-3.5 px-4 text-right">Margin / Risk</th>
                                                <th className="py-3.5 px-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#192631]/10 text-xs">
                                            {filteredBoq.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="py-12 text-center text-[#192631]/60">
                                                        No BOQ items yet. Click <strong>"Load Sample Contracting ERP Data"</strong> or <strong>"Add BOQ Position"</strong> above.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredBoq.map(item => {
                                                    const contractTotal = item.quantity * item.saleRate;
                                                    const certifiedTotal = item.certifiedQty * item.saleRate;
                                                    const marginPct =
                                                        item.saleRate > 0
                                                            ? ((item.saleRate - item.netCostRate) / item.saleRate) * 100
                                                            : 0;
                                                    const progressPct =
                                                        item.quantity > 0
                                                            ? Math.min(100, (item.certifiedQty / item.quantity) * 100)
                                                            : 0;

                                                    return (
                                                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                                            <td className="py-4 px-4 align-top">
                                                                <span className="font-mono font-black text-[#e04b2a]">{item.code}</span>
                                                                <p className="text-[10px] text-[#192631]/60 font-bold uppercase mt-0.5">{item.section}</p>
                                                            </td>
                                                            <td className="py-4 px-4 align-top max-w-xs">
                                                                <p className="font-bold text-[#192631] leading-snug">{item.description}</p>
                                                                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#192631]/[0.05] text-[10px] text-[#192631]/70 font-mono">
                                                                    Basis: {item.priceBasis}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-4 align-top text-right font-mono font-bold text-[#192631]">
                                                                {item.quantity.toLocaleString()} <span className="text-[#192631]/60">{item.unit}</span>
                                                            </td>
                                                            <td className="py-4 px-4 align-top text-right font-mono">
                                                                <div className="text-[#192631]/70 text-[11px]">Net: {item.netCostRate.toLocaleString()}</div>
                                                                <div className="text-[#192631]/85 text-[11px]">Tgt: {item.targetRate.toLocaleString()}</div>
                                                                <div className="text-[#192631] font-black">Sale: {item.saleRate.toLocaleString()}</div>
                                                            </td>
                                                            <td className="py-4 px-4 align-top text-right font-mono">
                                                                <div className="font-black text-[#192631]">
                                                                    {currencySymbol} {contractTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                                </div>
                                                                <div className="text-[11px] text-[#123524]">
                                                                    Cert: {currencySymbol} {certifiedTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-4 align-top min-w-[210px]">
                                                                <div className="flex items-center justify-between text-[11px] mb-1">
                                                                    <span className="text-[#192631]/70">
                                                                        Cert: <strong className="text-[#192631]">{item.certifiedQty}</strong> / {item.quantity} {item.unit}
                                                                    </span>
                                                                    <span className="font-mono font-bold text-[#e04b2a]">{progressPct.toFixed(0)}%</span>
                                                                </div>
                                                                <div className="w-full h-1.5 bg-[#192631]/[0.05] rounded-full overflow-hidden mb-2">
                                                                    <div
                                                                        className="h-full bg-orange-500 rounded-full transition-all"
                                                                        style={{ width: `${progressPct}%` }}
                                                                    />
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <button
                                                                        onClick={() => {
                                                                            const step = item.unit === 'ls' ? 0.1 : Math.max(1, Math.round(item.quantity * 0.1));
                                                                            const nextCert = Math.min(item.quantity, Number((item.certifiedQty + step).toFixed(2)));
                                                                            handleCertifyBoqQuantity(item, Math.max(item.claimedQty, nextCert), nextCert);
                                                                        }}
                                                                        className="px-2 py-1 rounded bg-[#123524]/10 hover:bg-emerald-500/30 text-[#123524] text-[10px] font-bold"
                                                                    >
                                                                        +10% QS Certify
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleCertifyBoqQuantity(item, item.quantity, item.quantity)}
                                                                        className="px-2 py-1 rounded bg-[#192631]/[0.05] hover:bg-[#192631]/[0.05] text-[#192631]/85 text-[10px] font-bold"
                                                                    >
                                                                        100% Complete
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-4 align-top text-right font-mono">
                                                                <span
                                                                    className={clsx(
                                                                        'px-2 py-0.5 rounded text-[11px] font-black',
                                                                        marginPct >= 15
                                                                            ? 'bg-[#123524]/10 text-[#123524]'
                                                                            : marginPct > 0
                                                                            ? 'bg-amber-500/15 text-[#b45309]'
                                                                            : 'bg-rose-500/15 text-red-700'
                                                                    )}
                                                                >
                                                                    {marginPct.toFixed(1)}% Gross
                                                                </span>
                                                                <p className="text-[10px] text-[#192631]/60 mt-1">
                                                                    Risk σ: {(item.riskDispersion * 100).toFixed(0)}%
                                                                </p>
                                                            </td>
                                                            <td className="py-4 px-4 align-top text-right">
                                                                <button
                                                                    onClick={() => handleDeleteBoqItem(item.id)}
                                                                    className="p-1.5 rounded-lg text-[#192631]/60 hover:text-red-700 hover:bg-rose-500/10"
                                                                    title="Delete BOQ Item"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Automated BOQ-Check Rule Diagnostics */}
                            <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-sm font-black text-[#192631] uppercase tracking-wider flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-[#123524]" />
                                            Automated BOQ Quality & Risk Audit Engine (16-Rule Inspector)
                                        </h3>
                                        <p className="text-xs text-[#192631]/70 mt-0.5">
                                            Continuous static & commercial validation across unit rates, margin thresholds, over-claims, and risk dispersion.
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs font-black bg-[#192631]/[0.05] text-[#192631]/85">
                                        {boqAuditFindings.length} Diagnostic Findings
                                    </span>
                                </div>

                                {boqAuditFindings.length === 0 ? (
                                    <div className="p-4 rounded-xl bg-[#123524]/10 border border-[#123524]/25 text-[#123524] text-xs font-bold flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        All BOQ positions pass arithmetic, margin, and quantity measurement checks.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {boqAuditFindings.map((f, idx) => (
                                            <div
                                                key={idx}
                                                className={clsx(
                                                    'p-4 rounded-xl border text-xs space-y-1',
                                                    f.severity === 'error'
                                                        ? 'bg-rose-500/10 border-rose-500/30 text-red-700'
                                                        : f.severity === 'warning'
                                                        ? 'bg-amber-500/10 border-amber-500/30 text-[#b45309]'
                                                        : 'bg-sky-500/10 border-sky-500/30 text-[#192631]'
                                                )}
                                            >
                                                <div className="flex items-center justify-between font-black">
                                                    <span>
                                                        [{f.ruleId}] Pos {f.itemCode} — {f.title}
                                                    </span>
                                                    <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-[#f5f5f5]/85">
                                                        {f.severity}
                                                    </span>
                                                </div>
                                                <p className="text-[#192631]/85">{f.message}</p>
                                                <p className="text-[11px] text-[#192631]/70 italic">Recommendation: {f.suggestion}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ───────────────── TAB 2: SUBCONTRACTORS & IPC BILLING ───────────────── */}
                    {activeTab === 'subcontractors' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-[#192631]/10">
                                <div>
                                    <h2 className="text-xl font-black text-[#192631] flex items-center gap-2">
                                        <HardHat className="w-5 h-5 text-[#e04b2a]" />
                                        Subcontractor Registry, Payment Applications (IPCs) & Retention Ledger
                                    </h2>
                                    <p className="text-xs text-[#192631]/70 mt-1">
                                        3-Stage QS valuation (Claimed → Certified → Approved), automatic retention deduction, and lien waiver verification gate.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setShowAddSub(!showAddSub)}
                                        className="px-4 py-2.5 rounded-xl bg-[#192631]/[0.05] hover:bg-white/15 text-[#192631] font-black text-xs uppercase tracking-wider flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Register Subcontractor
                                    </button>
                                    <button
                                        onClick={() => setShowAddIpc(!showAddIpc)}
                                        className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2"
                                    >
                                        <FileCheck2 className="w-4 h-4" />
                                        New Payment Application (IPC)
                                    </button>
                                </div>
                            </div>

                            {showAddSub && (
                                <form onSubmit={handleCreateSubcontractor} className="bg-[#181818] border border-[#192631]/10 rounded-2xl p-6 space-y-4">
                                    <h3 className="text-sm font-black text-[#192631] uppercase tracking-wider">Prequalify & Register Subcontractor</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Legal Entity Name</label>
                                            <input
                                                value={subName}
                                                onChange={e => setSubName(e.target.value)}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                                placeholder="Apex MEP & Fire Engineering LLC"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Trade Categories (comma separated)</label>
                                            <input
                                                value={subTrades}
                                                onChange={e => setSubTrades(e.target.value)}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                                placeholder="MEP, HVAC, Chilled Water"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Primary Contact</label>
                                            <input
                                                value={subContact}
                                                onChange={e => setSubContact(e.target.value)}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                                placeholder="Eng. Mahmoud Saleh"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Email</label>
                                            <input
                                                value={subEmail}
                                                onChange={e => setSubEmail(e.target.value)}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                                placeholder="contracts@subcontractor.ae"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Prequalification Score (0–100)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={subPrequalScore}
                                                onChange={e => setSubPrequalScore(Number(e.target.value))}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Insurance Expiry Date</label>
                                            <input
                                                type="date"
                                                value={subInsuranceExpiry}
                                                onChange={e => setSubInsuranceExpiry(e.target.value)}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <label className="flex items-center gap-2 text-xs text-[#192631]/85">
                                            <input
                                                type="checkbox"
                                                checked={subLienWaiver}
                                                onChange={e => setSubLienWaiver(e.target.checked)}
                                            />
                                            Require signed Lien Waiver before Finance IPC release
                                        </label>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setShowAddSub(false)} className="px-4 py-2 rounded-xl bg-[#192631]/[0.05] text-xs font-bold text-[#192631]/70">
                                                Cancel
                                            </button>
                                            <button type="submit" className="px-5 py-2 rounded-xl bg-orange-500 text-black text-xs font-black uppercase">
                                                Save Subcontractor
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {showAddIpc && (
                                <form onSubmit={handleCreateIpc} className="bg-[#181818] border border-[#e04b2a]/25 rounded-2xl p-6 space-y-4">
                                    <h3 className="text-sm font-black text-[#192631] uppercase tracking-wider">Create Subcontractor Payment Application (IPC / RA Bill)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Subcontractor</label>
                                            <select
                                                value={ipcSubId}
                                                onChange={e => setIpcSubId(e.target.value)}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            >
                                                <option value="">Select Subcontractor...</option>
                                                {subcontractors.map(s => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.legalName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">IPC Application #</label>
                                            <input
                                                value={ipcNumber}
                                                onChange={e => setIpcNumber(e.target.value)}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Work Package Scope</label>
                                            <input
                                                value={ipcPackage}
                                                onChange={e => setIpcPackage(e.target.value)}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Subcontract Value ({currencySymbol})</label>
                                            <input
                                                type="number"
                                                value={ipcContractVal}
                                                onChange={e => setIpcContractVal(Number(e.target.value))}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Claimed Gross ({currencySymbol})</label>
                                            <input
                                                type="number"
                                                value={ipcClaimedGross}
                                                onChange={e => setIpcClaimedGross(Number(e.target.value))}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">QS Certified Gross ({currencySymbol})</label>
                                            <input
                                                type="number"
                                                value={ipcCertifiedGross}
                                                onChange={e => setIpcCertifiedGross(Number(e.target.value))}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Retention %</label>
                                            <input
                                                type="number"
                                                value={ipcRetentionPct}
                                                onChange={e => setIpcRetentionPct(Number(e.target.value))}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button type="button" onClick={() => setShowAddIpc(false)} className="px-4 py-2 rounded-xl bg-[#192631]/[0.05] text-xs font-bold text-[#192631]/70">
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-5 py-2 rounded-xl bg-orange-500 text-black text-xs font-black uppercase">
                                            Submit IPC Application
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Subcontractors Directory */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {subcontractors.map(sub => (
                                    <div key={sub.id} className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl p-5 flex items-start justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-[#e04b2a]" />
                                                <h4 className="font-black text-[#192631] text-sm">{sub.legalName}</h4>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#123524]/10 text-[#123524]">
                                                    {sub.prequalificationStatus} ({sub.prequalScore}/100)
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {sub.tradeCategories.map((t, i) => (
                                                    <span key={i} className="px-2 py-0.5 rounded bg-[#192631]/[0.05] text-[10px] font-bold text-[#192631]/85">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-xs text-[#192631]/70">
                                                {sub.contactName} · {sub.email} · Insurance Valid Until: <strong className="text-[#192631]">{sub.insuranceExpiryDate}</strong>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-black text-[#b45309]">★ {sub.ratingScore.toFixed(1)}</span>
                                            {sub.requiresLienWaiver && (
                                                <p className="text-[10px] text-[#e04b2a] font-bold uppercase mt-1">Lien Waiver Gate Active</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* IPC Payment Applications Table */}
                            <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl overflow-hidden">
                                <div className="p-4 border-b border-[#192631]/10 flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-[#192631]/85">
                                        Interim Payment Certificates (IPCs) & Retention Ledger
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-[#192631]/10 text-[10px] font-black uppercase tracking-widest text-[#192631]/60 bg-[#f5f5f5]/85">
                                                <th className="py-3.5 px-4">IPC # / Subcontractor</th>
                                                <th className="py-3.5 px-4">Work Package</th>
                                                <th className="py-3.5 px-4 text-right">Claimed vs QS Certified</th>
                                                <th className="py-3.5 px-4 text-right">Retention Held</th>
                                                <th className="py-3.5 px-4 text-right">Net Payable</th>
                                                <th className="py-3.5 px-4">Lien Waiver & Status</th>
                                                <th className="py-3.5 px-4 text-right">Approval Workflow</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#192631]/10 text-xs">
                                            {filteredIpcs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="py-10 text-center text-[#192631]/60">
                                                        No Subcontractor Payment Applications recorded yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredIpcs.map(ipc => (
                                                    <tr key={ipc.id} className="hover:bg-white/[0.02]">
                                                        <td className="py-4 px-4">
                                                            <span className="font-mono font-black text-[#e04b2a]">{ipc.applicationNumber}</span>
                                                            <p className="font-bold text-[#192631] mt-0.5">{ipc.subcontractorName}</p>
                                                        </td>
                                                        <td className="py-4 px-4 text-[#192631]/85">
                                                            {ipc.workPackageName}
                                                            <p className="text-[10px] text-[#192631]/60 font-mono">
                                                                Contract: {currencySymbol} {ipc.contractValue.toLocaleString()}
                                                            </p>
                                                        </td>
                                                        <td className="py-4 px-4 text-right font-mono">
                                                            <div className="text-[#192631]/70 text-[11px]">
                                                                Claimed: {currencySymbol} {ipc.claimedGross.toLocaleString()}
                                                            </div>
                                                            <div className="font-black text-[#192631]">
                                                                QS Cert: {currencySymbol} {ipc.certifiedGross.toLocaleString()}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 text-right font-mono">
                                                            <div className="text-[#b45309] font-bold">
                                                                {currencySymbol} {ipc.retentionHeld.toLocaleString()} ({ipc.retentionPercent}%)
                                                            </div>
                                                            {ipc.retentionReleased > 0 && (
                                                                <div className="text-[10px] text-[#123524]">
                                                                    Released: {currencySymbol} {ipc.retentionReleased.toLocaleString()}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-4 text-right font-mono font-black text-[#123524]">
                                                            {currencySymbol} {ipc.netPayable.toLocaleString()}
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <div className="flex flex-col gap-1">
                                                                <span
                                                                    className={clsx(
                                                                        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase w-fit',
                                                                        ipc.status === 'paid'
                                                                            ? 'bg-[#123524]/10 text-[#123524]'
                                                                            : ipc.status === 'finance_approved'
                                                                            ? 'bg-sky-500/20 text-[#192631]'
                                                                            : 'bg-amber-500/20 text-[#b45309]'
                                                                    )}
                                                                >
                                                                    {ipc.status.replace('_', ' ')}
                                                                </span>
                                                                <span className="text-[10px] text-[#192631]/70">
                                                                    Lien Waiver: {ipc.lienWaiverSigned ? '✅ Signed' : '⚠️ Pending'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 text-right">
                                                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                                {ipc.status === 'submitted' && (
                                                                    <button
                                                                        onClick={() => handleAdvanceIpcStatus(ipc, 'qs_certified')}
                                                                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-[#b45309] text-[10px] font-black uppercase"
                                                                    >
                                                                        QS Certify
                                                                    </button>
                                                                )}
                                                                {ipc.status === 'qs_certified' && (
                                                                    <button
                                                                        onClick={() => handleAdvanceIpcStatus(ipc, 'finance_approved', true)}
                                                                        className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-[#192631] text-[10px] font-black uppercase"
                                                                    >
                                                                        Sign Waiver & Finance Approve
                                                                    </button>
                                                                )}
                                                                {ipc.status === 'finance_approved' && (
                                                                    <button
                                                                        onClick={() => handleAdvanceIpcStatus(ipc, 'paid', true)}
                                                                        className="px-2.5 py-1 rounded-lg bg-[#123524]/10 hover:bg-emerald-500/30 text-[#123524] text-[10px] font-black uppercase"
                                                                    >
                                                                        Mark Paid
                                                                    </button>
                                                                )}
                                                                {ipc.retentionHeld > 0 && (
                                                                    <button
                                                                        onClick={() => handleReleaseRetention(ipc)}
                                                                        className="px-2.5 py-1 rounded-lg bg-[#192631]/[0.05] hover:bg-[#192631]/[0.05] text-[#192631]/85 text-[10px] font-bold"
                                                                    >
                                                                        Release Retention
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ───────────────── TAB 3: VARIATION ORDERS (CHANGE ORDERS) ───────────────── */}
                    {activeTab === 'variations' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-[#192631]/10">
                                <div>
                                    <h2 className="text-xl font-black text-[#192631] flex items-center gap-2">
                                        <FileDiff className="w-5 h-5 text-[#e04b2a]" />
                                        Variation Orders & Multi-Step Approval Chain
                                    </h2>
                                    <p className="text-xs text-[#192631]/70 mt-1">
                                        FIDIC-compliant Change Order control: Contractor Claimed vs. Engineer Assessed vs. Approved Cost & Time Extension (EOT).
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowAddVo(!showAddVo)}
                                    className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Raise Variation Order
                                </button>
                            </div>

                            {showAddVo && (
                                <form onSubmit={handleCreateVo} className="bg-[#181818] border border-[#e04b2a]/25 rounded-2xl p-6 space-y-4">
                                    <h3 className="text-sm font-black text-[#192631] uppercase tracking-wider">Raise Variation Order (VO)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">VO Reference Code</label>
                                            <input
                                                value={voCode}
                                                onChange={e => setVoCode(e.target.value)}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Variation Title</label>
                                            <input
                                                value={voTitle}
                                                onChange={e => setVoTitle(e.target.value)}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                                placeholder="Additional Basement Dewatering & Secant Pile Shoring"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Reason Category</label>
                                            <select
                                                value={voReason}
                                                onChange={e => setVoReason(e.target.value as VariationOrder['reasonCategory'])}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            >
                                                <option value="client_request">Client Instruction / Request</option>
                                                <option value="design_change">Consultant Design Change</option>
                                                <option value="site_condition">Unforeseen Ground / Site Condition</option>
                                                <option value="value_engineering">Value Engineering Saving</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Contractor Claimed ({currencySymbol})</label>
                                            <input
                                                type="number"
                                                value={voContractorAmt}
                                                onChange={e => setVoContractorAmt(Number(e.target.value))}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Engineer Assessed ({currencySymbol})</label>
                                            <input
                                                type="number"
                                                value={voEngineerAmt}
                                                onChange={e => setVoEngineerAmt(Number(e.target.value))}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Time Impact (EOT Days)</label>
                                            <input
                                                type="number"
                                                value={voDays}
                                                onChange={e => setVoDays(Number(e.target.value))}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Ball In Court</label>
                                            <input
                                                value={voBallInCourt}
                                                onChange={e => setVoBallInCourt(e.target.value)}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-[#192631]/70">Detailed Scope & Justification</label>
                                        <input
                                            value={voDesc}
                                            onChange={e => setVoDesc(e.target.value)}
                                            className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            placeholder="Reference drawing revisions and site instruction number..."
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => setShowAddVo(false)} className="px-4 py-2 rounded-xl bg-[#192631]/[0.05] text-xs font-bold text-[#192631]/70">
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-5 py-2 rounded-xl bg-orange-500 text-black text-xs font-black uppercase">
                                            Submit Variation Order
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="grid grid-cols-1 gap-4">
                                {filteredVos.length === 0 ? (
                                    <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl p-10 text-center text-[#192631]/60 text-xs">
                                        No Variation Orders recorded yet.
                                    </div>
                                ) : (
                                    filteredVos.map(vo => (
                                        <div key={vo.id} className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                            <div className="space-y-2 max-w-2xl">
                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    <span className="font-mono font-black text-sm text-[#e04b2a] bg-[#e04b2a]/10 px-2.5 py-1 rounded-lg border border-[#e04b2a]/25">
                                                        {vo.code}
                                                    </span>
                                                    <h3 className="text-base font-black text-[#192631]">{vo.title}</h3>
                                                    <span
                                                        className={clsx(
                                                            'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase',
                                                            vo.status === 'approved'
                                                                ? 'bg-[#123524]/10 text-[#123524]'
                                                                : 'bg-amber-500/20 text-[#b45309]'
                                                        )}
                                                    >
                                                        {vo.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-[#192631]/70">{vo.description}</p>
                                                <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#192631]/70 pt-1">
                                                    <span>
                                                        Reason: <strong className="text-[#192631] uppercase">{vo.reasonCategory.replace('_', ' ')}</strong>
                                                    </span>
                                                    <span>
                                                        Ball in Court: <strong className="text-[#e04b2a]">{vo.ballInCourt}</strong>
                                                    </span>
                                                    <span>
                                                        EOT Schedule Impact: <strong className="text-[#192631]">+{vo.scheduleImpactDays} Days</strong>
                                                    </span>
                                                </div>

                                                {/* 3-Step Approval Chain Bar */}
                                                <div className="flex items-center gap-2 pt-2">
                                                    {[
                                                        { step: 1, label: '1. Technical Review' },
                                                        { step: 2, label: '2. Commercial QS' },
                                                        { step: 3, label: '3. Client Sign-Off' },
                                                    ].map(s => {
                                                        const done = vo.status === 'approved' || vo.currentApprovalStep > s.step;
                                                        const current = vo.status !== 'approved' && vo.currentApprovalStep === s.step;
                                                        return (
                                                            <div
                                                                key={s.step}
                                                                className={clsx(
                                                                    'px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 border',
                                                                    done
                                                                        ? 'bg-[#123524]/10 border-[#123524]/25 text-[#123524]'
                                                                        : current
                                                                        ? 'bg-[#e04b2a]/10 border-[#e04b2a]/25 text-[#e04b2a]'
                                                                        : 'bg-[#192631]/[0.05] border-[#192631]/10 text-[#192631]/60'
                                                                )}
                                                            >
                                                                {done && <Check className="w-3 h-3" />}
                                                                {s.label}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 border-[#192631]/10 pt-4 lg:pt-0">
                                                <div className="text-left lg:text-right font-mono">
                                                    <div className="text-[11px] text-[#192631]/70">
                                                        Claimed: {currencySymbol} {vo.contractorAmount.toLocaleString()}
                                                    </div>
                                                    <div className="text-lg font-black text-[#123524]">
                                                        Assessed: {currencySymbol} {vo.engineerAssessedAmount.toLocaleString()}
                                                    </div>
                                                </div>

                                                {vo.status !== 'approved' && (
                                                    <button
                                                        onClick={() => handleAdvanceVoApproval(vo)}
                                                        className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2"
                                                    >
                                                        Approve Step {vo.currentApprovalStep}
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* ───────────────── TAB 4: TECHNICAL RFIs & 1-CLICK VO ESCALATION ───────────────── */}
                    {activeTab === 'rfis' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-[#192631]/10">
                                <div>
                                    <h2 className="text-xl font-black text-[#192631] flex items-center gap-2">
                                        <MessageSquareWarning className="w-5 h-5 text-[#e04b2a]" />
                                        Requests for Information (RFI) & Design Clash Register
                                    </h2>
                                    <p className="text-xs text-[#192631]/70 mt-1">
                                        Track technical queries by discipline, ball-in-court ownership, cost/schedule impact, and escalate RFIs directly into Variation Orders.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowAddRfi(!showAddRfi)}
                                    className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Log Technical RFI
                                </button>
                            </div>

                            {showAddRfi && (
                                <form onSubmit={handleCreateRfi} className="bg-[#181818] border border-[#e04b2a]/25 rounded-2xl p-6 space-y-4">
                                    <h3 className="text-sm font-black text-[#192631] uppercase tracking-wider">New Technical RFI</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">RFI Number</label>
                                            <input
                                                value={rfiNumber}
                                                onChange={e => setRfiNumber(e.target.value)}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Discipline</label>
                                            <select
                                                value={rfiDiscipline}
                                                onChange={e => setRfiDiscipline(e.target.value as ContractingRFI['discipline'])}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            >
                                                <option value="Structural">Structural</option>
                                                <option value="Architectural">Architectural</option>
                                                <option value="MEP">MEP</option>
                                                <option value="Civil">Civil</option>
                                                <option value="Geotechnical">Geotechnical</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Priority</label>
                                            <select
                                                value={rfiPriority}
                                                onChange={e => setRfiPriority(e.target.value as ContractingRFI['priority'])}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            >
                                                <option value="low">Low</option>
                                                <option value="normal">Normal</option>
                                                <option value="high">High</option>
                                                <option value="critical">Critical</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Ball In Court</label>
                                            <input
                                                value={rfiBallInCourt}
                                                onChange={e => setRfiBallInCourt(e.target.value)}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-[#192631]/70">Subject</label>
                                        <input
                                            value={rfiSubject}
                                            onChange={e => setRfiSubject(e.target.value)}
                                            className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            placeholder="Clash between structural transfer beam and chilled water riser..."
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-[#192631]/70">Technical Question / Proposed Solution</label>
                                        <input
                                            value={rfiQuestion}
                                            onChange={e => setRfiQuestion(e.target.value)}
                                            className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Estimated Cost Impact ({currencySymbol})</label>
                                            <input
                                                type="number"
                                                value={rfiCostEst}
                                                onChange={e => setRfiCostEst(Number(e.target.value))}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-[#192631]/70">Estimated Schedule Impact (Days)</label>
                                            <input
                                                type="number"
                                                value={rfiSchedDays}
                                                onChange={e => setRfiSchedDays(Number(e.target.value))}
                                                className="w-full mt-1 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-xs text-[#192631]"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => setShowAddRfi(false)} className="px-4 py-2 rounded-xl bg-[#192631]/[0.05] text-xs font-bold text-[#192631]/70">
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-5 py-2 rounded-xl bg-orange-500 text-black text-xs font-black uppercase">
                                            Submit RFI
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="grid grid-cols-1 gap-4">
                                {filteredRfis.length === 0 ? (
                                    <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl p-10 text-center text-[#192631]/60 text-xs">
                                        No RFIs logged yet.
                                    </div>
                                ) : (
                                    filteredRfis.map(rfi => (
                                        <div key={rfi.id} className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                            <div className="space-y-2 max-w-2xl">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-mono font-black text-xs text-[#e04b2a] bg-[#e04b2a]/10 px-2.5 py-1 rounded-lg">
                                                        {rfi.rfiNumber}
                                                    </span>
                                                    <span className="px-2.5 py-0.5 rounded bg-[#192631]/[0.05] text-[10px] font-black uppercase text-[#192631]">
                                                        {rfi.discipline}
                                                    </span>
                                                    <span
                                                        className={clsx(
                                                            'px-2 py-0.5 rounded text-[10px] font-black uppercase',
                                                            rfi.priority === 'critical'
                                                                ? 'bg-rose-500/20 text-red-700'
                                                                : 'bg-amber-500/20 text-[#b45309]'
                                                        )}
                                                    >
                                                        {rfi.priority}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded bg-[#123524]/10 text-[#123524] text-[10px] font-black uppercase">
                                                        {rfi.status.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                <h3 className="text-base font-black text-[#192631]">{rfi.subject}</h3>
                                                <p className="text-xs text-[#192631]/85">{rfi.question}</p>
                                                {rfi.officialResponse && (
                                                    <div className="p-3 rounded-xl bg-[#123524]/10 border border-[#123524]/25 text-xs text-[#123524]">
                                                        <strong>Consultant Response:</strong> {rfi.officialResponse}
                                                    </div>
                                                )}
                                                <div className="flex flex-wrap gap-4 text-[11px] text-[#192631]/70 pt-1">
                                                    <span>
                                                        Ball in Court: <strong className="text-[#e04b2a]">{rfi.ballInCourt}</strong>
                                                    </span>
                                                    <span>
                                                        Est. Cost Impact:{' '}
                                                        <strong className="text-[#192631]">
                                                            {currencySymbol} {rfi.costImpactEstimate.toLocaleString()}
                                                        </strong>
                                                    </span>
                                                    <span>
                                                        Schedule Impact: <strong className="text-[#192631]">+{rfi.scheduleImpactDays} Days</strong>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                {rfi.status !== 'converted_to_vo' ? (
                                                    <button
                                                        onClick={() => handleConvertRfiToVo(rfi)}
                                                        className="px-4 py-2.5 rounded-xl bg-[#e04b2a]/10 hover:bg-orange-500 border border-[#e04b2a]/25 text-[#e04b2a] hover:text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
                                                    >
                                                        <FileDiff className="w-4 h-4" />
                                                        Convert RFI to Variation Order
                                                    </button>
                                                ) : (
                                                    <span className="px-3 py-1.5 rounded-xl bg-[#123524]/10 border border-[#123524]/25 text-[#123524] text-xs font-black">
                                                        ✓ Linked to Variation Order
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* ───────────────── TAB 5: 5D EVM & COST-VALUE RECONCILIATION (CVR) ───────────────── */}
                    {activeTab === 'evm' && (
                        <div className="space-y-6">
                            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-[#192631]/10">
                                <h2 className="text-xl font-black text-[#192631] flex items-center gap-2">
                                    <Scale className="w-5 h-5 text-[#e04b2a]" />
                                    5D Earned Value Management (EVM) & Monthly Cost-Value Reconciliation (CVR)
                                </h2>
                                <p className="text-xs text-[#192631]/70 mt-1">
                                    Reconciles Baseline BOQ + Approved Variations (BAC) against QS Certified Earned Value (EV), Subcontractor IPCs, and Engineer Timesheet Costs (AC).
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl p-6 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black uppercase tracking-wider text-[#192631]/70">Cost Performance Index (CPI)</span>
                                        <DollarSign className="w-4 h-4 text-[#123524]" />
                                    </div>
                                    <p className={clsx('text-4xl font-black font-mono', evmMetrics.cpi >= 1 ? 'text-[#123524]' : 'text-red-700')}>
                                        {evmMetrics.cpi.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-[#192631]/70">
                                        {evmMetrics.cpi >= 1
                                            ? 'Project is earning more certified value per unit of actual cost spent (Under Budget).'
                                            : 'Actual costs exceed certified earned value (Cost Overrun Risk).'}
                                    </p>
                                </div>

                                <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl p-6 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black uppercase tracking-wider text-[#192631]/70">Schedule Performance Index (SPI)</span>
                                        <Clock className="w-4 h-4 text-[#e04b2a]" />
                                    </div>
                                    <p className={clsx('text-4xl font-black font-mono', evmMetrics.spi >= 0.95 ? 'text-[#123524]' : 'text-[#b45309]')}>
                                        {evmMetrics.spi.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-[#192631]/70">
                                        Ratio of Certified Earned Value (EV) to Baseline Planned Value (PV).
                                    </p>
                                </div>

                                <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl p-6 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black uppercase tracking-wider text-[#192631]/70">Estimate at Completion (EAC)</span>
                                        <TrendingUp className="w-4 h-4 text-[#192631]" />
                                    </div>
                                    <p className="text-3xl font-black font-mono text-[#192631]">
                                        {currencySymbol} {evmMetrics.eac.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-xs text-[#192631]/70">
                                        Variance at Completion (VAC):{' '}
                                        <strong className={evmMetrics.vac >= 0 ? 'text-[#123524]' : 'text-red-700'}>
                                            {currencySymbol} {evmMetrics.vac.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </strong>{' '}
                                        · TCPI: <strong>{evmMetrics.tcpi.toFixed(2)}</strong>
                                    </p>
                                </div>
                            </div>

                            {/* Detailed CVR Breakdown Table */}
                            <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl p-6 space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#192631]/85">
                                    Commercial Cost-Value Reconciliation (CVR) Ledger
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3 bg-[#f5f5f5]/85 p-5 rounded-xl border border-[#192631]/10">
                                        <h4 className="text-xs font-black uppercase text-[#123524]">Revenue & Certified Value (Inflow)</h4>
                                        <div className="flex justify-between text-xs py-1.5 border-b border-[#192631]/10">
                                            <span className="text-[#192631]/70">Original Baseline BOQ Sum</span>
                                            <span className="font-mono font-bold text-[#192631]">
                                                {currencySymbol} {evmMetrics.boqBaselineContract.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs py-1.5 border-b border-[#192631]/10">
                                            <span className="text-[#192631]/70">Approved Variation Orders (VO)</span>
                                            <span className="font-mono font-bold text-[#123524]">
                                                +{currencySymbol} {evmMetrics.approvedVoValue.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs py-1.5 border-b border-[#192631]/10">
                                            <span className="text-[#192631]/70">Revised Contract Budget (BAC)</span>
                                            <span className="font-mono font-black text-[#192631]">
                                                {currencySymbol} {evmMetrics.revisedBac.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs py-1.5">
                                            <span className="text-[#192631]/85 font-bold">Cumulative Earned Value (EV)</span>
                                            <span className="font-mono font-black text-[#e04b2a]">
                                                {currencySymbol} {evmMetrics.earnedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 bg-[#f5f5f5]/85 p-5 rounded-xl border border-[#192631]/10">
                                        <h4 className="text-xs font-black uppercase text-[#b45309]">Committed & Actual Costs (Outflow)</h4>
                                        <div className="flex justify-between text-xs py-1.5 border-b border-[#192631]/10">
                                            <span className="text-[#192631]/70">Subcontractor QS Certified IPCs</span>
                                            <span className="font-mono font-bold text-[#192631]">
                                                {currencySymbol} {evmMetrics.subCertifiedTotal.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs py-1.5 border-b border-[#192631]/10">
                                            <span className="text-[#192631]/70">Engineering & Design Timesheet Cost</span>
                                            <span className="font-mono font-bold text-[#192631]">
                                                {currencySymbol} {evmMetrics.timesheetCost.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs py-1.5 border-b border-[#192631]/10">
                                            <span className="text-[#192631]/70">Subcontractor Retention Held (Liability)</span>
                                            <span className="font-mono font-bold text-[#b45309]">
                                                {currencySymbol} {evmMetrics.totalRetentionHeld.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs py-1.5">
                                            <span className="text-[#192631]/85 font-bold">Total Actual Cost (AC)</span>
                                            <span className="font-mono font-black text-[#192631]">
                                                {currencySymbol} {evmMetrics.actualCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
