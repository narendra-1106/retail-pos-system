import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="bg-white shadow-lg p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <h1 className="text-2xl font-bold">Retail POS</h1>
        <nav className="flex flex-wrap gap-2">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-600"}>Dashboard</NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-600"}>Products</NavLink>
          <NavLink to="/orders" className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-600"}>Orders</NavLink>
          <NavLink to="/analytics" className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-600"}>Analytics</NavLink>
          <NavLink to="/reports" className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-600"}>Reports</NavLink>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">Admin</span>
        <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
      </div>
    </div>
  );
}

export default Navbar;