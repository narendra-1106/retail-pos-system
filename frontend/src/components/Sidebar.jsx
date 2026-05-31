import { Link } from "react-router-dom";

function Sidebar() {
  return (

    <div className="w-64 h-screen bg-black text-white fixed">

      <h1 className="text-2xl font-bold p-6 border-b border-gray-800">
        POS System
      </h1>

      <ul className="p-4 space-y-4">

        <Link to="/dashboard">
          <li className="hover:bg-gray-800 p-3 rounded cursor-pointer">
            Dashboard
          </li>
        </Link>

        <Link to="/products">
          <li className="hover:bg-gray-800 p-3 rounded cursor-pointer">
            Products
          </li>
        </Link>

        <Link to="/orders">
          <li className="hover:bg-gray-800 p-3 rounded cursor-pointer">
            Orders
          </li>
        </Link>

        <Link to="/inventory">
          <li className="hover:bg-gray-800 p-3 rounded cursor-pointer">
            Inventory
          </li>
        </Link>

        <Link to="/analytics">
          <li className="hover:bg-gray-800 p-3 rounded cursor-pointer">
            Analytics
          </li>
        </Link>

        <Link to="/reports">
          <li className="hover:bg-gray-800 p-3 rounded cursor-pointer">
            Reports
          </li>
        </Link>

        <Link to="/users">
          <li className="hover:bg-gray-800 p-3 rounded cursor-pointer">
            Users
          </li>
        </Link>

      </ul>

    </div>
  );
}

export default Sidebar;