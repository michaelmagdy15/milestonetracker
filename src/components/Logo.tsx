import React from 'react';
import clsx from 'clsx';
import { useTenant } from '../context/TenantContext';
import { useTheme } from '../context/ThemeContext';

export const NexusBrandSymbol: React.FC<{
    size?: number;
    variant?: 'orange-symbol' | 'squid-box' | 'orange-box';
    className?: string;
}> = ({ size = 40, variant = 'orange-symbol', className }) => {
    if (variant === 'orange-symbol') {
        return (
            <img
                src="/nexus-symbol.svg"
                alt="NEXUS Symbol"
                style={{ width: size, height: size }}
                className={clsx('object-contain shrink-0 select-none', className)}
            />
        );
    }

    const isOrangeBox = variant === 'orange-box';
    return (
        <div
            style={{ width: size, height: size }}
            className={clsx(
                'rounded-xl flex items-center justify-center shrink-0 select-none shadow-sm p-2',
                isOrangeBox
                    ? 'bg-[#e04b2a] border border-[#e04b2a]/20'
                    : 'bg-[#192631] border border-[#192631]/15',
                className
            )}
        >
            <img
                src="/nexus-symbol.svg"
                alt="NEXUS Symbol"
                className={clsx('w-full h-full object-contain', isOrangeBox && 'brightness-0 invert')}
            />
        </div>
    );
};

export const Logo: React.FC<{
    className?: string;
    showText?: boolean;
    collapsed?: boolean;
    variant?: 'orange-symbol' | 'squid-box' | 'orange-box';
    darkText?: boolean;
}> = ({ className, showText = true, collapsed = false }) => {
    const { activeOrg } = useTenant();
    let isDarkTheme = false;
    try {
        const themeCtx = useTheme();
        isDarkTheme = themeCtx.theme === 'dark';
    } catch {
        isDarkTheme = false;
    }

    const isDecPortal =
        activeOrg.id === 'org-dec-portal' ||
        activeOrg.slug === 'dec-engineering-consultants' ||
        activeOrg.name.toUpperCase().includes('DEC');

    if (isDecPortal) {
        return (
            <div className={clsx('inline-flex items-center gap-2.5 select-none shrink-0', className)}>
                <img
                    src="/logo.png"
                    alt="DEC Milestone Portal"
                    className="h-9 w-9 rounded-xl object-contain bg-[#192631] p-1 shadow-sm border border-white/10 shrink-0"
                />
                {showText && !collapsed && (
                    <div className="flex flex-col leading-none">
                        <span className={clsx('text-sm font-black tracking-tight', isDarkTheme ? 'text-white' : 'text-[#192631]')}>
                            DEC <span className="text-[#f97316]">PORTAL</span>
                        </span>
                        <span className={clsx('text-[8px] font-bold uppercase tracking-[0.16em] mt-0.5', isDarkTheme ? 'text-slate-400' : 'text-[#192631]/60')}>
                            Design & Engineering
                        </span>
                    </div>
                )}
            </div>
        );
    }

    if (
        activeOrg.logoUrl &&
        !activeOrg.logoUrl.includes('nexus-default') &&
        !activeOrg.logoUrl.includes('/logo.png')
    ) {
        return (
            <div className={clsx('flex items-center gap-2 shrink-0', className)}>
                <img
                    src={activeOrg.logoUrl}
                    alt={activeOrg.name}
                    className={clsx('object-contain', collapsed ? 'h-8 w-8' : 'h-8 sm:h-9 w-auto max-w-[160px]')}
                />
            </div>
        );
    }

    if (!showText || collapsed) {
        return (
            <div className={clsx('inline-flex items-center justify-center select-none shrink-0', className)}>
                <img
                    src="/nexus-symbol.svg"
                    alt="NEXUS Contracting"
                    className="h-8 w-8 object-contain"
                />
            </div>
        );
    }

    return (
        <div className={clsx('inline-flex items-center select-none shrink-0', className)}>
            <img
                src={isDarkTheme ? '/nexus-logo-dark.svg' : '/nexus-logo.svg'}
                onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src.includes('nexus-logo-dark.svg')) {
                        target.src = '/nexus-logo.svg';
                    }
                }}
                alt="NEXUS Contracting"
                className="h-8 sm:h-9 w-auto max-w-[155px] object-contain"
            />
        </div>
    );
};
