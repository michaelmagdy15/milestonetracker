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
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    root.style.colorScheme = theme;
    root.style.backgroundColor = theme === 'dark' ? '#0b0f19' : '#f8fafc';
    localStorage.setItem(STORAGE_KEY, theme);
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { activeOrg } = useTenant();
    const [theme, setThemeState] = useState<Theme>(() => getInitialTheme(activeOrg?.id));

    // Automatically align default theme when switching between DEC Portal (dark) and Nexus (light)
    // unless the user manually toggled the theme in the current session.
    useEffect(() => {
        const manual = localStorage.getItem(USER_OVERRIDE_KEY);
        if (manual !== 'true') {
            const nextTheme: Theme = activeOrg?.id === DEC_ORG_ID ? 'dark' : 'light';
            setThemeState(nextTheme);
        }
    }, [activeOrg?.id]);

    useEffect(() => {
        applyThemeToDom(theme);
    }, [theme]);

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
