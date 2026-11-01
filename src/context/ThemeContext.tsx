import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTenant, DEC_ORG_ID } from './TenantContext';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'mitrixo_aec_theme';
const USER_OVERRIDE_KEY = 'mitrixo_aec_theme_manual';

function getInitialTheme(activeOrgId?: string): Theme {
    if (typeof window !== 'undefined') {
        const manualOverride = localStorage.getItem(USER_OVERRIDE_KEY);
        const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
        if (manualOverride === 'true' && (stored === 'dark' || stored === 'light')) {
            return stored;
        }
    }
    if (activeOrgId === DEC_ORG_ID) {
        return 'dark';
    }
    return 'light';
}

function applyThemeToDom(theme: Theme) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.remove('nexus-light-mode');
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    root.style.colorScheme = theme;
    if (theme === 'dark') {
        root.style.backgroundColor = '#090d16';
        root.style.setProperty('--surface-bg', '#090d16');
        root.style.setProperty('--surface-card', '#111827');
        root.style.setProperty('--surface-border', 'rgba(255, 255, 255, 0.08)');
        root.style.setProperty('--text-primary', '#f8fafc');
        root.style.setProperty('--text-secondary', '#cbd5e1');
        root.style.setProperty('--text-muted', '#94a3b8');
    } else {
        root.style.backgroundColor = '#f8fafc';
        root.style.setProperty('--surface-bg', '#f8fafc');
        root.style.setProperty('--surface-card', '#ffffff');
        root.style.setProperty('--surface-border', 'rgba(15, 23, 42, 0.09)');
        root.style.setProperty('--text-primary', '#0f172a');
        root.style.setProperty('--text-secondary', '#475569');
        root.style.setProperty('--text-muted', '#64748b');
    }
    localStorage.setItem(STORAGE_KEY, theme);
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { activeOrg } = useTenant();
    const [theme, setThemeState] = useState<Theme>(() => getInitialTheme(activeOrg?.id));

    useEffect(() => {
        const manual = localStorage.getItem(USER_OVERRIDE_KEY);
        if (manual !== 'true') {
            const nextTheme: Theme = activeOrg?.id === DEC_ORG_ID ? 'dark' : 'light';
            setThemeState(nextTheme);
        }
    }, [activeOrg?.id]);

    useEffect(() => {
        applyThemeToDom(theme);
    }, [theme, activeOrg?.id]);

    const toggleTheme = () => {
        localStorage.setItem(USER_OVERRIDE_KEY, 'true');
        setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    const setTheme = (newTheme: Theme) => {
        localStorage.setItem(USER_OVERRIDE_KEY, 'true');
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
