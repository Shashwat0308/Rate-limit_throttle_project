import { useState, useEffect } from "react";
import Dashboard from "./Dashboard";

function App() {
  const [theme, setTheme] = useState("dark");

  // 💾 Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // 💾 Save theme
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 🌗 Toggle function
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <Dashboard theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
}

export default App;