import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Tooltip,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";

function Dashboard({ theme, toggleTheme }) {
  const [data, setData] = useState([]);

  // 📊 Fetch analytics
  const fetchData = () => {
    fetch("http://localhost:5000/analytics")
      .then((res) => res.json())
      .then(setData);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // 🚀 Send request
  const sendRequest = async (userId) => {
    const token = localStorage.getItem("token");

    try {
      if (userId === "user1" && token) {
        await fetch("http://localhost:5000/api/protected", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await fetch("http://localhost:5000/api/public", {
          headers: {
            "user-id": userId,
          },
        });
      }

      fetchData();
    } catch (err) {
      console.error("Request failed:", err);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 text-black dark:text-white text-center mb-10 py-6 rounded-lg relative transition-all duration-300">

      {/* 🌗 Toggle Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600"
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      <h1 className="text-3xl text-green-400 mb-2">
        API Rate Limiter & Throttler Analytics 🚀
      </h1>

      <h2 className="text-2xl font-bold text-black dark:text-white">
        🚀 API Dashboard
      </h2>

      {/* 👤 USERS */}
      {data.map((user) => {
        const rpsData = (user.timestamps || [])
          .slice(-20)
          .map((t, i) => ({
            time: i + 1,
            requests: i + 1,
          }));

        const barData = [
          {
            name: "Allowed",
            value: (user.total || 0) - (user.blocked || 0),
          },
          {
            name: "Blocked",
            value: user.blocked || 0,
          },
        ];

        const spikeData = (user.timestamps || [])
          .slice(-20)
          .map((t, i) => ({
            time: i + 1,
            spike: Math.random() * 10,
          }));

        return (
          <div
            key={user.userId}
            className="bg-gray-200 dark:bg-slate-800 p-6 rounded-xl shadow-lg mb-8 transition-all duration-300"
          >
            {/* 🔥 Header */}
            <div className="flex justify-between items-center mb-4">

              <div>
                <h3 className="text-sky-500 text-xl font-semibold">
                  👤 {user.userId}

                  {user.userId === "user1" && (
                    <span className="ml-2 text-xs bg-green-500 px-2 py-1 rounded text-white">
                      JWT User 🔐
                    </span>
                  )}

                  {user.userId !== "user1" && (
                    <span className="ml-2 text-xs bg-blue-500 px-2 py-1 rounded text-white">
                      Simulated ⚙️
                    </span>
                  )}
                </h3>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {user.userId === "user1"
                    ? "Route: /api/protected (JWT)"
                    : "Route: /api/public (Header-based)"}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span>Total: {user.total}</span>
                <span className="text-red-500">
                  Blocked: {user.blocked}
                </span>

                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    user.blocked > 0
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-green-500 text-white"
                  }`}
                >
                  {user.blocked > 0 ? "🚨 Blocked" : "✅ Active"}
                </span>
              </div>
            </div>

            {/* 🔘 Button */}
            <div className="mb-4">
              <button
                onClick={() => sendRequest(user.userId)}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white"
              >
                Send Request
              </button>
            </div>

            {/* 📊 Graphs */}
            <div className="flex gap-6 flex-wrap mt-4">

              {/* 📈 Requests Over Time */}
              <div className="bg-gray-100 dark:bg-slate-900 p-4 rounded-lg">
                <h4 className="mb-2 font-semibold">
                  📈 Requests Over Time
                </h4>

                <LineChart width={300} height={220} data={rpsData}>
                  <XAxis
                    dataKey="time"
                    stroke={theme === "dark" ? "#ffffff" : "#000000"}
                  />
                  <YAxis
                    stroke={theme === "dark" ? "#ffffff" : "#000000"}
                  />
                  <Tooltip />
                  <Line dataKey="requests" stroke="red" strokeWidth={2} />
                </LineChart>
              </div>

              {/* 📊 Allowed vs Blocked */}
              <div className="bg-gray-100 dark:bg-slate-900 p-4 rounded-lg">
                <h4 className="mb-2 font-semibold">
                  📊 Allowed vs Blocked
                </h4>

                <BarChart width={300} height={220} data={barData}>
                  <XAxis
                    dataKey="name"
                    stroke={theme === "dark" ? "#ffffff" : "#000000"}
                  />
                  <YAxis
                    stroke={theme === "dark" ? "#ffffff" : "#000000"}
                  />
                  <Tooltip />

                  <Bar dataKey="value">
                    {barData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === "Blocked"
                            ? "#ef4444"
                            : "#22c55e"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </div>

              {/* 📈 Rate Spikes */}
              <div className="bg-gray-100 dark:bg-slate-900 p-4 rounded-lg">
                <h4 className="mb-2 font-semibold">
                  📈 Rate Spikes
                </h4>

                <LineChart width={300} height={220} data={spikeData}>
                  <XAxis
                    dataKey="time"
                    stroke={theme === "dark" ? "#ffffff" : "#000000"}
                  />
                  <YAxis
                    stroke={theme === "dark" ? "#ffffff" : "#000000"}
                  />
                  <Tooltip />
                  <Line dataKey="spike" stroke="green" strokeWidth={2} />
                </LineChart>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Dashboard;