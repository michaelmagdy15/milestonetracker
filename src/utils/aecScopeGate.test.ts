import { evaluateAecFiveGate, buildAutoVariationOrder, validateBaselineDateOverride } from './aecScopeGate';
import type { Project, Milestone, PaymentApplication, VariationOrder } from '../types';

function assert(condition: unknown, message?: string): asserts condition {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

assert.equal = function <T>(actual: T, expected: T, message?: string) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${String(expected)}, got ${String(actual)}`);
    }
};

// ─── Test Suite for 5-Gate AEC Scope-Creep & Phase-Lock Engine ───

function runTests() {
    let passed = 0;

    // 1. Pre-Contract 4-Document Gate blocks project start when documents are missing
    {
        const project: Project = {
            id: 'proj-1',
            name: 'Zayed Tower',
            hourlyRate: 150,
            proposalSigned: true,
            authorityNocUploaded: false,
            retainerPaid: true,
            siteSurveyUploaded: false,
        };
        const evalResult = evaluateAecFiveGate(project, [], [], []);
        assert.equal(evalResult.canStartProject, false, 'Should block project start when NOC & Site Survey are false');
        assert.equal(evalResult.preContractMissingDocs.length, 2, 'Should report 2 missing pre-contract docs');
        passed++;
    }

    // 2. Pre-Contract Gate passes when all 4 documents are verified
    {
        const project: Project = {
            id: 'proj-2',
            name: 'Corniche Mixed-Use',
            hourlyRate: 150,
            proposalSigned: true,
            authorityNocUploaded: true,
            retainerPaid: true,
            siteSurveyUploaded: true,
        };
        const evalResult = evaluateAecFiveGate(project, [], [], []);
        assert.equal(evalResult.canStartProject, true, 'Should allow project start when all 4 docs are verified');
        assert.equal(evalResult.preContractMissingDocs.length, 0);
        passed++;
    }

    // 3. Stage N+1 Lock: Stage 2 cannot unlock if Stage 1 is not approved or IPC is unpaid
    {
        const project: Project = {
            id: 'proj-3',
            name: 'New Cairo HQ',
            hourlyRate: 120,
            proposalSigned: true,
            authorityNocUploaded: true,
            retainerPaid: true,
            siteSurveyUploaded: true,
        };
        const milestones: Milestone[] = [
            {
                id: 'm-1',
                projectId: 'proj-3',
                name: 'RIBA Stage 2: Concept Design',
                completedPercentage: 100,
                clientStatus: 'pending', // Not yet client approved!
                ipcPaid: true,
                createdAt: '2026-01-01T00:00:00Z',
            },
            {
                id: 'm-2',
                projectId: 'proj-3',
                name: 'RIBA Stage 3: Spatial Coordination',
                completedPercentage: 0,
                clientStatus: 'pending',
                ipcPaid: false,
                createdAt: '2026-02-01T00:00:00Z',
            },
        ];

        const eval1 = evaluateAecFiveGate(project, milestones, [], []);
        assert.equal(eval1.stageUnlockMap['m-2'].canUnlockNextStage, false, 'Stage 2 must be locked while Stage 1 is pending approval');

        // Now approve Stage 1, but mark IPC unpaid
        milestones[0].clientStatus = 'approved';
        milestones[0].ipcPaid = false;
        const eval2 = evaluateAecFiveGate(project, milestones, [], []);
        assert.equal(eval2.stageUnlockMap['m-2'].canUnlockNextStage, false, 'Stage 2 must remain locked while Stage 1 IPC is unpaid');

        // Now mark Stage 1 IPC paid -> Stage 2 unlocks!
        milestones[0].ipcPaid = true;
        const eval3 = evaluateAecFiveGate(project, milestones, [], []);
        assert.equal(eval3.stageUnlockMap['m-2'].canUnlockNextStage, true, 'Stage 2 must unlock once Stage 1 is approved + IPC paid');
        passed++;
    }

    // 4. Revision Quota Gate & Auto-Variation Order Generator
    {
        const project: Project = {
            id: 'proj-4',
            name: 'Saadiyat Cultural Pavilion',
            hourlyRate: 200,
            allowedRevisionRounds: 2,
            proposalSigned: true,
            authorityNocUploaded: true,
            retainerPaid: true,
            siteSurveyUploaded: true,
        };
        const milestone: Milestone = {
            id: 'm-rev',
            projectId: 'proj-4',
            name: 'RIBA Stage 3: Developed Design',
            completedPercentage: 80,
            clientStatus: 'revision',
            revisionCount: 3, // Exceeds maxRevisions = 2
            maxRevisions: 2,
            createdAt: '2026-01-01T00:00:00Z',
        };

        const evalRev = evaluateAecFiveGate(project, [milestone], [], []);
        assert.equal(evalRev.stageUnlockMap['m-rev'].overRevisionQuota, true, 'Should detect revision quota exceeded');
        assert.equal(evalRev.stageUnlockMap['m-rev'].isFrozenByVo, true, 'Should freeze stage when revision quota exceeded');

        const autoVo = buildAutoVariationOrder({
            project,
            milestone,
            existingVoCount: 4,
            estimatedHours: 24,
        });
        assert.equal(autoVo.code, 'VO-005', 'Should generate sequential VO number VO-005');
        assert.equal(autoVo.approvedAmount, 24 * 200, 'Should calculate cost impact = 24h * 200/hr = 4800');
        assert.equal(autoVo.status, 'submitted');
        passed++;
    }

    // 5. Pending Variation Order freezes stage & blocks Final IFC Release
    {
        const project: Project = {
            id: 'proj-5',
            name: 'Al Maryah Tower',
            hourlyRate: 180,
            proposalSigned: true,
            authorityNocUploaded: true,
            retainerPaid: true,
            siteSurveyUploaded: true,
        };
        const milestones: Milestone[] = [
            {
                id: 'm-final',
                projectId: 'proj-5',
                name: 'RIBA Stage 4: Technical IFC Design',
                completedPercentage: 100,
                clientStatus: 'approved',
                ipcPaid: true,
                createdAt: '2026-01-01T00:00:00Z',
            },
        ];
        const pendingVo: VariationOrder = {
            id: 'vo-1',
            projectId: 'proj-5',
            code: 'VO-001',
            title: 'Additional Penthouse Structural Steel',
            description: 'Extra steel',
            reasonCategory: 'client_request',
            status: 'submitted',
            contractorAmount: 15000,
            engineerAssessedAmount: 15000,
            approvedAmount: 15000,
            scheduleImpactDays: 5,
            approvedTimeDays: 5,
            ballInCourt: 'Client',
            currentApprovalStep: 2,
            createdAt: '2026-03-01T00:00:00Z',
        };
        const paidIpc: PaymentApplication = {
            id: 'ipc-1',
            projectId: 'proj-5',
            subcontractorId: 'sub-1',
            subcontractorName: 'Client Fee IPC',
            applicationNumber: 'IPC-001',
            workPackageName: 'RIBA Stage 4',
            contractValue: 100000,
            retentionPercent: 10,
            claimedGross: 50000,
            certifiedGross: 50000,
            approvedGross: 50000,
            retentionHeld: 5000,
            retentionReleased: 0,
            advanceRecovery: 0,
            netPayable: 45000,
            lienWaiverSigned: true,
            status: 'paid',
            periodEnd: '2026-03-10',
        };

        const blockedEval = evaluateAecFiveGate(project, milestones, [paidIpc], [pendingVo]);
        assert.equal(blockedEval.canReleaseFinalIfcPackage, false, 'Final IFC package must be blocked when a VO is pending');

        // Approve VO -> Final IFC package unlocks
        pendingVo.status = 'approved';
        const unlockedEval = evaluateAecFiveGate(project, milestones, [paidIpc], [pendingVo]);
        assert.equal(unlockedEval.canReleaseFinalIfcPackage, true, 'Final IFC package should unlock when all stages approved, VOs approved, and IPCs paid');
        passed++;
    }

    // 6. Admin Baseline Date Override Validation
    {
        const nonAdmin = validateBaselineDateOverride('engineer', 'Client delayed NOC', '2026-04-01', '2026-05-01');
        assert.equal(nonAdmin.valid, false, 'Non-admin cannot override baseline target date');

        const shortReason = validateBaselineDateOverride('admin', 'no', '2026-04-01', '2026-05-01');
        assert.equal(shortReason.valid, false, 'Reason shorter than 5 chars must be rejected');

        const validOverride = validateBaselineDateOverride('admin', 'Municipality utility relocation delay (+14d)', '2026-04-01', '2026-04-15');
        assert.equal(validOverride.valid, true, 'Admin with valid justification should succeed');
        assert(validOverride.auditPayload?.overrideJustification.includes('Municipality'));
        passed++;
    }

    console.log(`✅ All ${passed}/6 AEC 5-Gate Governance test suites passed!`);
}

runTests();
