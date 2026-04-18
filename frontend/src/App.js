import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
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
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Landing />}
          />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                theme={theme}
                toggleTheme={toggleTheme}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;