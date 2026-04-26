import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";

function TrafficAnalysis({ theme, toggleTheme }) {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const isDark = theme === "dark";

  const colors = {
    bg: isDark ? "bg-slate-900" : "bg-slate-100",
    card: isDark ? "bg-slate-800" : "bg-white",
    text: isDark ? "text-white" : "text-black",
    subText: isDark ? "text-gray-400" : "text-gray-500",
  };

  const fetchData = () => {
    fetch("http://localhost:5000/analytics")
      .then((res) => res.json())
      .then(setData);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const totalRequests = data.reduce((a, u) => a + (u.total || 0), 0);
  const totalBlocked = data.reduce((a, u) => a + (u.blocked || 0), 0);
  const totalAllowed = totalRequests - totalBlocked;

  const graphData = [
    { name: "Allowed", value: totalAllowed },
    { name: "Blocked", value: totalBlocked },
    { name: "Total", value: totalRequests },
  ];

  return (
    <div className={`min-h-screen flex ${colors.bg} ${colors.text}`}>
      {/* Sidebar */}
      <div className={`w-64 p-5 hidden md:block ${colors.card}`}>
        <h2 className="text-2xl font-bold text-green-500 mb-8">
          Analytics 📈
        </h2>

        <ul className={`${colors.subText} space-y-4`}>
          <li className="text-green-400 font-bold">Traffic Analysis</li>
          <li>Endpoint Usage</li>
          <li>Peak Hours</li>
        </ul>

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-10 border px-3 py-1 rounded hover:bg-green-500 hover:text-black"
        >
          ← Dashboard
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 p-6">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Traffic Analysis 📊</h1>

          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded bg-gray-700 text-white"
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className={`${colors.card} p-4 rounded-xl`}>
            <p>Total Requests</p>
            <h2 className="text-2xl">{totalRequests}</h2>
          </div>

          <div className={`${colors.card} p-4 rounded-xl`}>
            <p>Allowed Requests</p>
            <h2 className="text-green-400 text-2xl">{totalAllowed}</h2>
          </div>

          <div className={`${colors.card} p-4 rounded-xl`}>
            <p>Blocked Requests</p>
            <h2 className="text-red-400 text-2xl">{totalBlocked}</h2>
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className={`${colors.card} p-4 rounded-xl`}>
            <h3 className="mb-4">Requests Overview</h3>
            <BarChart width={400} height={250} data={graphData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                <Cell fill="#22c55e" />
                <Cell fill="#ef4444" />
                <Cell fill="#3b82f6" />
              </Bar>
            </BarChart>
          </div>

          <div className={`${colors.card} p-4 rounded-xl`}>
            <h3 className="mb-4">Top Users</h3>
            <LineChart
              width={400}
              height={250}
              data={data.map((u) => ({
                user: u.userId,
                total: u.total,
              }))}
            >
              <XAxis dataKey="user" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#10b981" />
            </LineChart>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrafficAnalysis;