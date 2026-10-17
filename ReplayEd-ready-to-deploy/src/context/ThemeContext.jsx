import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('ps2_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
      // localStorage may fail in private browsing mode
    }

    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    try {
      localStorage.setItem('ps2_theme', theme);
    } catch (e) {
      // Ignore storage error
    }

    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, monacoTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'dark',
      toggleTheme: () => {},
      monacoTheme: 'vs-dark',
    };
  }
  return context;
}
