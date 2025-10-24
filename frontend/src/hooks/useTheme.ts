import { useState, useEffect } from 'react';
import { themeService } from '../services/themeService';
import type { ThemeMode } from '../services/themeService';

/**
 * Tema yönetimi hook'u
 */
export const useTheme = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(themeService.getTheme());

  // Sistem teması değiştiğinde dinle
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (themeMode === 'system') {
        const activeTheme = themeService.getActiveTheme('system');
        themeService.applyTheme(activeTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  // İlk yüklemede temayı uygula
  useEffect(() => {
    const activeTheme = themeService.getActiveTheme(themeMode);
    themeService.applyTheme(activeTheme);
  }, [themeMode]);

  const changeTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    themeService.saveTheme(mode);
    
    const activeTheme = themeService.getActiveTheme(mode);
    themeService.applyTheme(activeTheme);
  };

  const activeTheme = themeService.getActiveTheme(themeMode);

  return {
    themeMode,
    activeTheme,
    changeTheme
  };
};
