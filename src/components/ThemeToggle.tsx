'use client';

import { Moon, Sun } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

const themeKey = 'site-theme';

type Theme = 'dark' | 'light';

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    window.localStorage.setItem(themeKey, nextTheme);
    setTheme(nextTheme);
  }

  return (
    <button
      className={className}
      type="button"
      onClick={toggleTheme}
      aria-label={`Use ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Use ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <Sun className="theme-icon-light" weight="regular" aria-hidden="true" />
      <Moon className="theme-icon-dark" weight="regular" aria-hidden="true" />
    </button>
  );
}
