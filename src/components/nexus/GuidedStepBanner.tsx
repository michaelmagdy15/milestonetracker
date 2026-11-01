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
        <div className="bg-[#1a1a1a]/60 backdrop-blur-2xl backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-5 shadow-sm mb-4 sm:mb-5">
            {/* Top Row: Lifecycle Stage Indicator + Active Project Pill + Step Counter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-3 border-b border-white/10">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500 text-white text-[10px] sm:text-xs font-black tracking-wide shadow-sm shrink-0">
                        <Compass className="w-3.5 h-3.5" />
                        <span>
                            {language === 'ar'
                                ? `المرحلة ${lifecycleStageNumber} من 6`
                                : `STAGE ${lifecycleStageNumber} OF 6`}
                        </span>
                    </span>
                    <h2 className="text-sm sm:text-lg font-black text-white leading-snug">
                        {language === 'ar' ? moduleTitleAr : moduleTitleEn}
                    </h2>
                    {activeProject ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px] font-bold text-white max-w-full">
                            <FolderKanban className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                            <span dir="ltr" className="font-mono font-black text-orange-400 shrink-0">
                                {activeProject.code}
                            </span>
                            <span className="truncate max-w-[165px] sm:max-w-[260px]">
                                {activeProject.clientName} ({activeProject.location})
                            </span>
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px] font-bold text-white">
                            <FolderKanban className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                            <span>
                                {language === 'ar' ? 'جميع المشروعات (77 مشروع)' : 'All 77 Projects Portfolio'}
                            </span>
                        </span>
                    )}
                </div>

                {/* Quick Prev / Next Step Controls */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {hasPrev && (
                        <button
                            type="button"
                            onClick={() => onSelectStep(steps[currentIndex - 1].id)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 min-h-[38px] rounded-xl bg-white/5 hover:bg-white/5 text-white text-xs font-bold transition-all shrink-0 touch-manipulation"
                        >
                            {language === 'ar' ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                            <span>{language === 'ar' ? 'السابق' : 'Prev'}</span>
                        </button>
                    )}

                    {hasNext ? (
                        <button
                            type="button"
                            onClick={() => onSelectStep(steps[currentIndex + 1].id)}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 min-h-[38px] rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black shadow-sm transition-all min-w-0 touch-manipulation"
                        >
                            <span className="truncate">
                                {language === 'ar'
                                    ? `الخطوة التالية (${currentIndex + 2}/${steps.length}): ${steps[currentIndex + 1].titleAr}`
                                    : `Next Step (${currentIndex + 2}/${steps.length}): ${steps[currentIndex + 1].titleEn}`}
                            </span>
                            {language === 'ar' ? (
                                <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                            ) : (
                                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                            )}
                        </button>
                    ) : nextLifecycleStage ? (
                        <button
                            type="button"
                            onClick={() => navigate(nextLifecycleStage.path)}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 min-h-[38px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-sm transition-all min-w-0 touch-manipulation"
                        >
                            <span className="truncate">
                                {language === 'ar'
                                    ? `انتقل للمرحلة ${nextLifecycleStage.stepNumber}: ${nextLifecycleStage.titleAr}`
                                    : `Proceed to Stage ${nextLifecycleStage.stepNumber}: ${nextLifecycleStage.titleEn}`}
                            </span>
                            {language === 'ar' ? (
                                <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                            ) : (
                                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                            )}
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Numbered Stepper Pills — Horizontal Swipe Strip on iPhone 15 Pro, Grid on Tablet/Desktop */}
            <div
                className="flex overflow-x-auto snap-x snap-mandatory gap-2 pb-1 no-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-2.5 mt-3 touch-pan-x"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {steps.map((step, idx) => {
                    const isActive = step.id === activeStepId;
                    const isDone = idx < currentIndex;
                    return (
                        <button
                            key={step.id}
                            type="button"
                            onClick={() => onSelectStep(step.id)}
                            className={clsx(
                                'min-w-[238px] max-w-[265px] sm:min-w-0 sm:max-w-none snap-start shrink-0 flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl border text-start transition-all touch-manipulation',
                                isActive
                                    ? 'bg-orange-500/10 border-orange-500 shadow-sm'
                                    : isDone
                                    ? 'bg-emerald-500/10 border-emerald-500/25 hover:bg-emerald-500/10'
                                    : 'bg-white/5 border-white/10 hover:bg-[#1a1a1a]'
                            )}
                        >
                            <div
                                className={clsx(
                                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5',
                                    isActive
                                        ? 'bg-orange-500 text-white'
                                        : isDone
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-white/5 text-slate-400'
                                )}
                            >
                                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.stepNum}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                    <span
                                        className={clsx(
                                            'text-xs font-black truncate',
                                            isActive ? 'text-orange-400' : 'text-white'
                                        )}
                                    >
                                        {language === 'ar' ? step.titleAr : step.titleEn}
                                    </span>
                                    {isActive && (
                                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 shrink-0">
                                            {language === 'ar' ? 'الآن' : 'NOW'}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5 line-clamp-2 leading-snug">
                                    {language === 'ar' ? step.actionHintAr : step.actionHintEn}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Simple 1-Line "What to do right now" Callout */}
            {currentStep && (
                <div className="mt-2.5 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-start sm:items-center gap-2 text-slate-200 font-semibold">
                        <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5 sm:mt-0" />
                        <span className="leading-snug">
                            <strong className="text-white font-black">
                                {language === 'ar'
                                    ? `خطوة ${currentStep.stepNum} من ${steps.length} — ما يجب فعله الآن: `
                                    : `Step ${currentStep.stepNum} of ${steps.length} — What to do now: `}
                            </strong>
                            {language === 'ar' ? currentStep.actionHintAr : currentStep.actionHintEn}
                        </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
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

