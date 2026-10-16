import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { NEXUS_LIVE_PROJECTS } from '../data/nexusLiveSeedData';
import type { NexusLiveProject } from '../data/nexusLiveSeedData';

export type ViewComplexity = 'guided' | 'full';
export type WorkflowPersona = 'ceo' | 'technical' | 'accounting' | 'logistics';

export interface LifecycleStageDef {
    stepNumber: number;
    id: string;
    path: string;
    titleEn: string;
    titleAr: string;
    shortDescEn: string;
    shortDescAr: string;
    badge: string;
    ownerRoleEn: string;
    ownerRoleAr: string;
}

export const NEXUS_LIFECYCLE_STAGES: LifecycleStageDef[] = [
    {
        stepNumber: 1,
        id: 'boq',
        path: '/boq',
        titleEn: 'BOQ & Pricing',
        titleAr: 'المقايسة والتسعير',
        shortDescEn: 'Price 839 R02 items, analyze unit costs & lock contract baseline',
        shortDescAr: 'تسعير بنود المقايسة R02 وتحليل سعر الوحدة وقفل التعاقد',
        badge: '839',
        ownerRoleEn: 'Eng. Pierre (Technical)',
        ownerRoleAr: 'م. بيير (المكتب الفني)',
    },
    {
        stepNumber: 2,
        id: 'submittals',
        path: '/submittals',
        titleEn: 'Submittals & Approvals',
        titleAr: 'الاعتمادات والتكويد',
        shortDescEn: 'Submit materials (MS) & drawings (DR) for Code A/B approval',
        shortDescAr: 'تقديم اعتمادات الخامات والرسومات للحصول على كود A أو B',
        badge: '51',
        ownerRoleEn: 'Eng. Pierre (Technical)',
        ownerRoleAr: 'م. بيير (المكتب الفني)',
    },
    {
        stepNumber: 3,
        id: 'procurement',
        path: '/procurement',
        titleEn: 'Buy & Warehouses',
        titleAr: 'المشتريات والمخازن',
        shortDescEn: 'Issue approved POs, scan Mawan bills & dispatch via 4 stores',
        shortDescAr: 'إصدار أوامر الشراء المعتمدة وفواتير الموانين والتوريد للمخازن',
        badge: '4',
        ownerRoleEn: 'Pierre / Merna / Milad',
        ownerRoleAr: 'بيير / ميرنا / ميلاد',
    },
    {
        stepNumber: 4,
        id: 'subcontractors',
        path: '/subcontractors',
        titleEn: 'Site & Subcontractors',
        titleAr: 'التنفيذ ومقاولو الباطن',
        shortDescEn: 'Assign A/B/C rated trades, inspect site works & issue ST/CPO',
        shortDescAr: 'تقييم مقاولي الباطن واستلام الأعمال وإصدار مستخلصات الصنايعية',
        badge: '56',
        ownerRoleEn: 'Site Eng & CEO',
        ownerRoleAr: 'مهندس الموقع والإدارة',
    },
    {
        stepNumber: 5,
        id: 'extracts',
        path: '/extracts',
        titleEn: 'Client Extracts & Ledger',
        titleAr: 'مستخلصات وحساب العميل',
        shortDescEn: 'Generate cumulative client extract, account statement & PR voucher',
        shortDescAr: 'إصدار المستخلص الجاري للعميل وكشف الحساب وطلب الصرف',
        badge: '80',
        ownerRoleEn: 'Pierre & Merna',
        ownerRoleAr: 'بيير وميرنا',
    },
    {
        stepNumber: 6,
        id: 'financials',
        path: '/financials',
        titleEn: 'Treasury & Cashflow',
        titleAr: 'الخزينة والسيولة',
        shortDescEn: 'Track 7 bank/cash vaults, 9 credit cards & 77-project profitability',
        shortDescAr: 'متابعة أرصدة الخزن والبنوك والكروت وربحية الـ 77 مشروع',
        badge: '16',
        ownerRoleEn: 'CEO & Merna',
        ownerRoleAr: 'الإدارة وأ. ميرنا',
    },
];

interface WorkflowContextType {
    activeProjectCode: string;
    setActiveProjectCode: (code: string) => void;
    activeProject: NexusLiveProject | undefined;
    viewComplexity: ViewComplexity;
    setViewComplexity: (mode: ViewComplexity) => void;
    toggleViewComplexity: () => void;
    activePersona: WorkflowPersona;
    setActivePersona: (persona: WorkflowPersona) => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const WorkflowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeProjectCode, setActiveProjectCodeState] = useState<string>(() => {
        try {
            return localStorage.getItem('nexus_active_project_code') || 'C096';
        } catch {
            return 'C096';
        }
    });

    const [viewComplexity, setViewComplexityState] = useState<ViewComplexity>(() => {
        try {
            const saved = localStorage.getItem('nexus_view_complexity');
            if (saved === 'guided' || saved === 'full') return saved;
        } catch {
            // ignore
        }
        return 'guided';
    });

    const [activePersona, setActivePersonaState] = useState<WorkflowPersona>(() => {
        try {
            const saved = localStorage.getItem('nexus_active_persona');
            if (saved === 'ceo' || saved === 'technical' || saved === 'accounting' || saved === 'logistics') {
                return saved;
            }
        } catch {
            // ignore
        }
        return 'ceo';
    });

    const setActiveProjectCode = (code: string) => {
        setActiveProjectCodeState(code);
        try {
            localStorage.setItem('nexus_active_project_code', code);
        } catch {
            // ignore
        }
    };

    const setViewComplexity = (mode: ViewComplexity) => {
        setViewComplexityState(mode);
        try {
            localStorage.setItem('nexus_view_complexity', mode);
        } catch {
            // ignore
        }
    };

    const toggleViewComplexity = () => {
        setViewComplexity(viewComplexity === 'guided' ? 'full' : 'guided');
    };

    const setActivePersona = (persona: WorkflowPersona) => {
        setActivePersonaState(persona);
        try {
            localStorage.setItem('nexus_active_persona', persona);
        } catch {
            // ignore
        }
    };

    const activeProject = useMemo(() => {
        if (activeProjectCode === 'ALL') return undefined;
        return NEXUS_LIVE_PROJECTS.find(p => p.code === activeProjectCode) || NEXUS_LIVE_PROJECTS[0];
    }, [activeProjectCode]);

    return (
        <WorkflowContext.Provider
            value={{
                activeProjectCode,
                setActiveProjectCode,
                activeProject,
                viewComplexity,
                setViewComplexity,
                toggleViewComplexity,
                activePersona,
                setActivePersona,
            }}
        >
            {children}
        </WorkflowContext.Provider>
    );
};

export const useWorkflow = () => {
    const context = useContext(WorkflowContext);
    if (!context) {
        throw new Error('useWorkflow must be used within a WorkflowProvider');
    }
    return context;
};
