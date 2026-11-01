export interface EngineerScoreProfile {
    id: string;
    name: string;
    discipline: 'Water & SWRO' | 'Site Supervision (316)' | 'Electromechanical' | 'Civil/Structural' | 'BIM & Architecture' | 'Project Management';
    location: 'Cairo HQ (Mohandiseen)' | 'Toshka / New Delta Site (GPS)' | 'UAE (Marafek / DEC)' | 'KSA (Riyadh / Waad El Shamal)';
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
 * Office Deep CAD / Hydraulic Modeling weight: 35%
 * Field GPS & Surprise Roll-Call (تمام مفاجئ): 25%
 * Submittal Quality & First-Time Pass Rate (NOPWASD/CAPW/NUCA/DEC): 25%
 * Daily Log & Milestone Execution: 15%
 */
export function calculateEpiScore(profile: EngineerScoreProfile): EpiScoreResult {
    // 1. CAD / Hydraulic Model Score (capped at 100)
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
        id: 'eng-4',
        name: 'Eng. Ahmed Seera (Mega WWTP & Transmission Division)',
        discipline: 'Water & SWRO',
        location: 'Cairo HQ (Mohandiseen)',
        deepCadHours: 43.0,
        cadTargetHours: 40,
        gpsAttendanceRate: 100,
        rollCallComplianceRate: 100,
        submittalFirstPassRate: 98,
        dailyLogComplianceRate: 100,
        activeMilestonesOnTrack: 14,
        totalMilestones: 14,
    },
    {
        id: 'eng-3',
        name: 'Eng. Ahmed Abdel-Gawad (SWRO & Marafek UAE Division)',
        discipline: 'Water & SWRO',
        location: 'UAE (Marafek / DEC)',
        deepCadHours: 42.0,
        cadTargetHours: 40,
        gpsAttendanceRate: 99,
        rollCallComplianceRate: 98,
        submittalFirstPassRate: 97,
        dailyLogComplianceRate: 98,
        activeMilestonesOnTrack: 11,
        totalMilestones: 11,
    },
    {
        id: 'eng-5',
        name: 'Eng. Medhat Mabrouk (Electromechanical & SCADA Division — 61 Staff)',
        discipline: 'Electromechanical',
        location: 'Cairo HQ (Mohandiseen)',
        deepCadHours: 41.5,
        cadTargetHours: 40,
        gpsAttendanceRate: 98,
        rollCallComplianceRate: 96,
        submittalFirstPassRate: 95,
        dailyLogComplianceRate: 96,
        activeMilestonesOnTrack: 9,
        totalMilestones: 9,
    },
    {
        id: 'eng-8',
        name: 'Eng. Mohamed Saber (Construction Supervision Division — 316 Staff)',
        discipline: 'Site Supervision (316)',
        location: 'Toshka / New Delta Site (GPS)',
        deepCadHours: 39.0,
        cadTargetHours: 38,
        gpsAttendanceRate: 97,
        rollCallComplianceRate: 95,
        submittalFirstPassRate: 93,
        dailyLogComplianceRate: 95,
        activeMilestonesOnTrack: 18,
        totalMilestones: 19,
    },
    {
        id: 'eng-7',
        name: 'Eng. Michael Magdy (BIM 360, Architecture & Digital Twin — 41 Staff)',
        discipline: 'BIM & Architecture',
        location: 'UAE (Marafek / DEC)',
        deepCadHours: 42.5,
        cadTargetHours: 40,
        gpsAttendanceRate: 100,
        rollCallComplianceRate: 100,
        submittalFirstPassRate: 96,
        dailyLogComplianceRate: 98,
        activeMilestonesOnTrack: 8,
        totalMilestones: 8,
    },
    {
        id: 'eng-9',
        name: 'Eng. Tarek El-antably (Waad El Shamal 470km Pipeline & Roads — 37 Staff)',
        discipline: 'Civil/Structural',
        location: 'KSA (Riyadh / Waad El Shamal)',
        deepCadHours: 37.5,
        cadTargetHours: 40,
        gpsAttendanceRate: 94,
        rollCallComplianceRate: 91,
        submittalFirstPassRate: 91,
        dailyLogComplianceRate: 92,
        activeMilestonesOnTrack: 7,
        totalMilestones: 8,
    },
];
