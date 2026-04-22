import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Tooltip,
  Cell,
  Label,
} from "recharts";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard({ theme, toggleTheme }) {
  const [data, setData] = useState([]);
  const [openUser, setOpenUser] = useState(null);
  const navigate = useNavigate();

  const isDark = theme === "dark";

  const colors = {
    bg: isDark ? "bg-slate-900" : "bg-slate-100",
    card: isDark ? "bg-slate-800" : "bg-white",
    text: isDark ? "text-white" : "text-gray-800",
    subText: isDark ? "text-gray-400" : "text-gray-500",
  };

  // 📊 Fetch
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

  // 🚀 Request
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

  // 🔴 Reset
  const resetData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/reset", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      alert(data.message);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // 📊 Stats
  const totalRequests = data.reduce((a, u) => a + (u.total || 0), 0);
  const totalBlocked = data.reduce((a, u) => a + (u.blocked || 0), 0);
  const totalAllowed = totalRequests - totalBlocked;

  return (
    <div className={`flex min-h-screen ${colors.bg} ${colors.text}`}>

      {/* SIDEBAR */}
      <div className={`w-64 p-5 hidden md:block ${colors.card}`}>
        <h2 className="text-2xl font-bold text-green-500 mb-8">
          Rate Limiter 🚀
        </h2>

        <ul className={`${colors.subText} space-y-4`}>
          <li>Dashboard</li>
          <li>Analytics</li>
          <li>Users</li>
          <li>Settings</li>
        </ul>

        <button
          onClick={() => navigate("/")}
          className="mt-10 border px-3 py-1 rounded hover:bg-green-500 hover:text-black"
        >
          ← Home
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">

        {/* TOPBAR */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Dashboard 🚀</h1>

          <div className="flex gap-3">
            <button
              onClick={toggleTheme}
              className="px-3 py-1 rounded bg-gray-700 text-white"
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>

            <button
              onClick={resetData}
              className="px-4 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
            >
              Reset
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`${colors.card} p-4 rounded-xl`}>
            <p className={colors.subText}>Allowed</p>
            <h2 className="text-green-400 text-2xl">{totalAllowed}</h2>
          </div>

          <div className={`${colors.card} p-4 rounded-xl`}>
            <p className={colors.subText}>Blocked</p>
            <h2 className="text-red-400 text-2xl">{totalBlocked}</h2>
          </div>

          <div className={`${colors.card} p-4 rounded-xl`}>
            <p className={colors.subText}>Total</p>
            <h2 className="text-2xl">{totalRequests}</h2>
          </div>

          <div className={`${colors.card} p-4 rounded-xl`}>
            <p className={colors.subText}>Users</p>
            <h2 className="text-2xl">{data.length}</h2>
          </div>
        </div>

        {/* GLOBAL GRAPHS */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">

          {/* Requests */}
          <div className={`${colors.card} p-4 rounded-xl`}>
            <h4>Requests</h4>
            <LineChart width={300} height={200}
              data={data.flatMap(u => u.timestamps || []).slice(-20).map((_, i) => ({
                time: i + 1,
                requests: i + 1,
              }))}>
              <XAxis dataKey="time">
                <Label value="Time" position="insideBottom" />
              </XAxis>
              <YAxis>
                <Label value="Requests" angle={-90} position="insideLeft" />
              </YAxis>
              <Tooltip />
              <Line dataKey="requests" stroke="#3b82f6" />
            </LineChart>
          </div>

          {/* Allowed vs Blocked */}
          <div className={`${colors.card} p-4 rounded-xl`}>
            <h4>Allowed vs Blocked</h4>
            <BarChart width={300} height={200}
              data={[
                { name: "Allowed", value: totalAllowed || 0 },
                { name: "Blocked", value: totalBlocked || 0 },
              ]}>
              <XAxis dataKey="name">
                <Label value="Type" position="insideBottom" />
              </XAxis>
              <YAxis>
                <Label value="Count" angle={-90} position="insideLeft" />
              </YAxis>
              <Tooltip />
              <Bar dataKey="value" barSize={40}>
                <Cell fill="#22c55e" />
                <Cell fill="#ef4444" />
              </Bar>
            </BarChart>
          </div>

          {/* Spikes */}
          <div className={`${colors.card} p-4 rounded-xl`}>
            <h4>Spikes</h4>
            <LineChart width={300} height={200}
              data={data.flatMap(u => u.timestamps || []).slice(-20).map((_, i) => ({
                time: i + 1,
                spike: Math.random() * 10,
              }))}>
              <XAxis dataKey="time">
                <Label value="Time" position="insideBottom" />
              </XAxis>
              <YAxis>
                <Label value="Spike Level" angle={-90} position="insideLeft" />
              </YAxis>
              <Tooltip />
              <Line dataKey="spike" stroke="#10b981" />
            </LineChart>
          </div>

        </div>

        {/* USERS */}
        {data.map((user) => {
          const allowed = (user.total || 0) - (user.blocked || 0);

          const chartData = (user.timestamps || []).slice(-20).map((_, i) => ({
            time: i + 1,
            requests: i + 1,
            spike: Math.random() * 10,
          }));

          return (
            <div key={user.userId} className="mb-4">

              <div
                onClick={() =>
                  setOpenUser(openUser === user.userId ? null : user.userId)
                }
                className={`${colors.card} p-3 rounded cursor-pointer`}
              >
                👤 {user.userId}
              </div>

              {openUser === user.userId && (
                <div className={`${colors.card} p-4 mt-2 rounded`}>

                  <button
                    onClick={() => sendRequest(user.userId)}
                    className="bg-blue-500 text-white px-3 py-1 rounded mb-3"
                  >
                    Send Request
                  </button>

                  <div className="mb-4">
                    Total: {user.total} | Allowed: {allowed} | Blocked: {user.blocked}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">

                    {/* Requests */}
                    <LineChart width={250} height={150} data={chartData}>
                      <XAxis dataKey="time">
                        <Label value="Time" position="insideBottom" />
                      </XAxis>
                      <YAxis>
                        <Label value="Requests" angle={-90} position="insideLeft" />
                      </YAxis>
                      <Tooltip />
                      <Line dataKey="requests" stroke="#3b82f6" />
                    </LineChart>

                    {/* Allowed vs Blocked */}
                    <BarChart width={250} height={150}
                      data={[
                        { name: "Allowed", value: allowed },
                        { name: "Blocked", value: user.blocked || 0 },
                      ]}>
                      <XAxis dataKey="name">
                        <Label value="Type" position="insideBottom" />
                      </XAxis>
                      <YAxis>
                        <Label value="Count" angle={-90} position="insideLeft" />
                      </YAxis>
                      <Tooltip />
                      <Bar dataKey="value" barSize={30}>
                        <Cell fill="#22c55e" />
                        <Cell fill="#ef4444" />
                      </Bar>
                    </BarChart>

                    {/* Spikes */}
                    <LineChart width={250} height={150} data={chartData}>
                      <XAxis dataKey="time">
                        <Label value="Time" position="insideBottom" />
                      </XAxis>
                      <YAxis>
                        <Label value="Spike Level" angle={-90} position="insideLeft" />
                      </YAxis>
                      <Tooltip />
                      <Line dataKey="spike" stroke="#10b981" />
                    </LineChart>

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