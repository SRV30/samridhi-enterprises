import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle = () => {
  const { setTheme, activeTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(activeTheme === 'dark' ? 'light' : 'dark')}
      style={{
        padding: 'var(--space-sm) var(--space-md)',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'var(--theme-transition)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-xs)',
      }}
      aria-label="Toggle Theme"
    >
      {activeTheme === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
};