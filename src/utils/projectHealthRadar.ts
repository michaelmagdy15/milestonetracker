/**
 * Project Health Radar — ported from MitrixoGYM CRM's Retention Radar (src/utils/churnRetention.ts).
 *
 * Gym CRM                      →  ECHO (engineering consultancy)
 *  inactive 14 days ("we miss you")  →  STALLED: no time/site logs on a project for 14+ days
 *  expiring in 7 days ("renewal")     →  MILESTONE_DUE: milestone due within 7 days and not complete
 *  overdue balance ("collection")     →  FEE_UNCOLLECTED: milestone 100% complete but IPC not paid
 *  (new)                              →  FIDIC_TIME_BAR: escalated delay event nearing the 28-day notice limit
 *
 * Pure function over existing DataContext data — no extra Firestore reads.
 */
import type { LogEntry, Milestone, Project } from '../types';

export type ProjectRiskType = 'STALLED' | 'MILESTONE_DUE' | 'FEE_UNCOLLECTED' | 'FIDIC_TIME_BAR';

export interface ProjectRiskItem {
    id: string;
    project: Project;
    riskType: ProjectRiskType;
    title: string;
    detail: string;
    urgencyScore: number; // higher = more urgent
}

export const FIDIC_NOTICE_DAYS = 28;
export const FIDIC_ESCALATION_TAG = '[FIDIC CLAUSE 20.1 ESCALATED';

const DAY_MS = 24 * 60 * 60 * 1000;

function daysBetween(fromIso: string, now: Date): number {
    return Math.floor((now.getTime() - new Date(fromIso).getTime()) / DAY_MS);
}

/** Days left in the FIDIC 20.1 notice window for an event logged on `eventDate` (negative = expired). */
export function fidicDaysRemaining(eventDate: string, now: Date = new Date()): number {
    return FIDIC_NOTICE_DAYS - daysBetween(eventDate, now);
}

export function computeProjectRisks(
    projects: Project[],
    entries: LogEntry[],
    milestones: Milestone[],
    now: Date = new Date()
): ProjectRiskItem[] {
    const items: ProjectRiskItem[] = [];
    const projectById = new Map(projects.map(p => [p.id, p]));

    // Last activity per project
    const lastLog = new Map<string, string>();
    for (const e of entries) {
        if (!e.projectId || !e.date) continue;
        const prev = lastLog.get(e.projectId);
        if (!prev || e.date > prev) lastLog.set(e.projectId, e.date);
    }

    for (const p of projects) {
        if (p.phase && /complete|closed|handover/i.test(p.phase)) continue;
        const last = lastLog.get(p.id);
        const idle = last ? daysBetween(last, now) : null;
        if (idle === null || idle >= 14) {
            items.push({
                id: `stalled-${p.id}`,
                project: p,
                riskType: 'STALLED',
                title: 'No activity logged',
                detail: idle === null ? 'No time or site logs recorded yet' : `${idle} days since the last log`,
                urgencyScore: idle === null ? 40 : 50 + Math.min(idle, 60),
            });
        }
    }

    for (const m of milestones) {
        const p = projectById.get(m.projectId);
        if (!p) continue;
        if (m.completedPercentage >= 100) {
            if (m.ipcPaid === false) {
                items.push({
                    id: `fee-${m.id}`,
                    project: p,
                    riskType: 'FEE_UNCOLLECTED',
                    title: `Fee not collected: ${m.name}`,
                    detail: `Milestone complete${m.feePercentage ? ` (${m.feePercentage}% of fee)` : ''} but IPC unpaid`,
                    urgencyScore: 90,
                });
            }
            continue;
        }
        if (!m.targetDate) continue;
        const daysLeft = -daysBetween(m.targetDate, now);
        if (daysLeft <= 7) {
            items.push({
                id: `due-${m.id}`,
                project: p,
                riskType: 'MILESTONE_DUE',
                title: daysLeft < 0 ? `Overdue: ${m.name}` : `Due soon: ${m.name}`,
                detail: `${m.completedPercentage}% done · ${daysLeft < 0 ? `${-daysLeft} days late` : `${daysLeft} days left`}`,
                urgencyScore: daysLeft < 0 ? 85 + Math.min(-daysLeft, 14) : 70 - daysLeft,
            });
        }
    }

    for (const e of entries) {
        if (!e.taskDescription?.startsWith(FIDIC_ESCALATION_TAG)) continue;
        const p = projectById.get(e.projectId);
        if (!p) continue;
        const left = fidicDaysRemaining(e.date, now);
        if (left < -7) continue; // long expired; stop nagging
        items.push({
            id: `fidic-${e.id}`,
            project: p,
            riskType: 'FIDIC_TIME_BAR',
            title: left < 0 ? 'FIDIC 20.1 notice window EXPIRED' : `FIDIC 20.1 notice: ${left} days left`,
            detail: e.taskDescription.replace(/^\[[^\]]*\]\s*/, '').slice(0, 110),
            urgencyScore: left < 0 ? 120 : 100 + (FIDIC_NOTICE_DAYS - left),
        });
    }

    return items.sort((a, b) => b.urgencyScore - a.urgencyScore);
}
