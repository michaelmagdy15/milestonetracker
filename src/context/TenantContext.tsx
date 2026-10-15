import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Organization } from '../types';
import { supabase, DEFAULT_ORG_ID } from '../lib/supabase';
import toast from 'react-hot-toast';

interface TenantContextType {
    activeOrg: Organization;
    organizations: Organization[];
    switchOrganization: (orgId: string) => void;
    updateOrganization: (updates: Partial<Organization>) => Promise<void>;
    createOrganization: (orgData: Omit<Organization, 'id' | 'createdAt'>) => Promise<Organization | null>;
    deleteOrganization: (orgId: string) => Promise<void>;
    refreshOrganizations: () => Promise<void>;
}

const DEFAULT_ORG: Organization = {
    id: DEFAULT_ORG_ID,
    name: 'Apex Contracting & Engineering',
    slug: 'apex-contracting',
    tagline: 'White-Label Contracting & Milestone Management Platform',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#f3822d',
    themeSurface: 'obsidian',
    currency: 'AED',
    branches: ['Abu Dhabi', 'Cairo', 'Dubai', 'Riyadh'],
    email: 'admin@platform.com',
    phone: '+971 2 555 0100',
    address: 'Corporate Tower, Suite 400',
    city: 'Abu Dhabi',
    country: 'United Arab Emirates',
    plan: 'Enterprise',
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Helper: Convert Hex color to RGB [r, g, b]
const hexToRgb = (hex: string): [number, number, number] => {
    const clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
        return [
            parseInt(clean[0] + clean[0], 16) || 243,
            parseInt(clean[1] + clean[1], 16) || 130,
            parseInt(clean[2] + clean[2], 16) || 45,
        ];
    }
    const num = parseInt(clean, 16);
    if (isNaN(num)) return [243, 130, 45];
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

const mixRgb = (rgb1: [number, number, number], rgb2: [number, number, number], weight: number) => {
    const w = Math.max(0, Math.min(1, weight));
    return [
        Math.round(rgb1[0] * (1 - w) + rgb2[0] * w),
        Math.round(rgb1[1] * (1 - w) + rgb2[1] * w),
        Math.round(rgb1[2] * (1 - w) + rgb2[2] * w),
    ].join(' ');
};

const applyBrandThemeToDom = (org: Organization) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const baseRgb = hexToRgb(org.primaryColor || '#f3822d');
    const white: [number, number, number] = [255, 255, 255];
    const black: [number, number, number] = [10, 10, 12];

    root.style.setProperty('--brand-50', mixRgb(baseRgb, white, 0.92));
    root.style.setProperty('--brand-100', mixRgb(baseRgb, white, 0.82));
    root.style.setProperty('--brand-200', mixRgb(baseRgb, white, 0.65));
    root.style.setProperty('--brand-300', mixRgb(baseRgb, white, 0.42));
    root.style.setProperty('--brand-400', mixRgb(baseRgb, white, 0.18));
    root.style.setProperty('--brand-500', baseRgb.join(' '));
    root.style.setProperty('--brand-600', mixRgb(baseRgb, black, 0.14));
    root.style.setProperty('--brand-700', mixRgb(baseRgb, black, 0.30));
    root.style.setProperty('--brand-800', mixRgb(baseRgb, black, 0.46));
    root.style.setProperty('--brand-900', mixRgb(baseRgb, black, 0.60));
    root.style.setProperty('--brand-950', mixRgb(baseRgb, black, 0.78));

    const surface = org.themeSurface || 'obsidian';
    if (surface === 'midnight') {
        root.style.setProperty('--surface-bg', '#080d1a');
        root.style.setProperty('--surface-card', '#111827');
    } else if (surface === 'slate') {
        root.style.setProperty('--surface-bg', '#0f1419');
        root.style.setProperty('--surface-card', '#1b222c');
    } else {
        root.style.setProperty('--surface-bg', '#0f0f0f');
        root.style.setProperty('--surface-card', '#1a1a1a');
    }

    // Update browser document title
    document.title = `${org.name} — ${org.tagline || 'Milestone Tracker'}`;

    // Update favicon dynamically
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }

    if (org.faviconUrl || org.logoUrl) {
        link.href = org.faviconUrl || org.logoUrl || '/logo.png';
    } else {
        const initials = org.name
            .split(/\s+/)
            .map(w => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'WL';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${org.primaryColor || '#f3822d'}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-weight="900" font-size="26">${initials}</text></svg>`;
        link.href = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }
};

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [organizations, setOrganizations] = useState<Organization[]>([DEFAULT_ORG]);
    const [activeOrgId, setActiveOrgId] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('whitelabel_active_org_id') || DEFAULT_ORG_ID;
        }
        return DEFAULT_ORG_ID;
    });

    const refreshOrganizations = useCallback(async () => {
        try {
            const { data } = await supabase.from('organizations').select('*');
            if (data && data.length > 0) {
                setOrganizations(data);
                const storedId = localStorage.getItem('whitelabel_active_org_id');
                if (storedId && data.some((o: Organization) => o.id === storedId)) {
                    setActiveOrgId(storedId);
                } else if (!data.some((o: Organization) => o.id === activeOrgId)) {
                    setActiveOrgId(data[0].id);
                }
            }
        } catch (err) {
            console.error('TenantContext: Error loading organizations:', err);
        }
    }, [activeOrgId]);

    useEffect(() => {
        refreshOrganizations();
        const ch = supabase
            .channel('tenant-org-channel')
            .on('postgres_changes', { table: 'organizations' }, () => {
                refreshOrganizations();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(ch);
        };
    }, [refreshOrganizations]);

    const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0] || DEFAULT_ORG;

    useEffect(() => {
        applyBrandThemeToDom(activeOrg);
    }, [activeOrg]);

    const switchOrganization = (orgId: string) => {
        setActiveOrgId(orgId);
        localStorage.setItem('whitelabel_active_org_id', orgId);
        const target = organizations.find(o => o.id === orgId);
        if (target) {
            applyBrandThemeToDom(target);
            toast.success(`Switched workspace to ${target.name}`);
        }
        // Trigger data refresh across tables
        window.dispatchEvent(new CustomEvent('whitelabel-org-switched', { detail: { orgId } }));
    };

    const updateOrganization = async (updates: Partial<Organization>) => {
        const updated: Organization = { ...activeOrg, ...updates };
        setOrganizations(prev => prev.map(o => (o.id === activeOrg.id ? updated : o)));
        applyBrandThemeToDom(updated);

        const { error } = await supabase.from('organizations').upsert(updated, { onConflict: 'id' });
        if (error) {
            toast.error(`Failed to save branding: ${error.message}`);
            return;
        }
        toast.success('Company branding & workspace settings saved!');
        await refreshOrganizations();
    };

    const createOrganization = async (orgData: Omit<Organization, 'id' | 'createdAt'>): Promise<Organization | null> => {
        const newOrg: Organization = {
            ...orgData,
            id: `org-${crypto.randomUUID().slice(0, 8)}`,
            createdAt: new Date().toISOString(),
        };
        const { error } = await supabase.from('organizations').insert(newOrg);
        if (error) {
            toast.error(`Failed to create tenant workspace: ${error.message}`);
            return null;
        }
        await refreshOrganizations();
        switchOrganization(newOrg.id);
        return newOrg;
    };

    const deleteOrganization = async (orgId: string) => {
        if (organizations.length <= 1) {
            toast.error('Cannot delete the only remaining organization workspace.');
            return;
        }
        const { error } = await supabase.from('organizations').delete().eq('id', orgId);
        if (error) {
            toast.error(`Failed to delete workspace: ${error.message}`);
            return;
        }
        toast.success('Workspace removed');
        const remaining = organizations.filter(o => o.id !== orgId);
        setOrganizations(remaining);
        if (activeOrgId === orgId && remaining.length > 0) {
            switchOrganization(remaining[0].id);
        }
    };

    return (
        <TenantContext.Provider
            value={{
                activeOrg,
                organizations,
                switchOrganization,
                updateOrganization,
                createOrganization,
                deleteOrganization,
                refreshOrganizations,
            }}
        >
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
};
