import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Login() {
  const [mode, setMode] = useState("admin"); // 'admin' | 'user' | 'register'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (token && storedUser) {
      if (storedUser.role === "admin") navigate("/admin/dashboard", { replace: true });
      else navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      if (user.role === "admin") navigate("/admin/dashboard");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email) {
      setError("Please enter email or phone to receive OTP.");
      return;
    }
    try {
      await api.post("/auth/send-otp", { identifier: email });
      setOtpSent(true);
      setSuccess("OTP sent. Check your email or phone.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email || !otp) {
      setError("Please provide identifier and OTP.");
      return;
    }
    try {
      const res = await api.post("/auth/verify-otp", { identifier: email, otp });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      if (user.role === "admin") navigate("/admin/dashboard");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed.");
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await api.post("/auth/register", { name, email, password });
      setSuccess(response.data?.message || "Registered successfully. You can now log in.");
      setMode("user");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="bg-white p-8 rounded-xl w-96 shadow-2xl">
        <div className="flex justify-between mb-6">
          <button
            onClick={() => { setMode("admin"); setError(""); setSuccess(""); }}
            className={`px-3 py-1 rounded ${mode === "admin" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          >
            Admin Login
          </button>
          <button
            onClick={() => { setMode("user"); setError(""); setSuccess(""); }}
            className={`px-3 py-1 rounded ${mode === "user" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          >
            User Login
          </button>
          <button
            onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
            className={`px-3 py-1 rounded ${mode === "register" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          >
            New User
          </button>
        </div>

        <h1 className="text-2xl font-bold text-center mb-4">
          {mode === "register" ? "Create Account" : mode === "admin" ? "Admin Login" : "User Login"}
        </h1>

        {error && <div className="text-red-600 mb-3">{error}</div>}
        {success && <div className="text-green-600 mb-3">{success}</div>}

        {mode === "register" ? (
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-3 mb-3 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-3 mb-3 rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 mb-3 rounded"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border p-3 mb-4 rounded"
            />
            <button type="submit" className="w-full bg-green-600 text-white p-3 rounded">Create Account</button>
          </form>
        ) : (
          <>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Email or Phone"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-3 mb-3 rounded"
              />

              <div className="relative mb-3">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border p-3 rounded"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 text-sm text-gray-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded mb-2">Login</button>
            </form>

            <div className="text-center my-2">or</div>

            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <input
                  type="text"
                  placeholder="Email or Phone"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border p-3 mb-3 rounded"
                />
                <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded">Send OTP</button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full border p-3 mb-3 rounded"
                />
                <button type="submit" className="w-full bg-green-600 text-white p-3 rounded">Verify OTP</button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
