import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Tooltip,
  Cell,
  Label
} from "recharts";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard({ theme, toggleTheme }) {
  const [data, setData] = useState([]);
  const [openUser, setOpenUser] = useState(null);
  const navigate = useNavigate();

  // 📊 Fetch data
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
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await fetch("http://localhost:5000/api/public", {
          headers: { "user-id": userId },
        });
      }
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 GLOBAL STATS
  const totalRequests = data.reduce((acc, u) => acc + (u.total || 0), 0);
  const totalBlocked = data.reduce((acc, u) => acc + (u.blocked || 0), 0);
  const totalAllowed = totalRequests - totalBlocked;

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-900 text-black dark:text-white transition-all duration-300">

      {/* 🧭 SIDEBAR */}
      <div className="w-64 bg-gray-100 dark:bg-slate-800 p-5 hidden md:block">
        <h2 className="text-2xl font-bold text-green-500 mb-8">
          Rate Limiter 🚀
        </h2>

        <ul className="space-y-4 text-gray-600 dark:text-gray-300">
          <li className="hover:text-green-500 cursor-pointer">Dashboard</li>
          <li className="hover:text-green-500 cursor-pointer">Analytics</li>
          <li className="hover:text-green-500 cursor-pointer">Users</li>
          <li className="hover:text-green-500 cursor-pointer">Settings</li>
        </ul>

        <div className="mt-10">
          <button
            onClick={() => navigate("/")}
            className="text-sm border border-green-500 px-3 py-1 rounded hover:bg-green-500 hover:text-black"
          >
            ← Home
          </button>
        </div>
      </div>

      {/* 📊 MAIN */}
      <div className="flex-1 p-6">

        {/* 🔝 TOPBAR */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard 🚀</h1>

          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600"
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* 📊 STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-200 dark:bg-slate-800 p-4 rounded-2xl">
            <p className="text-gray-500">Allowed</p>
            <h2 className="text-2xl text-green-500">{totalAllowed}</h2>
          </div>

          <div className="bg-gray-200 dark:bg-slate-800 p-4 rounded-2xl">
            <p className="text-gray-500">Blocked</p>
            <h2 className="text-2xl text-red-500">{totalBlocked}</h2>
          </div>

          <div className="bg-gray-200 dark:bg-slate-800 p-4 rounded-2xl">
            <p className="text-gray-500">Total</p>
            <h2 className="text-2xl">{totalRequests}</h2>
          </div>

          <div className="bg-gray-200 dark:bg-slate-800 p-4 rounded-2xl">
            <p className="text-gray-500">Users</p>
            <h2 className="text-2xl">{data.length}</h2>
          </div>
        </div>

        {/* 🌐 GLOBAL OVERVIEW */}
        <h2 className="text-xl mb-4">🌐 Global Overview</h2>

        <div className="grid md:grid-cols-3 gap-6 mb-10">

          {/* Requests */}
          <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl">
            <h4>Requests Over Time</h4>
            <LineChart width={300} height={220}
              data={data.flatMap(u => u.timestamps || []).slice(-20).map((_, i) => ({
                time: i + 1,
                requests: i + 1,
              }))}>
              <XAxis dataKey="time" stroke={theme === "dark" ? "#fff" : "#000"}>
                <Label value="Time" position="insideBottom" fill={theme === "dark" ? "#fff" : "#000"} />
              </XAxis>
              <YAxis stroke={theme === "dark" ? "#fff" : "#000"}>
                <Label value="Requests" angle={-90} position="insideLeft" fill={theme === "dark" ? "#fff" : "#000"} />
              </YAxis>
              <Tooltip />
              <Line dataKey="requests" stroke="red" />
            </LineChart>
          </div>

          {/* Allowed vs Blocked */}
          <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl">
            <h4>Allowed vs Blocked</h4>
            <BarChart width={300} height={220}
              data={[
                { name: "Allowed", value: totalAllowed },
                { name: "Blocked", value: totalBlocked },
              ]}>
              <XAxis dataKey="name" stroke={theme === "dark" ? "#fff" : "#000"}>
                <Label value="Type" position="insideBottom" fill={theme === "dark" ? "#fff" : "#000"} />
              </XAxis>
              <YAxis stroke={theme === "dark" ? "#fff" : "#000"}>
                <Label value="Count" angle={-90} position="insideLeft" fill={theme === "dark" ? "#fff" : "#000"} />
              </YAxis>
              <Tooltip />
              <Bar dataKey="value">
                <Cell fill="#22c55e" />
                <Cell fill="#ef4444" />
              </Bar>
            </BarChart>
          </div>

          {/* Spikes */}
          <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl">
            <h4>Rate Spikes</h4>
            <LineChart width={300} height={220}
              data={data.flatMap(u => u.timestamps || []).slice(-20).map((_, i) => ({
                time: i + 1,
                spike: Math.floor(Math.random() * 10),
              }))}>
              <XAxis dataKey="time" stroke={theme === "dark" ? "#fff" : "#000"}>
                <Label value="Time" position="insideBottom" fill={theme === "dark" ? "#fff" : "#000"} />
              </XAxis>
              <YAxis stroke={theme === "dark" ? "#fff" : "#000"}>
                <Label value="Spike Level" angle={-90} position="insideLeft" fill={theme === "dark" ? "#fff" : "#000"} />
              </YAxis>
              <Tooltip />
              <Line dataKey="spike" stroke="green" />
            </LineChart>
          </div>

        </div>

        {/* 👤 USER ACCORDION */}
        <h2 className="text-xl mb-6">👤 User Analytics</h2>

        {data.map((user) => {
          const allowed = (user.total || 0) - (user.blocked || 0);

          const rpsData = (user.timestamps || []).slice(-20).map((_, i) => ({
            time: i + 1,
            requests: i + 1,
          }));

          const spikeData = (user.timestamps || []).slice(-20).map((_, i) => ({
            time: i + 1,
            spike: Math.floor(Math.random() * 10),
          }));

          return (
            <div key={user.userId} className="mb-4">

              {/* HEADER */}
              <div
                onClick={() =>
                  setOpenUser(openUser === user.userId ? null : user.userId)
                }
                className="bg-gray-200 dark:bg-slate-800 p-4 rounded-xl flex justify-between cursor-pointer"
              >
                <span>👤 {user.userId}</span>
                <span>{openUser === user.userId ? "▲" : "▼"}</span>
              </div>

              {/* CONTENT */}
              {openUser === user.userId && (
                <div className="bg-gray-100 dark:bg-slate-800 p-6 rounded-xl mt-2">

                  <button
                    onClick={() => sendRequest(user.userId)}
                    className="mb-4 bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Send Request
                  </button>

                  <div className="flex gap-6 mb-4 text-sm">
                    <span>Total: {user.total}</span>
                    <span>Allowed: {allowed}</span>
                    <span className="text-red-500">Blocked: {user.blocked}</span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">

                    {/* Requests */}
                    <div>
                      <h4 className="text-sm text-center mb-2">Requests Over Time</h4>
                      <LineChart width={280} height={200} data={rpsData}>
                        <XAxis dataKey="time" stroke={theme === "dark" ? "#fff" : "#000"}>
                          <Label value="Time" position="insideBottom" fill={theme === "dark" ? "#fff" : "#000"} />
                        </XAxis>
                        <YAxis stroke={theme === "dark" ? "#fff" : "#000"}>
                          <Label value="Requests" angle={-90} position="insideLeft" fill={theme === "dark" ? "#fff" : "#000"} />
                        </YAxis>
                        <Tooltip />
                        <Line dataKey="requests" stroke="red" />
                      </LineChart>
                    </div>

                    {/* Bar */}
                    <div>
                      <h4 className="text-sm text-center mb-2">Allowed vs Blocked</h4>
                      <BarChart width={280} height={200}
                        data={[
                          { name: "Allowed", value: allowed },
                          { name: "Blocked", value: user.blocked || 0 },
                        ]}>
                        <XAxis dataKey="name" stroke={theme === "dark" ? "#fff" : "#000"}>
                          <Label value="Type" position="insideBottom" fill={theme === "dark" ? "#fff" : "#000"} />
                        </XAxis>
                        <YAxis stroke={theme === "dark" ? "#fff" : "#000"}>
                          <Label value="Count" angle={-90} position="insideLeft" fill={theme === "dark" ? "#fff" : "#000"} />
                        </YAxis>
                        <Tooltip />
                        <Bar dataKey="value">
                          <Cell fill="#22c55e" />
                          <Cell fill="#ef4444" />
                        </Bar>
                      </BarChart>
                    </div>

                    {/* Spikes */}
                    <div>
                      <h4 className="text-sm text-center mb-2">Rate Spikes</h4>
                      <LineChart width={280} height={200} data={spikeData}>
                        <XAxis dataKey="time" stroke={theme === "dark" ? "#fff" : "#000"}>
                          <Label value="Time" position="insideBottom" fill={theme === "dark" ? "#fff" : "#000"} />
                        </XAxis>
                        <YAxis stroke={theme === "dark" ? "#fff" : "#000"}>
                          <Label value="Spike Level" angle={-90} position="insideLeft" fill={theme === "dark" ? "#fff" : "#000"} />
                        </YAxis>
                        <Tooltip />
                        <Line dataKey="spike" stroke="green" />
                      </LineChart>
                    </div>

                  </div>

                </div>
              )}

            </div>
          );
        })}

      </div>
    </div>
  );
}

export default Dashboard;