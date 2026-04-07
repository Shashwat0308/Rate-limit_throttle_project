import { useState } from "react";

function Login() {
  const [username, setUsername] = useState("user1");
  const [password, setPassword] = useState("password123");

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        alert("Login successful ✅");
      } else {
        alert("Login failed ❌");
      }

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-slate-900 text-white p-6 rounded-lg">
      <h2 className="text-xl mb-4">Login</h2>

      <input
        className="block mb-2 p-2 text-black"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        className="block mb-4 p-2 text-black"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        className="bg-green-500 px-4 py-2 rounded"
      >
        Login
      </button>
    </div>
  );
}

export default Login;