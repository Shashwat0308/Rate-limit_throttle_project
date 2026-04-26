import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SettingsPage({ theme, toggleTheme }) {
  const navigate = useNavigate();

  const isDark = theme === "dark";

  const colors = {
    bg: isDark ? "bg-slate-900" : "bg-slate-100",
    card: isDark ? "bg-slate-800" : "bg-white",
    text: isDark ? "text-white" : "text-black",
    subText: isDark ? "text-gray-400" : "text-gray-500",
  };

  const [enabled, setEnabled] = useState(true);

  return (
    <div className={`min-h-screen flex ${colors.bg} ${colors.text}`}>
      {/* Sidebar */}
      <div className={`w-64 p-5 hidden md:block ${colors.card}`}>
        <h2 className="text-2xl font-bold text-green-500 mb-8">
          Settings ⚙️
        </h2>

        <button
          onClick={() => navigate("/dashboard")}
          className="border px-3 py-1 rounded hover:bg-green-500 hover:text-black"
        >
          ← Dashboard
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 p-6">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Settings ⚙️</h1>

          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded bg-gray-700 text-white"
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Change Limits */}
          <div className={`${colors.card} p-5 rounded-xl`}>
            <h3 className="text-xl mb-4">Rate Limit Configuration</h3>

            <input
              type="number"
              placeholder="Capacity"
              className="w-full p-2 mb-3 rounded text-black"
            />

            <input
              type="number"
              placeholder="Window (sec)"
              className="w-full p-2 mb-3 rounded text-black"
            />

            <button className="bg-green-500 px-4 py-2 rounded">
              Save
            </button>
          </div>

          {/* Toggle */}
          <div className={`${colors.card} p-5 rounded-xl`}>
            <h3 className="text-xl mb-4">Enable / Disable Limiter</h3>

            <button
              onClick={() => setEnabled(!enabled)}
              className={`px-4 py-2 rounded ${
                enabled ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {enabled ? "Enabled" : "Disabled"}
            </button>
          </div>

          {/* Export Logs */}
          <div className={`${colors.card} p-5 rounded-xl`}>
            <h3 className="text-xl mb-4">Export Logs</h3>

            <button className="bg-blue-500 px-4 py-2 rounded">
              Export CSV
            </button>
          </div>

          {/* Alerts */}
          <div className={`${colors.card} p-5 rounded-xl`}>
            <h3 className="text-xl mb-4">Alert Threshold</h3>

            <input
              type="number"
              placeholder="Blocked request threshold"
              className="w-full p-2 mb-3 rounded text-black"
            />

            <button className="bg-yellow-500 px-4 py-2 rounded">
              Set Alert
            </button>
          </div>

          {/* Security */}
          <div className={`${colors.card} p-5 rounded-xl`}>
            <h3 className="text-xl mb-4">Security Settings</h3>

            <button className="bg-red-500 px-4 py-2 rounded mr-2">
              Logout All
            </button>

            <button className="bg-purple-500 px-4 py-2 rounded">
              Rotate Key
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SettingsPage;