'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

export function ThemeToggle() {
  const mounted = useMounted();
  const { resolvedTheme, setTheme } = useTheme();

  if (!mounted) {
    // Return placeholder with same dimensions to avoid layout shift
    return (
      <button
        className="flex h-9 w-9 items-center justify-center cursor-pointer"
        style={{
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-card)',
        }}
        aria-label="Toggle theme"
      />
    );
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="flex h-9 w-9 items-center justify-center cursor-pointer transition-colors"
      style={{
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-card)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-card)';
      }}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun size={16} style={{ color: 'var(--text-secondary)' }} />
      ) : (
        <Moon size={16} style={{ color: 'var(--text-secondary)' }} />
      )}
    </button>
  );
}
