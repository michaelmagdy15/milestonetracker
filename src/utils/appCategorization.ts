export const DEEP_WORK_PROGRAMS = [
    "AutoCAD",
    "Revit",
    "ETABS",
    "SAFE",
    "SAP2000",
    "Staad.Pro",
    "SketchUp",
    "Lumion",
    "Twinmotion",
    "3ds Max",
    "Archicad",
    "Civil 3D",
    "Rhino",
    "Grasshopper",
    "SolidWorks",
    "Bluebeam",
    "Navisworks",
    "Primavera P6",
    "Tekla",
    "Bentley",
    "MicroStation",
    "Enscape",
    "V-Ray",
    "D5 Render"
];

export const COMMUNICATION_PROGRAMS = [
    "Outlook", "Teams", "Zoom", "Slack", "Skype", "Discord", "Webex", "Meet", "WhatsApp"
];

export type AppCategory = 'Deep Work' | 'Communication' | 'Admin/Doc' | 'Browsing/Other';

export const categorizeApp = (windowTitle: string): AppCategory => {
    const title = windowTitle.toLowerCase();

    if (DEEP_WORK_PROGRAMS.some(p => title.includes(p.toLowerCase()))) {
        return 'Deep Work';
    }
    if (COMMUNICATION_PROGRAMS.some(p => title.includes(p.toLowerCase()))) {
        return 'Communication';
    }
    if (["excel", "powerpoint", "word", "pdf", "acrobat", "project", "primavera"].some(p => title.includes(p))) {
        return 'Admin/Doc';
    }
    return 'Browsing/Other';
};
