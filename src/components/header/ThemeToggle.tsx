'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(!document.documentElement.classList.contains('light'));
  }, []);

  function toggle() {
    const next = !(isDark ?? true);
    setIsDark(next);
    document.documentElement.classList.toggle('light', !next);
    try {
      localStorage.setItem('vn-theme', next ? 'dark' : 'light');
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      className="hidden rounded-md px-2 py-1.5 text-muted hover:bg-card-hover hover:text-foreground transition-colors cursor-pointer sm:inline-flex"
      aria-label="Toggle theme"
    >
      {isDark === false ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </button>
  );
}
