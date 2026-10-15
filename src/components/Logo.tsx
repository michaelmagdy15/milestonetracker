import React from 'react';
import clsx from 'clsx';
import { Building2 } from 'lucide-react';
import { useTenant } from '../context/TenantContext';

export const Logo: React.FC<{ className?: string; showText?: boolean }> = ({ className, showText = true }) => {
    const { activeOrg } = useTenant();

    if (activeOrg.logoUrl) {
        return (
            <div className={clsx('flex items-center gap-3', className)}>
                <img
                    src={activeOrg.logoUrl}
                    alt={activeOrg.name}
                    className="h-10 w-auto max-h-14 object-contain rounded-lg"
                />
                {showText && (
                    <div className="flex flex-col min-w-0">
                        <span className="font-black text-white text-sm tracking-tight truncate leading-tight">
                            {activeOrg.name}
                        </span>
                        <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest truncate">
                            {activeOrg.plan || 'Enterprise'}
                        </span>
                    </div>
                )}
            </div>
        );
    }

    const initials = activeOrg.name
        .split(/\s+/)
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'WL';

    return (
        <div className={clsx('flex items-center gap-3', className)}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-black text-base shadow-orange-glow border border-white/10 shrink-0 relative overflow-hidden">
                <span>{initials}</span>
                <Building2 className="w-3 h-3 absolute bottom-1 right-1 opacity-30" />
            </div>
            {showText && (
                <div className="flex flex-col min-w-0 text-left">
                    <span className="font-black text-white text-sm tracking-tight truncate leading-tight">
                        {activeOrg.name}
                    </span>
                    <span className="text-[9px] text-orange-400 font-bold uppercase tracking-[0.18em] truncate mt-0.5">
                        Contracting OS
                    </span>
                </div>
            )}
        </div>
    );
};
