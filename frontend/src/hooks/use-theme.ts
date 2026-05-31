import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * @deprecated Utiliser ThemeContext + ThemeBootstrap. Conserve pour compatibilite imports.
 */
export function useTheme() {
  const { user } = useAuth();

  useEffect(() => {
    // Ne plus forcer le mode clair — ThemeContext gere le theme via localStorage.
    if (user?.preferences?.darkMode && !localStorage.getItem('theme')) {
      document.documentElement.classList.add('dark');
    }
  }, [user?.preferences?.darkMode]);

  return {
    isDark: document.documentElement.classList.contains('dark'),
  };
}
