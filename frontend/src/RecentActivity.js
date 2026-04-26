import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function RecentActivity({ theme, toggleTheme }) {
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  const isDark = theme === "dark";

  const colors = {
    bg: isDark ? "bg-slate-900" : "bg-slate-100",
    card: isDark ? "bg-slate-800" : "bg-white",
    text: isDark ? "text-white" : "text-black",
    subText: isDark ? "text-gray-400" : "text-gray-500",
  };

  const fetchLogs = () => {
    fetch("http://localhost:5000/logs")
      .then((res) => res.json())
      .then((data) => setLogs(data));
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 4000);
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
          <li
            onClick={() => navigate("/dashboard")}
            className="cursor-pointer hover:text-green-400"
          >
            Overview
          </li>

          <li
            onClick={() => navigate("/dashboard/live")}
            className="cursor-pointer hover:text-green-400"
          >
            Live Traffic
          </li>

          <li
            onClick={() => navigate("/dashboard/health")}
            className="cursor-pointer hover:text-green-400"
          >
            System Health
          </li>

          <li className="text-green-400 font-bold">
            Recent Activity
          </li>
        </ul>
      </div>

      {/* Main */}
      <div className="flex-1 p-6">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Recent Activity 📊</h1>

          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded bg-gray-700 text-white"
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {logs.slice(0, 15).map((log, i) => (
            <div
              key={i}
              className={`${colors.card} p-4 rounded-xl flex justify-between items-center`}
            >
              <div>
                <p className="font-semibold">
                  {log.userId || "Unknown User"} hit{" "}
                  <span className="text-blue-400">
                    {log.route || "Unknown Route"}
                  </span>
                </p>

                <p className={`text-sm ${colors.subText}`}>
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>

              <span
                className={
                  log.blocked
                    ? "text-red-400 font-bold"
                    : "text-green-400 font-bold"
                }
              >
                {log.blocked ? "Blocked" : "Allowed"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecentActivity;