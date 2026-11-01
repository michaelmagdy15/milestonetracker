import React from 'react';
import clsx from 'clsx';
import logoSrc from '../assets/logo.png';
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
    let isDarkTheme = true;
    try {
        const themeCtx = useTheme();
        isDarkTheme = themeCtx.theme === 'dark';
    } catch {
        isDarkTheme = true;
    }

    const isDecPortal =
        activeOrg.id === 'org-dec-portal' ||
        activeOrg.slug === 'dec-engineering-consultants' ||
        activeOrg.name.toUpperCase().includes('DEC');

    if (isDecPortal) {
        return (
            <div className={clsx('flex items-center justify-center p-2', className)}>
                <img
                    src={logoSrc}
                    alt="DEC Milestone Tracker"
                    className={clsx(
                        'h-auto w-auto object-contain',
                        collapsed ? 'max-h-10' : 'max-h-20'
                    )}
                />
            </div>
        );
    }

    if (
        activeOrg.logoUrl &&
        !activeOrg.logoUrl.includes('nexus-default') &&
        !activeOrg.logoUrl.includes('/logo.png')
    ) {
        return (
            <div className={clsx('flex items-center gap-2 shrink-0 p-2', className)}>
                <img
                    src={activeOrg.logoUrl}
                    alt={activeOrg.name}
                    className={clsx('object-contain', collapsed ? 'h-8 w-8' : 'h-12 w-auto max-w-[180px]')}
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
        <div className={clsx('inline-flex items-center gap-3 select-none shrink-0 p-2', className)}>
            <img
                src="/nexus-symbol.svg"
                alt="NEXUS Contracting"
                className="h-10 w-10 object-contain shrink-0"
            />
            <div className="flex flex-col leading-none">
                <span className={clsx('text-base font-black tracking-tight', isDarkTheme ? 'text-white' : 'text-[#192631]')}>
                    NEXUS <span className="text-orange-500">ERP</span>
                </span>
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400 mt-1">
                    Contracting Suite
                </span>
            </div>
        </div>
    );
};
