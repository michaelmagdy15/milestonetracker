export interface EngineerScoreProfile {
    id: string;
    name: string;
    discipline: 'Architecture' | 'Civil/Structural' | 'MEP/BIM' | 'Interior Design' | 'Project Management';
    location: 'Design Studio (Office)' | 'Site Office (Geofenced)' | 'Hybrid HQ';
    deepCadHours: number; // e.g. 36 hours this week
    cadTargetHours: number; // e.g. 40 hours target
    gpsAttendanceRate: number; // percentage, e.g. 98%
    rollCallComplianceRate: number; // surprise rollcall compliance %
    submittalFirstPassRate: number; // % Code A / Code B
    dailyLogComplianceRate: number; // % daily submission
    activeMilestonesOnTrack: number;
    totalMilestones: number;
}

export interface EpiScoreResult {
    engineerId: string;
    name: string;
    discipline: string;
    location: string;
    epiScore: number; // Out of 100
    rankTier: 'Tier 1 Elite' | 'Tier 2 Proficient' | 'Tier 3 Attention Needed';
    cadScore: number;
    attendanceScore: number;
    qualityScore: number;
    complianceScore: number;
}

/**
 * Calculates 360° Engineer Performance Index (EPI).
 * Office Deep CAD weight: 35%
 * Field GPS & Surprise Roll-Call: 25%
 * Submittal Quality & Pass Rate: 25%
 * Daily Log & Milestone Execution: 15%
 */
export function calculateEpiScore(profile: EngineerScoreProfile): EpiScoreResult {
    // 1. CAD Score (capped at 100)
    const cadRatio = Math.min(1.2, profile.deepCadHours / Math.max(1, profile.cadTargetHours));
    const cadScore = Math.min(100, Math.round(cadRatio * 100));

    // 2. Attendance & Field Verification Score
    const attendanceScore = Math.round((profile.gpsAttendanceRate * 0.6) + (profile.rollCallComplianceRate * 0.4));

    // 3. Submittal & Quality Score
    const qualityScore = Math.round(profile.submittalFirstPassRate);

    // 4. Compliance & Execution Score
    const milestoneRatio = profile.totalMilestones > 0 ? (profile.activeMilestonesOnTrack / profile.totalMilestones) : 1;
    const complianceScore = Math.round((profile.dailyLogComplianceRate * 0.6) + (milestoneRatio * 100 * 0.4));

    // Weighted Combined EPI Score
    const weightedTotal = (cadScore * 0.35) + (attendanceScore * 0.25) + (qualityScore * 0.25) + (complianceScore * 0.15);
    const finalScore = Math.min(100, Math.max(0, Math.round(weightedTotal)));

    let rankTier: 'Tier 1 Elite' | 'Tier 2 Proficient' | 'Tier 3 Attention Needed' = 'Tier 2 Proficient';
    if (finalScore >= 88) {
        rankTier = 'Tier 1 Elite';
    } else if (finalScore < 72) {
        rankTier = 'Tier 3 Attention Needed';
    }

    return {
        engineerId: profile.id,
        name: profile.name,
        discipline: profile.discipline,
        location: profile.location,
        epiScore: finalScore,
        rankTier,
        cadScore,
        attendanceScore,
        qualityScore,
        complianceScore,
    };
}

export const SAMPLE_ENGINEER_PROFILES: EngineerScoreProfile[] = [
    {
        id: 'eng-1',
        name: 'Eng. Michael Magdy',
        discipline: 'Architecture',
        location: 'Design Studio (Office)',
        deepCadHours: 42.5,
        cadTargetHours: 40,
        gpsAttendanceRate: 100,
        rollCallComplianceRate: 100,
        submittalFirstPassRate: 96,
        dailyLogComplianceRate: 100,
        activeMilestonesOnTrack: 6,
        totalMilestones: 6,
    },
    {
        id: 'eng-2',
        name: 'Eng. Mohamed Saber',
        discipline: 'Civil/Structural',
        location: 'Site Office (Geofenced)',
        deepCadHours: 37.0,
        cadTargetHours: 35,
        gpsAttendanceRate: 98,
        rollCallComplianceRate: 95,
        submittalFirstPassRate: 92,
        dailyLogComplianceRate: 94,
        activeMilestonesOnTrack: 8,
        totalMilestones: 8,
    },
    {
        id: 'eng-3',
        name: 'Eng. Pierre Nabil',
        discipline: 'Project Management',
        location: 'Hybrid HQ',
        deepCadHours: 38.0,
        cadTargetHours: 40,
        gpsAttendanceRate: 96,
        rollCallComplianceRate: 92,
        submittalFirstPassRate: 94,
        dailyLogComplianceRate: 90,
        activeMilestonesOnTrack: 12,
        totalMilestones: 13,
    },
    {
        id: 'eng-4',
        name: 'Eng. Farida Karim',
        discipline: 'Interior Design',
        location: 'Design Studio (Office)',
        deepCadHours: 39.0,
        cadTargetHours: 40,
        gpsAttendanceRate: 95,
        rollCallComplianceRate: 90,
        submittalFirstPassRate: 91,
        dailyLogComplianceRate: 92,
        activeMilestonesOnTrack: 5,
        totalMilestones: 5,
    },
    {
        id: 'eng-5',
        name: 'Eng. Tarek Shawky',
        discipline: 'MEP/BIM',
        location: 'Design Studio (Office)',
        deepCadHours: 34.0,
        cadTargetHours: 40,
        gpsAttendanceRate: 90,
        rollCallComplianceRate: 85,
        submittalFirstPassRate: 88,
        dailyLogComplianceRate: 85,
        activeMilestonesOnTrack: 4,
        totalMilestones: 5,
    },
];
