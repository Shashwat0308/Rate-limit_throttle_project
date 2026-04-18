import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900 text-white">

      {/* Navbar */}
      <div className="flex justify-between items-center px-10 py-6">
        <h1 className="text-xl font-bold text-green-400">
          RateLimiter 🚀
        </h1>

        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 border border-green-400 rounded-lg hover:bg-green-500 hover:text-black transition"
        >
          Dashboard
        </button>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center mt-24 px-4">

        <h2 className="text-5xl font-bold mb-6">
          Control Your API Traffic
        </h2>

        <p className="text-gray-300 max-w-2xl mb-8">
          Monitor requests, detect spikes, and apply rate limiting in real-time
          with a powerful analytics dashboard.
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="px-8 py-3 bg-green-500 hover:bg-green-600 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105"
        >
          Enter Dashboard →
        </button>

      </div>

      {/* Features */}
      <div className="mt-32 grid md:grid-cols-3 gap-8 px-10">

        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-green-400 text-xl mb-2">Real-Time Graphs</h3>
          <p className="text-gray-400">Track API requests live.</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-green-400 text-xl mb-2">Rate Limiting</h3>
          <p className="text-gray-400">Control traffic and avoid overload.</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-green-400 text-xl mb-2">Spike Detection</h3>
          <p className="text-gray-400">Detect sudden traffic increases.</p>
        </div>

      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 mt-20 pb-6">
        Built for API Monitoring ⚡
      </div>

    </div>
  );
}