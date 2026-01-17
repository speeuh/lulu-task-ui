import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  applyTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { user } = useAuth();

  const applyTheme = () => {
    if (!user) return;

    const root = document.documentElement;

    // Apply background color (always solid color now)
    const bgColor = user.themeValue && user.themeValue.startsWith('#') ? user.themeValue : '#FF9B8A';
    root.style.background = bgColor;
    root.style.backgroundImage = 'none';

    // Apply button color
    if (user.buttonColor) {
      root.style.setProperty('--button-color', user.buttonColor);
      root.style.setProperty('--button-hover-color', adjustColorBrightness(user.buttonColor, -10));
    }
  };

  // Helper function to adjust color brightness
  const adjustColorBrightness = (color: string, percent: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  };

  useEffect(() => {
    applyTheme();
  }, [user?.themeType, user?.themeValue, user?.buttonColor]);

  return (
    <ThemeContext.Provider value={{ applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

