import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

/** Applique les preferences utilisateur si aucun theme local n'est enregistre. */
export function ThemeBootstrap() {
  const { user } = useAuth();
  const { setTheme } = useTheme();

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return;
    if (user?.preferences?.darkMode) {
      setTheme('dark');
    }
  }, [user?.id, user?.preferences?.darkMode, setTheme]);

  return null;
}
