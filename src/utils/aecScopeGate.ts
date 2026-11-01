import type { Milestone, Project, PaymentApplication, VariationOrder } from '../types';

export interface FiveGateEvaluation {
    canStartProject: boolean;
    preContractMissingDocs: string[];
    stageUnlockMap: Record<string, {
        canUnlockNextStage: boolean;
        reason?: string;
        isFrozenByVo: boolean;
        pendingVoCount: number;
        overRevisionQuota: boolean;
        currentRevisions: number;
        maxRevisions: number;
    }>;
    canReleaseFinalIfcPackage: boolean;
    finalReleaseBlockReasons: string[];
}

/**
 * Pure 5-Gate AEC Scope-Creep & Phase-Lock Evaluator
 * (Transplanted & adapted from MitrixoGYM's 4-Doc Pre-Course Gate & Freeze Engine)
 *
 * Gate 1: Pre-Contract 4-Doc Gate (Proposal Signed + Authority NOC + Retainer Paid + Site Survey)
 * Gate 2: Phase-Lock Gate (Stage N+1 cannot unlock until Stage N is Client Approved AND IPC Paid)
 * Gate 3: Revision Quota Gate (When revisionCount >= maxRevisions, stage is frozen until VO is approved)
 * Gate 4: Auto-VO Freeze Gate (Any pending VariationOrder on the project freezes stage progression)
 * Gate 5: Final IFC Release Gate (100% milestones approved, 0 pending VOs, all IPCs settled)
 */
export function evaluateAecFiveGate(
    project: Project,
    milestones: Milestone[],
    ipcs: PaymentApplication[],
    variationOrders: VariationOrder[]
): FiveGateEvaluation {
    // Gate 1: 4-Document Pre-Contract Gate
    const preContractMissingDocs: string[] = [];
    if (project.proposalSigned === false) preContractMissingDocs.push('Signed RIBA Fee Proposal');
    if (project.authorityNocUploaded === false) preContractMissingDocs.push('Municipality / Authority NOC');
    if (project.retainerPaid === false) preContractMissingDocs.push('Advance Retainer Payment Receipt');
    if (project.siteSurveyUploaded === false) preContractMissingDocs.push('Site Survey & GIS Boundaries');

    const canStartProject = preContractMissingDocs.length === 0;

    // Project-scoped VOs & IPCs
    const projectVos = variationOrders.filter(v => v.projectId === project.id);
    const pendingVos = projectVos.filter(v => v.status !== 'approved' && v.status !== 'rejected');
    const projectIpcs = ipcs.filter(i => i.projectId === project.id);

    const stageUnlockMap: FiveGateEvaluation['stageUnlockMap'] = {};

    const orderedMilestones = [...milestones]
        .filter(m => m.projectId === project.id)
        .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));

    orderedMilestones.forEach((m, idx) => {
        const maxRevisions = m.maxRevisions ?? project.allowedRevisionRounds ?? 2;
        const currentRevisions = m.revisionCount ?? 0;
        const overRevisionQuota = currentRevisions > maxRevisions;
        const isFrozenByVo = Boolean(m.isFrozenByVo) || pendingVos.length > 0 || overRevisionQuota;

        // Check previous stage completion for Stage N+1 unlock
        let canUnlockNextStage = true;
        let reason: string | undefined;

        if (!canStartProject) {
            canUnlockNextStage = false;
            reason = `Blocked by Pre-Contract Gate (${preContractMissingDocs.join(', ')})`;
        } else if (isFrozenByVo) {
            canUnlockNextStage = false;
            reason = overRevisionQuota
                ? `Revision quota exceeded (${currentRevisions}/${maxRevisions}) — Client Variation Order approval required`
                : `Stage frozen by ${pendingVos.length} pending Variation Order(s)`;
        } else if (idx > 0) {
            const prev = orderedMilestones[idx - 1];
            const prevApproved = prev.clientStatus === 'approved' && prev.completedPercentage >= 100;
            const prevIpcPaid = prev.ipcPaid !== false;
            if (!prevApproved) {
                canUnlockNextStage = false;
                reason = `Previous stage "${prev.name}" awaits 100% completion & Client Sign-Off`;
            } else if (!prevIpcPaid) {
                canUnlockNextStage = false;
                reason = `Previous stage "${prev.name}" IPC invoice is not yet settled`;
            }
        }

        stageUnlockMap[m.id] = {
            canUnlockNextStage,
            reason,
            isFrozenByVo,
            pendingVoCount: pendingVos.length,
            overRevisionQuota,
            currentRevisions,
            maxRevisions,
        };
    });

    // Gate 5: Final IFC Drawing Package Release Gate
    const finalReleaseBlockReasons: string[] = [];
    if (!canStartProject) {
        finalReleaseBlockReasons.push('Pre-Contract 4-Document Gate incomplete');
    }
    if (orderedMilestones.length === 0) {
        finalReleaseBlockReasons.push('No RIBA / Construction stages defined');
    } else {
        const unapprovedStages = orderedMilestones.filter(m => m.clientStatus !== 'approved' || m.completedPercentage < 100);
        if (unapprovedStages.length > 0) {
            finalReleaseBlockReasons.push(`${unapprovedStages.length} stage(s) pending 100% Client Approval`);
        }
    }
    if (pendingVos.length > 0) {
        finalReleaseBlockReasons.push(`${pendingVos.length} pending Variation Order(s) awaiting commercial sign-off`);
    }
    const unpaidIpcs = projectIpcs.filter(i => i.status !== 'paid');
    if (unpaidIpcs.length > 0) {
        finalReleaseBlockReasons.push(`${unpaidIpcs.length} unpaid IPC certificate(s) outstanding`);
    }

    return {
        canStartProject,
        preContractMissingDocs,
        stageUnlockMap,
        canReleaseFinalIfcPackage: finalReleaseBlockReasons.length === 0,
        finalReleaseBlockReasons,
    };
}

