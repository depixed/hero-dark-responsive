import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Create a unique ID for this component instance - used to force re-renders
const THEME_CHANGE_EVENT = 'themechange';

// Hook that forces component re-renders when theme changes
export const useThemeForceUpdate = () => {
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    const handleThemeChange = () => forceUpdate({});
    document.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    return () => document.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  }, []);
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check local storage for saved theme or default to dark
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('dashboard-theme');
    return (savedTheme as Theme) || 'dark';
  });

  // Set theme is now more comprehensive - updates multiple places
  const setTheme = useCallback((newTheme: Theme) => {
    // Update state
    setThemeState(newTheme);
    
    // Update local storage
    localStorage.setItem('dashboard-theme', newTheme);
    
    // Update document element with a data attribute
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Apply theme class to body for global CSS access
    if (newTheme === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    }
    
    // Dispatch a custom event that component can listen to
    document.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: newTheme }));
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    // Update document with the current theme
    setTheme(theme);
    
    // Create event listener for theme changes from other instances
    const handleThemeChange = () => {
      // Force a re-render of all components using the theme context
      const currentTheme = localStorage.getItem('dashboard-theme') as Theme || 'dark';
      setThemeState(currentTheme);
    };
    
    // Add event listener for theme changes
    document.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    
    // Clean up
    return () => {
      document.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    };
  }, [setTheme]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  const contextValue = React.useMemo(() => ({
    theme,
    toggleTheme,
    setTheme
  }), [theme, toggleTheme, setTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  // Force component to update when theme changes 
  useThemeForceUpdate();
  
  return context;
}; 