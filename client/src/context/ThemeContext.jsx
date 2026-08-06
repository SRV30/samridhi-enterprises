import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

// Resolve the starting theme: an explicit saved choice wins; otherwise fall
// back to the OS preference. (Mirrored by the inline anti-flash script in
// index.html so the page paints in the right theme before React mounts.)
const getInitialTheme = () => {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch (err) {
    return "light";
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme);

  // Reflect the active theme on the <html> element whenever it changes.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Explicit user choice — persisted, so it overrides the OS preference.
  const setTheme = (next) => {
    try {
      localStorage.setItem("theme", next);
    } catch (err) {
      // storage unavailable (private mode / quota) — in-memory state still works
    }
    setThemeState(next);
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  // While the user has not made an explicit choice, follow the OS theme live.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      let stored = null;
      try {
        stored = localStorage.getItem("theme");
      } catch (err) {
        // ignore
      }
      if (!stored) setThemeState(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