/**
 * Generates an automatic Variation Order when a client requests a revision beyond the contractual quota,
 * or converts a high-impact RFI into a Variation Order.
 */
export function buildAutoVariationOrder(params: {
    project: Project;
    milestone?: Milestone;
    existingVoCount: number;
    estimatedHours: number;
    hourlyRate?: number;
    scheduleImpactDays?: number;
    reasonTitle?: string;
    linkedRfiId?: string;
}): VariationOrder {
    const rate = params.hourlyRate || params.project.hourlyRate || 125;
    const costImpact = Math.round(params.estimatedHours * rate);
    const nextNum = params.existingVoCount + 1;
    const voCode = `VO-${String(nextNum).padStart(3, '0')}`;

    const stageLabel = params.milestone ? `${params.milestone.name}` : 'General Scope';
    const currentRev = (params.milestone?.revisionCount ?? 2) + 1;
    const maxRev = params.milestone?.maxRevisions ?? params.project.allowedRevisionRounds ?? 2;

    return {
        id: `vo-auto-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        organizationId: params.project.organizationId || 'org-default',
        projectId: params.project.id,
        code: voCode,
        title: params.reasonTitle || `Scope Revision #${currentRev} (Exceeds ${maxRev} Included Rounds) — ${stageLabel}`,
        description: `Automated 5-Gate Scope-Creep Protection: Client revision request #${currentRev} on "${stageLabel}" exceeds contractual allowance of ${maxRev} rounds. Includes ${params.estimatedHours} engineering hours @ ${rate}/hr.`,
        reasonCategory: 'client_request',
        status: 'submitted',
        contractorAmount: costImpact,
        engineerAssessedAmount: costImpact,
        approvedAmount: costImpact,
        scheduleImpactDays: params.scheduleImpactDays ?? Math.max(2, Math.ceil(params.estimatedHours / 6)),
        approvedTimeDays: params.scheduleImpactDays ?? Math.max(2, Math.ceil(params.estimatedHours / 6)),
        ballInCourt: 'Client Commercial Representative',
        currentApprovalStep: 2,
        linkedRfiId: params.linkedRfiId,
        createdAt: new Date().toISOString(),
    };
}

/**
 * Validates whether an Admin Override on a locked baseline targetDate is allowed.
 * Mirrors MitrixoGYM's admin date override audit trail requirement.
 */
export function validateBaselineDateOverride(
    role: string | null,
    overrideReason: string,
    oldDate: string | undefined,
    newDate: string
): { valid: boolean; error?: string; auditPayload?: Record<string, any> } {
    if (role !== 'admin') {
        return { valid: false, error: 'Only Admin Partners can override baseline stage target dates.' };
    }
    const trimmed = (overrideReason || '').trim();
    if (trimmed.length < 5) {
        return { valid: false, error: 'Audit trail requires a justification of at least 5 characters.' };
    }
    if (!newDate) {
        return { valid: false, error: 'New target date is required.' };
    }
    return {
        valid: true,
        auditPayload: {
            previousTargetDate: oldDate || 'unset',
            newTargetDate: newDate,
            overrideJustification: trimmed,
            overriddenAt: new Date().toISOString(),
        },
    };
}
