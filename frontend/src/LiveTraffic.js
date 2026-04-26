import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function LiveTraffic({ theme, toggleTheme }) {
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
    const interval = setInterval(fetchLogs, 3000);
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
          <li className="text-green-400 font-bold">Live Traffic</li>
          <li onClick={() => navigate("/dashboard/health")} className="cursor-pointer hover:text-green-400">System Health</li>
          <li onClick={() => navigate("/dashboard/activity")} className="cursor-pointer hover:text-green-400">Recent Activity</li>
        </ul>
      </div>

      {/* Main */}
      <div className="flex-1 p-6">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Live Traffic 🚦</h1>

          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded bg-gray-700 text-white"
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className={`${colors.card} p-4 rounded-xl`}>
            <p className={colors.subText}>Total Logs</p>
            <h2 className="text-2xl">{logs.length}</h2>
          </div>

          <div className={`${colors.card} p-4 rounded-xl`}>
            <p className={colors.subText}>Latest Request</p>
            <h2 className="text-lg">
              {logs[0]?.route || "N/A"}
            </h2>
          </div>

          <div className={`${colors.card} p-4 rounded-xl`}>
            <p className={colors.subText}>Latest User</p>
            <h2 className="text-lg">
              {logs[0]?.userId || "N/A"}
            </h2>
          </div>
        </div>

        {/* Table */}
        <div className={`${colors.card} p-4 rounded-xl overflow-auto`}>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="p-2">Time</th>
                <th className="p-2">User</th>
                <th className="p-2">Route</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {logs.slice(0, 15).map((log, i) => (
                <tr key={i} className="border-b border-gray-700">
                  <td className="p-2">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-2">{log.userId || "Unknown"}</td>
                  <td className="p-2">{log.route || "N/A"}</td>
                  <td className="p-2">
                    <span
                      className={
                        log.blocked
                          ? "text-red-400"
                          : "text-green-400"
                      }
                    >
                      {log.blocked ? "Blocked" : "Allowed"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default LiveTraffic;