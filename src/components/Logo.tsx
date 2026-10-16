import React from 'react';
import clsx from 'clsx';
import { useTenant } from '../context/TenantContext';

/**
 * Official NEXUS CONTRACTING Brand Logo & Symbol
 * Uses the exact unmodified native vector SVGs extracted directly from the official Nexus Brand Guideline PDF:
 * - /nexus-logo.svg   (Exact Page 3 vector paths: Orange N symbol + Squid Ink NEXUS + CONTRACTING)
 * - /nexus-symbol.svg (Exact Page 2/3 standalone Orange N symbol vector paths)
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

    // If a custom external logo URL was explicitly set in White-Label Studio
    if (
        activeOrg.logoUrl &&
        !activeOrg.logoUrl.includes('nexus-default') &&
        !activeOrg.logoUrl.includes('/logo.png')
    ) {
        return (
            <div className={clsx('flex items-center gap-3', className)}>
                <img
                    src={activeOrg.logoUrl}
                    alt={activeOrg.name}
                    className="h-11 w-auto max-h-14 object-contain"
                />
            </div>
        );
    }

    if (!showText) {
        return (
            <div className={clsx('inline-flex items-center justify-center select-none', className)}>
                <img
                    src="/nexus-symbol.svg"
                    alt="NEXUS Contracting"
                    className="h-12 w-12 object-contain"
                />
            </div>
        );
    }

    return (
        <div className={clsx('inline-flex items-center select-none', className)}>
            <img
                src="/nexus-logo.svg"
                alt="NEXUS Contracting"
                className="h-11 w-auto max-w-[205px] object-contain"
            />
        </div>
    );
};
