import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Users from "./pages/Users";
import Login from "./pages/Login";

function App() {
  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/products" element={<Products />} />

        <Route path="/orders" element={<Orders />} />

        <Route path="/inventory" element={<Inventory />} />

        <Route path="/users" element={<Users />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;