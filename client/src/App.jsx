import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";

function App() {
  // Global theme initializer to persist across full app refreshes
  useEffect(() => {
    const applyTheme = (theme) => {
      const root = document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
      } else if (theme === "light") {
        root.classList.remove("dark");
      } else if (theme === "system") {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      }
    };

    const savedTheme = localStorage.getItem("theme") || "system";
    applyTheme(savedTheme);

    // Listen to system theme changes if set to system
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      if (localStorage.getItem("theme") === "system") {
        applyTheme("system");
      }
    };

    // Listen to changes from other tabs
    const handleStorageChange = (e) => {
      if (e.key === "theme") {
        applyTheme(e.newValue || "system");
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
