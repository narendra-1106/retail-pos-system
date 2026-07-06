import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Login() {
  const [mode, setMode] = useState("admin"); // 'admin' | 'user' | 'register'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      const response = await api.post("/auth/login", { identifier: email, password });
      const { token, user } = response.data;

      if (mode === "admin" && user.role !== "admin") {
        setError("Access Denied: You are not an Admin. Please use the Cashier login tab.");
        return;
      }
      
      if (mode === "user" && user.role !== "user") {
        setError("Access Denied: You are an Admin. Please use the Admin login tab.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      if (user.role === "admin") navigate("/admin/dashboard");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
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
      await api.post("/auth/register", { name, email, password });
      
      // Auto-login after successful registration
      try {
        const loginRes = await api.post("/auth/login", { identifier: email, password });
        const { token, user } = loginRes.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        if (user.role === "admin") navigate("/admin/dashboard");
        else navigate("/dashboard");
      } catch (loginErr) {
        setSuccess("Registered successfully. Please log in.");
        setMode("user");
        setPassword("");
        setConfirmPassword("");
      }
      
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 sm:p-10 rounded-3xl shadow-xl dark:shadow-2xl border border-slate-100 dark:border-slate-800">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-600 text-white font-bold text-2xl mb-4 shadow-lg shadow-blue-500/30">
            RP
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            RetailPOS System
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {mode === "register" ? "Create a new account to get started." : "Sign in to access your dashboard."}
          </p>
        </div>

        <div className="flex p-1 mb-8 bg-slate-100 dark:bg-slate-950 rounded-2xl">
          <button
            onClick={() => { setMode("admin"); setError(""); setSuccess(""); }}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 ${mode === "admin" ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            Admin
          </button>
          <button
            onClick={() => { setMode("user"); setError(""); setSuccess(""); }}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 ${mode === "user" ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            Cashier
          </button>
          <button
            onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 ${mode === "register" ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            Register
          </button>
        </div>

        {error && <div className="p-3 mb-6 text-sm font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400 rounded-2xl text-center border border-rose-100 dark:border-rose-900/50 animate-fadeIn">{error}</div>}
        {success && <div className="p-3 mb-6 text-sm font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 rounded-2xl text-center border border-emerald-100 dark:border-emerald-900/50 animate-fadeIn">{success}</div>}

        {mode === "register" ? (
          <form onSubmit={handleRegister} className="space-y-4 animate-fadeIn">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1">Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1">Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 ml-1">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white mb-2"
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-lg shadow-blue-500/30">
              Create Account
            </button>
          </form>
        ) : (
          <div className="animate-fadeIn">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1">Email or Phone</label>
                <input
                  type="text"
                  placeholder="Enter email or phone"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1 flex justify-between">
                  <span>Password</span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] uppercase tracking-wider text-blue-600 hover:underline"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                />
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-lg shadow-blue-500/30 mt-2">
                Secure Login
              </button>
            </form>


          </div>
        )}
      </div>
    </div>
  );
}

export default Login;

