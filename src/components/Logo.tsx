import React from 'react';
import clsx from 'clsx';
import { useTenant } from '../context/TenantContext';

/**
 * Official NEXUS CONTRACTING & DEC MILESTONE PORTAL Multi-Tenant Brand Logo
 * - When activeOrg is DEC MILESTONE PORTAL (`org-dec-portal`), renders the DEC Portal emblem & badge.
 * - When activeOrg is NEXUS CONTRACTING (`org-default`), renders the official Nexus vector SVG (`/nexus-logo.svg`).
 */
export const NexusBrandSymbol: React.FC<{
    size?: number;
    variant?: 'orange-symbol' | 'squid-box' | 'orange-box';
    className?: string;
}> = ({ size = 42, variant = 'orange-symbol', className }) => {
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
    variant?: 'orange-symbol' | 'squid-box' | 'orange-box';
    darkText?: boolean;
}> = ({ className, showText = true }) => {
    const { activeOrg } = useTenant();
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
                    className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl object-contain bg-[#192631] p-1 shadow-sm"
                />
                {showText && (
                    <div className="flex flex-col leading-none">
                        <span className="text-sm sm:text-base font-black tracking-tight text-[#192631]">
                            DEC <span className="text-[#f97316]">PORTAL</span>
                        </span>
                        <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.16em] text-[#192631]/60 mt-0.5">
                            Design & Engineering
                        </span>
                    </div>
                )}
            </div>
        );
    }

    // If a custom external logo URL was explicitly set in White-Label Studio
    if (
        activeOrg.logoUrl &&
        !activeOrg.logoUrl.includes('nexus-default') &&
        !activeOrg.logoUrl.includes('/logo.png')
    ) {
        return (
            <div className={clsx('flex items-center gap-2 sm:gap-3 shrink-0', className)}>
                <img
                    src={activeOrg.logoUrl}
                    alt={activeOrg.name}
                    className="h-8 sm:h-11 w-auto max-w-[135px] sm:max-w-[200px] max-h-14 object-contain"
                />
            </div>
        );
    }

    if (!showText) {
        return (
            <div className={clsx('inline-flex items-center justify-center select-none shrink-0', className)}>
                <img
                    src="/nexus-symbol.svg"
                    alt="NEXUS Contracting"
                    className="h-9 w-9 sm:h-12 sm:w-12 object-contain"
                />
            </div>
        );
    }

    return (
        <div className={clsx('inline-flex items-center select-none shrink-0', className)}>
            <img
                src="/nexus-logo.svg"
                alt="NEXUS Contracting"
                className="h-8 sm:h-10 lg:h-11 w-auto max-w-[132px] sm:max-w-[180px] lg:max-w-[205px] object-contain"
            />
        </div>
    );
};
