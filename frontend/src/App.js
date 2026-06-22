import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Users from "./pages/Users";
import Login from "./pages/Login";
import Analytics from "./pages/Analytics";
import ProtectedRoute from "./components/ProtectedRoute";
import Reports from "./pages/Reports";
import Customers from "./pages/Customers";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Cashier / Shared Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
        
        {/* Admin-only Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly={true}><Dashboard /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute adminOnly={true}><Inventory /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute adminOnly={true}><Users /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute adminOnly={true}><Analytics /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute adminOnly={true}><Reports /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;