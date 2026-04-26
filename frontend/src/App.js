import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./Landing";
import Dashboard from "./Dashboard";
import LiveTraffic from "./LiveTraffic";
import SystemHealth from "./SystemHealth";
import RecentActivity from "./RecentActivity";
import TrafficAnalysis from "./TrafficAnalysis";
import UsersPage from "./UsersPage";
import SettingsPage from "./SettingsPage";

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

          {/* Landing Page */}
          <Route
            path="/"
            element={<Landing />}
          />

          {/* Dashboard Overview */}
          <Route
            path="/dashboard"
            element={
              <Dashboard
                theme={theme}
                toggleTheme={toggleTheme}
              />
            }
          />

          {/* Live Traffic */}
          <Route
            path="/dashboard/live"
            element={
              <LiveTraffic
                theme={theme}
                toggleTheme={toggleTheme}
              />
            }
          />

          {/* System Health */}
          <Route
            path="/dashboard/health"
            element={
              <SystemHealth
                theme={theme}
                toggleTheme={toggleTheme}
              />
            }
          />

          {/* Recent Activity */}
          <Route
            path="/dashboard/activity"
            element={
              <RecentActivity
                theme={theme}
                toggleTheme={toggleTheme}
              />
            }
          />


            {/*traffic analysis*/}
                    <Route
  path="/analytics/traffic"
  element={
    <TrafficAnalysis
      theme={theme}
      toggleTheme={toggleTheme}
    />
  }
/>

 {/* Users Management */}
<Route
  path="/users"
  element={
    <UsersPage
      theme={theme}
      toggleTheme={toggleTheme}
    />
  }
/>
  
  {/* Settings Page */}
  
<Route
  path="/settings"
  element={
    <SettingsPage
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