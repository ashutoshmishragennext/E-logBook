// src/stores/themeStore.ts
import { create } from 'zustand';

interface CollegeData {
  id: string;
  name: string;
  code: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderColor: string;
  successColor: string;
  errorColor: string;
  warningColor: string;
  infoColor: string;
  themeConfig: {
    shadows: boolean;
    darkMode: boolean;
    customCss?: string;
    animations: boolean;
    fontFamily: string;
    borderRadius: string;
  };
}

interface ThemeStore {
  collegeData: CollegeData | null;
  isLoading: boolean;
  setCollegeData: (data: CollegeData) => void;
  setLoading: (loading: boolean) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  collegeData: null,
  isLoading: true,
  setCollegeData: (data) => {
    // Apply theme to CSS variables
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--primary-color', data.primaryColor);
    root.style.setProperty('--secondary-color', data.secondaryColor);
    root.style.setProperty('--accent-color', data.accentColor);
    root.style.setProperty('--background-color', data.backgroundColor);
    root.style.setProperty('--surface-color', data.surfaceColor);
    root.style.setProperty('--text-primary', data.textPrimary);
    root.style.setProperty('--text-secondary', data.textSecondary);
    root.style.setProperty('--text-muted', data.textMuted);
    root.style.setProperty('--border-color', data.borderColor);
    root.style.setProperty('--success-color', data.successColor);
    root.style.setProperty('--error-color', data.errorColor);
    root.style.setProperty('--warning-color', data.warningColor);
    root.style.setProperty('--info-color', data.infoColor);

    // Apply theme config
    if (data.themeConfig.fontFamily) {
      root.style.setProperty('--font-family', data.themeConfig.fontFamily);
    }


    // Apply custom CSS if provided
    if (data.themeConfig.customCss) {
      // Remove existing custom CSS if any
      const existingStyle = document.getElementById('custom-theme-css');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
      
      const styleElement = document.createElement('style');
      styleElement.id = 'custom-theme-css';
      styleElement.textContent = data.themeConfig.customCss;
      document.head.appendChild(styleElement);
    }

    set({ collegeData: data });
  },
  setLoading: (loading) => set({ isLoading: loading }),
}));