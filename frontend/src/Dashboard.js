import { LineChart, Line, XAxis, YAxis, BarChart, Bar, Tooltip, Cell } from "recharts";
import { useEffect, useState } from "react";

function Dashboard() {
  const [data, setData] = useState([]);

  const fetchData = () => {
    fetch("http://localhost:5000/analytics")
      .then(res => res.json())
      .then(setData);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const sendRequest = (userId) => {
    fetch("http://localhost:5000/api/public", {
      headers: { "user-id": userId }
    })
      .then(res => res.json())
      .then(() => fetchData());
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
      {data.map(user => {

        const rpsData = (user.timestamps || [])
          .slice(-20)
          .map((t, i) => ({
            time: i + 1,
            requests: i + 1
          }));

        const barData = [
          { name: "Allowed", value: (user.total || 0) - (user.blocked || 0) },
          { name: "Blocked", value: user.blocked || 0 }
        ];

        const spikeData = (user.timestamps || [])
          .slice(-20)
          .map((t, i) => ({
            time: i + 1,
            spike: Math.random() * 10
          }));

        return (
          <div
            key={user.userId}
            className="bg-slate-800 p-6 rounded-xl shadow-lg mb-8"
          >

            {/* 🔥 User Header + STATUS */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sky-400 text-xl font-semibold">
                👤 {user.userId}
              </h3>

              <div className="flex items-center gap-4 text-sm">
                <span>Total: {user.total}</span>
                <span className="text-red-400">Blocked: {user.blocked}</span>

                {/* 🔥 STATUS BADGE */}
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

            {/* 🔘 Button per user */}
            <div className="mb-4">
              <button
                onClick={() => sendRequest(user.userId)}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg"
              >
                Send Request
              </button>
            </div>

            {/* 📊 Graphs */}
            <div className="flex gap-6 flex-wrap mt-4">

              {/* 🔴 Requests Over Time */}
              <div className="bg-slate-900 p-4 rounded-lg">
                <h4 className="mb-2">📈 Requests Over Time</h4>
                <LineChart width={300} height={220} data={rpsData}>
                  <XAxis
                    dataKey="time"
                    label={{ value: "Time", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis
                    label={{ value: "Requests", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip />
                  <Line dataKey="requests" stroke="red" strokeWidth={2} />
                </LineChart>
              </div>

              {/* 🔵 Allowed vs Blocked */}
              <div className="bg-slate-900 p-4 rounded-lg">
                <h4 className="mb-2">📊 Allowed vs Blocked</h4>
                <BarChart width={300} height={220} data={barData}>
                  <XAxis
                    dataKey="name"
                    label={{ value: "Type", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis
                    label={{ value: "Count", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip />
                  <Bar dataKey="value">
                    {barData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.name === "Blocked" ? "#ef4444" : "#22c55e"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </div>

              {/* 📊 Rate Spikes */}
              <div className="bg-slate-900 p-4 rounded-lg">
                <h4 className="mb-2">📈 Rate Spikes</h4>
                <LineChart width={300} height={220} data={spikeData}>
                  <XAxis
                    dataKey="time"
                    label={{ value: "Time", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis
                    label={{ value: "Spike", angle: -90, position: "insideLeft" }}
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