import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HiOutlineMoon, HiOutlineSun, HiOutlineLogout, HiOutlineMenuAlt2, HiOutlineChevronDown, HiOutlineUserCircle } from "react-icons/hi";

function Navbar() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Employee");
  const [role, setRole] = useState("user");
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.name) setUserName(user.name);
    if (user.role) setRole(user.role);

    const storedTheme = localStorage.getItem("theme");
    const isDark = storedTheme === "dark" || (!storedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 transition"
        >
          <HiOutlineMenuAlt2 className="h-6 w-6" />
        </button>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Store Control Panel</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Hello, {userName}. Manage sales, inventory and reports.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 relative">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 transition"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <HiOutlineSun className="h-6 w-6 text-amber-500" /> : <HiOutlineMoon className="h-6 w-6" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen((open) => !open)}
            className="flex items-center gap-3 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2 transition hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <HiOutlineUserCircle className="h-5 w-5" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{userName}</span>
              <span className={`text-[10px] uppercase tracking-[0.25em] font-bold ${role === "admin" ? "text-blue-600" : "text-slate-500 dark:text-slate-400"}`}>
                {role}
              </span>
            </div>
            <HiOutlineChevronDown className={`h-4 w-4 text-slate-500 transition ${profileMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-3xl border border-slate-200 bg-white py-2 shadow-xl dark:border-slate-800 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => { setProfileMenuOpen(false); navigate(role === "admin" ? "/admin/dashboard" : "/dashboard"); }}
                className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                View Dashboard
              </button>
              <button
                type="button"
                onClick={() => { setProfileMenuOpen(false); logout(); }}
                className="w-full px-4 py-3 text-left text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-slate-200 p-4 shadow-xl dark:bg-slate-900 dark:border-slate-800 flex flex-col gap-2 md:hidden">
          <Link
            to={role === "admin" ? "/admin/dashboard" : "/dashboard"}
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Dashboard
          </Link>
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Products
          </Link>
          <Link
            to="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Orders
          </Link>
          <Link
            to="/customers"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Customers
          </Link>
          {role === "admin" && (
            <>
              <Link
                to="/inventory"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Inventory
              </Link>
              <Link
                to="/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Analytics
              </Link>
              <Link
                to="/reports"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Reports
              </Link>
              <Link
                to="/users"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Employees
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
