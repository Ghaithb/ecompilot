import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useTheme() {
  const { user } = useAuth();

  useEffect(() => {
    const isDark = user?.preferences?.darkMode ?? false;
    
    if (isDark) {
      document.documentElement.classList.add('dark');
      console.log('🌙 Dark mode activated');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('☀️ Light mode activated');
    }
  }, [user?.preferences?.darkMode]);

  return {
    isDark: user?.preferences?.darkMode ?? false,
  };
}
