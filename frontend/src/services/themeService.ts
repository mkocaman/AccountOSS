export type ThemeMode = 'light' | 'dark' | 'system' | 'semi-dark';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
}

/**
 * Tema yönetimi servisi
 */
export const themeService = {
  /**
   * Tema modunu localStorage'a kaydet
   */
  saveTheme: (mode: ThemeMode): void => {
    localStorage.setItem('theme-mode', mode);
  },

  /**
   * Kaydedilmiş tema modunu getir
   */
  getTheme: (): ThemeMode => {
    const saved = localStorage.getItem('theme-mode');
    return (saved as ThemeMode) || 'system';
  },

  /**
   * Sistem temasını algıla
   */
  getSystemTheme: (): 'light' | 'dark' => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  },

  /**
   * Aktif temayı hesapla (system mode için)
   */
  getActiveTheme: (mode: ThemeMode): 'light' | 'dark' | 'semi-dark' => {
    if (mode === 'system') {
      return themeService.getSystemTheme();
    }
    return mode as 'light' | 'dark' | 'semi-dark';
  },

  /**
   * Tema değişikliğini DOM'a uygula
   */
  applyTheme: (theme: 'light' | 'dark' | 'semi-dark'): void => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    
    // Body class'ı güncelle (Ant Design için)
    document.body.className = theme === 'dark' || theme === 'semi-dark' 
      ? 'dark-theme' 
      : 'light-theme';
  }
};
