import { LineChart, Line, XAxis, YAxis, BarChart, Bar } from "recharts";
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
    <div className="bg-slate-900 min-h-screen p-5 text-white">
      <h1 className="text-5xl text-red-500">TEST</h1>

      {/* ✅ Test Tailwind */}
      <h1 className="text-3xl text-green-500 mb-4">Tailwind Working 🚀</h1>

      {/* 🔥 Heading */}
      <h2 className="text-2xl font-bold mb-5">🚀 API Dashboard</h2>

      {/* 🔘 Buttons */}
      <div className="mb-5">
        {Array.from({ length: 10 }, (_, i) => `user${i + 1}`).map(u => (
          <button
            key={u}
            onClick={() => sendRequest(u)}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg m-1"
          >
            {u}
          </button>
        ))}
      </div>

      {/* 👤 USERS */}
      {data.map(user => {

        const rpsData = (user.timestamps || [])
          .slice(-20)
          .map((t, i) => ({
            time: i + 1,
            requests: i + 1
          }));

        const barData = [
          { name: "Allowed", value: Number(user.allowed || 0) },
          { name: "Blocked", value: Number(user.blocked || 0) }
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
            className="bg-slate-800 p-5 rounded-xl shadow-lg mb-5"
          >
            {/* 👤 User */}
            <h3 className="text-sky-400 text-lg mb-2">{user.userId}</h3>
            <p>Total: {user.total}</p>
            <p className="mb-4">Blocked: {user.blocked}</p>

            {/* 📊 Graphs */}
            <div className="flex gap-6 flex-wrap">

              {/* 🔴 Requests */}
              <div className="bg-slate-900 p-3 rounded-lg">
                <h4 className="mb-2">📈 Requests Over Time</h4>
                <LineChart width={300} height={220} data={rpsData}>
                  <XAxis 
                    dataKey="time" 
                    label={{ value: "Time", position: "insideBottom", offset: -5 }} 
                  />
                  <YAxis 
                    label={{ value: "Requests", angle: -90, position: "insideLeft" }} 
                  />
                  <Line dataKey="requests" stroke="red" strokeWidth={2} />
                </LineChart>
              </div>

              {/* 🔵 Allowed vs Blocked */}
              <div className="bg-slate-900 p-3 rounded-lg">
                <h4 className="mb-2">📊 Allowed vs Blocked</h4>
                <BarChart width={300} height={220} data={barData}>
                  <XAxis 
                    dataKey="name" 
                    label={{ value: "Type", position: "insideBottom", offset: -5 }} 
                  />
                  <YAxis 
                    label={{ value: "Count", angle: -90, position: "insideLeft" }} 
                  />
                  <Bar dataKey="value" fill="blue" />
                </BarChart>
              </div>

              {/* 📊 Spikes */}
              <div className="bg-slate-900 p-3 rounded-lg">
                <h4 className="mb-2">📈 Rate Spikes</h4>
                <LineChart width={300} height={220} data={spikeData}>
                  <XAxis 
                    dataKey="time" 
                    label={{ value: "Time", position: "insideBottom", offset: -5 }} 
                  />
                  <YAxis 
                    label={{ value: "Spike", angle: -90, position: "insideLeft" }} 
                  />
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