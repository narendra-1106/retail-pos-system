import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineShoppingCart,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineDatabase
} from "react-icons/hi";

function Sidebar() {
  const location = useLocation();
  const [role, setRole] = useState("user");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role) {
      setRole(user.role);
    }
  }, []);

  const menuItems = [
    {
      name: "Dashboard",
      path: role === "admin" ? "/admin/dashboard" : "/dashboard",
      icon: HiOutlineHome,
      roles: ["admin", "user"]
    },
    {
      name: "Products",
      path: "/products",
      icon: HiOutlineCube,
      roles: ["admin", "user"]
    },
    {
      name: "Orders",
      path: "/orders",
      icon: HiOutlineShoppingCart,
      roles: ["admin", "user"]
    },
    {
      name: "Customers",
      path: "/customers",
      icon: HiOutlineUserGroup,
      roles: ["admin", "user"]
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: HiOutlineDatabase,
      roles: ["admin"]
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: HiOutlineChartBar,
      roles: ["admin"]
    },
    {
      name: "Reports",
      path: "/reports",
      icon: HiOutlineDocumentText,
      roles: ["admin"]
    },
    {
      name: "Employees",
      path: "/users",
      icon: HiOutlineUsers,
      roles: ["admin"]
    }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName = storedUser.name || "Retail Staff";
  const displayEmail = storedUser.email || "user@example.com";

  return (
    <aside className="hidden md:flex flex-col w-72 h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 fixed border-r border-slate-800 shadow-[0_25px_50px_-25px_rgba(15,23,42,0.9)]">
      <div className="flex items-center gap-4 px-8 py-8 border-b border-slate-800">
        <div className="h-12 w-12 rounded-3xl bg-blue-600 flex items-center justify-center text-lg font-extrabold text-white shadow-lg shadow-blue-500/20">
          RP
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">RetailPOS</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mt-1">{role === "admin" ? "Admin Suite" : "Cashier Terminal"}</p>
        </div>
      </div>

      <nav className="flex-1 px-6 py-6 space-y-3 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 rounded-3xl px-4 py-3 transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-300 hover:bg-slate-900/80 hover:text-white"
              }`}>
              <Icon className={`h-6 w-6 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
              <span className="text-sm font-medium tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-3 rounded-3xl bg-slate-950/90 p-4 shadow-inner">
          <div className="h-11 w-11 rounded-3xl bg-slate-800 flex items-center justify-center text-base font-bold text-slate-200">
            {displayName.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="min-w-0 overflow-hidden">
            <p className="text-sm font-semibold truncate text-white">{displayName}</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 truncate">{role === "admin" ? "Administrator" : "Cashier"}</p>
            <p className="text-[10px] truncate text-slate-500">{displayEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
