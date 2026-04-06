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

function Dashboard() {
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

  // 🚀 Send request (FIXED + CLEAN)
  const sendRequest = async (userId) => {
    const token = localStorage.getItem("token");

    try {
      if (userId === "user1" && token) {
        // 🔐 Real user (JWT)
        await fetch("http://localhost:5000/api/protected", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        // ⚙️ Simulated users
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
    <div className="bg-slate-900 text-center mb-10 py-6 rounded-lg">
      <h1 className="text-3xl text-green-400 mb-2">
        API Rate Limiter & Throttler Analytics 🚀
      </h1>

      <h2 className="text-2xl font-bold text-white">
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
            className="bg-slate-800 p-6 rounded-xl shadow-lg mb-8"
          >
            {/* 🔥 Header */}
            <div className="flex justify-between items-center mb-4">
              
              {/* 👤 USER NAME + TYPE */}
              <div>
                <h3 className="text-sky-400 text-xl font-semibold">
                  👤 {user.userId}

                  {/* 🔐 JWT USER */}
                  {user.userId === "user1" && (
                    <span className="ml-2 text-xs bg-green-500 px-2 py-1 rounded text-white">
                      JWT User 🔐
                    </span>
                  )}

                  {/* ⚙️ SIMULATED USER */}
                  {user.userId !== "user1" && (
                    <span className="ml-2 text-xs bg-blue-500 px-2 py-1 rounded text-white">
                      Simulated ⚙️
                    </span>
                  )}
                </h3>

                {/* 🔍 ROUTE INFO */}
                <p className="text-xs text-gray-400 mt-1">
                  {user.userId === "user1"
                    ? "Route: /api/protected (JWT)"
                    : "Route: /api/public (Header-based)"}
                </p>
              </div>

              {/* 📊 STATS */}
              <div className="flex items-center gap-4 text-sm text-white">
                <span>Total: {user.total}</span>
                <span className="text-red-400">
                  Blocked: {user.blocked}
                </span>

                {/* STATUS */}
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
              <div className="bg-slate-900 p-4 rounded-lg">
                <h4 className="mb-2 text-white font-semibold">
                  📈 Requests Over Time
                </h4>

                <LineChart width={300} height={220} data={rpsData}>
                  <XAxis
                    dataKey="time"
                    stroke="#ffffff"
                    label={{
                      value: "Time",
                      position: "insideBottom",
                      offset: -5,
                      fill: "#ffffff",
                    }}
                  />

                  <YAxis
                    stroke="#ffffff"
                    label={{
                      value: "Requests",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#ffffff",
                    }}
                  />

                  <Tooltip />
                  <Line dataKey="requests" stroke="red" strokeWidth={2} />
                </LineChart>
              </div>

              {/* 📊 Allowed vs Blocked */}
              <div className="bg-slate-900 p-4 rounded-lg">
                <h4 className="mb-2 text-white font-semibold">
                  📊 Allowed vs Blocked
                </h4>

                <BarChart width={300} height={220} data={barData}>
                  <XAxis
                    dataKey="name"
                    stroke="#cbd5f5"
                    label={{
                      value: "Type",
                      position: "insideBottom",
                      offset: -5,
                      fill: "#cbd5f5",
                    }}
                  />

                  <YAxis
                    stroke="#cbd5f5"
                    label={{
                      value: "Count",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#cbd5f5",
                    }}
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
              <div className="bg-slate-900 p-4 rounded-lg">
                <h4 className="mb-2 text-white font-semibold">
                  📈 Rate Spikes
                </h4>

                <LineChart width={300} height={220} data={spikeData}>
                  <XAxis
                    dataKey="time"
                    stroke="#ffffff"
                    label={{
                      value: "Time",
                      position: "insideBottom",
                      offset: -5,
                      fill: "#ffffff",
                    }}
                  />

                  <YAxis
                    stroke="#ffffff"
                    label={{
                      value: "Requests",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#ffffff",
                    }}
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