import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SystemHealth({ theme, toggleTheme }) {
  const [health, setHealth] = useState({});
  const navigate = useNavigate();

  const isDark = theme === "dark";

  const colors = {
    bg: isDark ? "bg-slate-900" : "bg-slate-100",
    card: isDark ? "bg-slate-800" : "bg-white",
    text: isDark ? "text-white" : "text-black",
    subText: isDark ? "text-gray-400" : "text-gray-500",
  };

  const fetchHealth = () => {
    fetch("http://localhost:5000/health")
      .then((res) => res.json())
      .then((data) => setHealth(data));
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen flex ${colors.bg} ${colors.text}`}>

      {/* Sidebar */}
      <div className={`w-64 p-5 hidden md:block ${colors.card}`}>
        <h2 className="text-2xl font-bold text-green-500 mb-8">
          Rate Limiter 🚀
        </h2>

        <ul className={`${colors.subText} space-y-4`}>
          <li onClick={() => navigate("/dashboard")} className="cursor-pointer hover:text-green-400">Overview</li>
          <li onClick={() => navigate("/dashboard/live")} className="cursor-pointer hover:text-green-400">Live Traffic</li>
          <li className="text-green-400 font-bold">System Health</li>
          <li onClick={() => navigate("/dashboard/activity")} className="cursor-pointer hover:text-green-400">Recent Activity</li>
        </ul>
      </div>

      {/* Main */}
      <div className="flex-1 p-6">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">System Health 💻</h1>

          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded bg-gray-700 text-white"
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          <div className={`${colors.card} p-4 rounded-xl`}>
            <p className={colors.subText}>API Server</p>
            <h2 className="text-2xl">{health.server}</h2>
          </div>

          <div className={`${colors.card} p-4 rounded-xl`}>
            <p className={colors.subText}>Redis</p>
            <h2 className="text-2xl">{health.redis}</h2>
          </div>

          <div className={`${colors.card} p-4 rounded-xl`}>
            <p className={colors.subText}>MongoDB</p>
            <h2 className="text-2xl">{health.mongo}</h2>
          </div>

          <div className={`${colors.card} p-4 rounded-xl`}>
            <p className={colors.subText}>Uptime</p>
            <h2 className="text-2xl">{health.uptime}s</h2>
          </div>

          <div className={`${colors.card} p-4 rounded-xl`}>
            <p className={colors.subText}>Memory Usage</p>
            <h2 className="text-2xl">{health.memory}</h2>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SystemHealth;