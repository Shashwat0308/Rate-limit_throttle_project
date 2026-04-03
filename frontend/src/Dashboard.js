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
    <div style={{ padding: "20px" }}>
      <h2>API Dashboard</h2>

      {/* 🔘 Buttons */}
      <div style={{ marginBottom: "20px" }}>
        {Array.from({ length: 10 }, (_, i) => `user${i + 1}`).map(u => (
          <button
            key={u}
            onClick={() => sendRequest(u)}
            style={{ margin: "5px", padding: "8px" }}
          >
            {u}
          </button>
        ))}
      </div>

      {/* 👤 USERS */}
      {data.map(user => {

        // 🔴 Requests per second (last 20)
        const rpsData = (user.timestamps || [])
          .slice(-20)
          .map((t, i) => ({
            time: i + 1,
            requests: i + 1
          }));

        // 🔵 Allowed vs Blocked
        const barData = [
          { name: "Allowed", value: Number(user.allowed || 0) },
          { name: "Blocked", value: Number(user.blocked || 0) }
        ];

        // 📊 Rate spikes (simulated)
        const spikeData = (user.timestamps || [])
          .slice(-20)
          .map((t, i) => ({
            time: i + 1,
            spike: Math.random() * 10
          }));

        return (
          <div
            key={user.userId}
            style={{
              border: "1px solid gray",
              margin: "10px",
              padding: "10px",
              borderRadius: "10px"
            }}
          >
            <h3>{user.userId}</h3>
            <p>Total: {user.total}</p>
            <p>Blocked: {user.blocked}</p>

           <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>

  {/* 🔴 Requests Over Time */}
  <div>
    <h4>Requests Over Time</h4>
    <LineChart width={300} height={200} data={rpsData}>
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
  <div>
    <h4>Allowed vs Blocked</h4>
    <BarChart width={300} height={200} data={barData}>
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

  {/* 📊 Rate Spikes */}
  <div>
    <h4>Rate Spikes</h4>
    <LineChart width={300} height={200} data={spikeData}>
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