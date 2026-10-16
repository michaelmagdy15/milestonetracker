import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, FolderKanban, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { useLanguage } from '../../context/LanguageContext';
import { useWorkflow, NEXUS_LIFECYCLE_STAGES } from '../../context/WorkflowContext';

export interface GuidedStepItem {
    id: string;
    stepNum: number;
    titleEn: string;
    titleAr: string;
    actionHintEn: string;
    actionHintAr: string;
}

interface GuidedStepBannerProps {
    lifecycleStageNumber: number; // 1 to 6
    moduleTitleEn: string;
    moduleTitleAr: string;
    steps: GuidedStepItem[];
    activeStepId: string;
    onSelectStep: (id: string) => void;
}

export const GuidedStepBanner: React.FC<GuidedStepBannerProps> = ({
    lifecycleStageNumber,
    moduleTitleEn,
    moduleTitleAr,
    steps,
    activeStepId,
    onSelectStep,
}) => {
    const { language } = useLanguage();
    const { activeProject, activeProjectCode } = useWorkflow();
    const navigate = useNavigate();

    const currentIndex = Math.max(
        0,
        steps.findIndex(s => s.id === activeStepId)
    );
    const currentStep = steps[currentIndex] || steps[0];
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < steps.length - 1;

    const nextLifecycleStage = NEXUS_LIFECYCLE_STAGES.find(
        s => s.stepNumber === lifecycleStageNumber + 1
    );

    return (
        <div className="bg-white/90 backdrop-blur-xl border border-[#192631]/12 rounded-2xl p-4 sm:p-5 shadow-sm mb-5">
            {/* Top Row: Lifecycle Stage Indicator + Active Project Pill + Step Counter */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[#192631]/10">
                <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e04b2a] text-white text-xs font-black tracking-wide shadow-sm">
                        <Compass className="w-3.5 h-3.5" />
                        <span>
                            {language === 'ar'
                                ? `المرحلة ${lifecycleStageNumber} من 6`
                                : `STAGE ${lifecycleStageNumber} OF 6`}
                        </span>
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-[#192631]">
                        {language === 'ar' ? moduleTitleAr : moduleTitleEn}
                    </h2>
                    {activeProject ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#192631]/[0.06] border border-[#192631]/12 text-xs font-bold text-[#192631]">
                            <FolderKanban className="w-3.5 h-3.5 text-[#e04b2a]" />
                            <span dir="ltr" className="font-mono font-black text-[#e04b2a]">
                                {activeProject.code}
                            </span>
                            <span className="truncate max-w-[200px] sm:max-w-[260px]">
                                {activeProject.clientName} ({activeProject.location})
                            </span>
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#192631]/[0.06] border border-[#192631]/12 text-xs font-bold text-[#192631]">
                            <FolderKanban className="w-3.5 h-3.5 text-[#e04b2a]" />
                            <span>
                                {language === 'ar' ? 'جميع المشروعات (77 مشروع)' : 'All 77 Projects Portfolio'}
                            </span>
                        </span>
                    )}
                </div>

                {/* Quick Prev / Next Step Controls */}
                <div className="flex items-center gap-2">
                    {hasPrev && (
                        <button
                            type="button"
                            onClick={() => onSelectStep(steps[currentIndex - 1].id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#192631]/[0.05] hover:bg-[#192631]/10 text-[#192631] text-xs font-bold transition-all"
                        >
                            {language === 'ar' ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                            <span>{language === 'ar' ? 'الخطوة السابقة' : 'Previous Step'}</span>
                        </button>
                    )}

                    {hasNext ? (
                        <button
                            type="button"
                            onClick={() => onSelectStep(steps[currentIndex + 1].id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#e04b2a] hover:bg-[#c93e1f] text-white text-xs font-black shadow-sm transition-all"
                        >
                            <span>
                                {language === 'ar'
                                    ? `الخطوة التالية (${currentIndex + 2}/${steps.length}): ${steps[currentIndex + 1].titleAr}`
                                    : `Next Step (${currentIndex + 2}/${steps.length}): ${steps[currentIndex + 1].titleEn}`}
                            </span>
                            {language === 'ar' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                        </button>
                    ) : nextLifecycleStage ? (
                        <button
                            type="button"
                            onClick={() => navigate(nextLifecycleStage.path)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#123524] hover:bg-[#194a32] text-white text-xs font-black shadow-sm transition-all"
                        >
                            <span>
                                {language === 'ar'
                                    ? `انتقل للمرحلة ${nextLifecycleStage.stepNumber}: ${nextLifecycleStage.titleAr}`
                                    : `Proceed to Stage ${nextLifecycleStage.stepNumber}: ${nextLifecycleStage.titleEn}`}
                            </span>
                            {language === 'ar' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Numbered Stepper Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3.5">
                {steps.map((step, idx) => {
                    const isActive = step.id === activeStepId;
                    const isDone = idx < currentIndex;
                    return (
                        <button
                            key={step.id}
                            type="button"
                            onClick={() => onSelectStep(step.id)}
                            className={clsx(
                                'flex items-start gap-2.5 p-3 rounded-xl border text-start transition-all',
                                isActive
                                    ? 'bg-[#e04b2a]/[0.09] border-[#e04b2a] shadow-sm'
                                    : isDone
                                    ? 'bg-[#123524]/[0.05] border-[#123524]/20 hover:bg-[#123524]/[0.09]'
                                    : 'bg-[#f5f5f5]/80 border-[#192631]/10 hover:bg-white'
                            )}
                        >
                            <div
                                className={clsx(
                                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5',
                                    isActive
                                        ? 'bg-[#e04b2a] text-white'
                                        : isDone
                                        ? 'bg-[#123524] text-white'
                                        : 'bg-[#192631]/10 text-[#192631]/70'
                                )}
                            >
                                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.stepNum}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                    <span
                                        className={clsx(
                                            'text-xs font-black truncate',
                                            isActive ? 'text-[#e04b2a]' : 'text-[#192631]'
                                        )}
                                    >
                                        {language === 'ar' ? step.titleAr : step.titleEn}
                                    </span>
                                    {isActive && (
                                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#e04b2a]/15 text-[#e04b2a] shrink-0">
                                            {language === 'ar' ? 'الآن' : 'NOW'}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-[#192631]/65 font-medium mt-0.5 line-clamp-2 leading-snug">
                                    {language === 'ar' ? step.actionHintAr : step.actionHintEn}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Simple 1-Line "What to do right now" Callout */}
            {currentStep && (
                <div className="mt-3 pt-2.5 border-t border-[#192631]/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-[#192631]/80 font-semibold">
                        <Sparkles className="w-4 h-4 text-[#e04b2a] shrink-0" />
                        <span>
                            <strong className="text-[#192631] font-black">
                                {language === 'ar'
                                    ? `خطوة ${currentStep.stepNum} من ${steps.length} — ما يجب فعله الآن: `
                                    : `Step ${currentStep.stepNum} of ${steps.length} — What to do now: `}
                            </strong>
                            {language === 'ar' ? currentStep.actionHintAr : currentStep.actionHintEn}
                        </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#192631]/55">
                        {activeProjectCode === 'ALL'
                            ? language === 'ar'
                                ? 'النطاق: كل المشروعات'
                                : 'Scope: All Projects'
                            : language === 'ar'
                            ? `المشروع النشط: ${activeProjectCode}`
                            : `Active Project: ${activeProjectCode}`}
                    </span>
                </div>
            )}
        </div>
    );
};
export default GuidedStepBanner;
