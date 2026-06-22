import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import {
  HiOutlineCash,
  HiOutlineCube,
  HiOutlineShoppingCart,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineExclamationCircle,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlinePrinter,
  HiOutlineUser,
  HiOutlineCheck,
  HiOutlineKey
} from "react-icons/hi";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api";

function Dashboard() {
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Admin states
  const [adminStats, setAdminStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockCount: 0,
    lowStockAlerts: [],
    monthlySales: [],
    employeeStats: []
  });

  // Cashier / Billing terminal states
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [newCustomer, setNewCustomer] = useState({ customerName: "", phone: "", email: "", address: "" });
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [discountType, setDiscountType] = useState("percent"); // 'percent' | 'flat'
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashReceived, setCashReceived] = useState(0);
  
  // Checkout & Invoice States
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Cashier stats / profile states
  const [cashierOrders, setCashierOrders] = useState([]);
  const [personalRevenue, setPersonalRevenue] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [passwordStatus, setPasswordStatus] = useState({ success: "", error: "" });

  const receiptRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token || !user.role) {
      navigate("/");
      return;
    }
    setRole(user.role);

    if (user.role === "admin") {
      fetchAdminStats();
    } else {
      fetchCashierPOSData();
    }
  }, [navigate]);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders/stats");
      setAdminStats(res.data);
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCashierPOSData = async () => {
    try {
      setLoading(true);
      // Fetch active products
      const prodRes = await api.get("/products?limit=100");
      setProducts(prodRes.data.data || []);

      // Fetch categories
      const catRes = await api.get("/categories");
      setCategories(catRes.data.data || []);

      // Fetch customers
      const custRes = await api.get("/customers");
      setCustomers(custRes.data.data || []);

      // Fetch cashier's personal orders
      const orderRes = await api.get("/orders?limit=10");
      const orders = orderRes.data.data || [];
      setCashierOrders(orders);

      const completedOrders = orders.filter(o => o.status === "completed");
      const personalSalesTotal = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      setPersonalRevenue(personalSalesTotal);

      const today = new Date().toDateString();
      const todaysOrders = completedOrders.filter(o => new Date(o.createdAt).toDateString() === today);
      setTodayOrders(todaysOrders.length);
      setTodayRevenue(todaysOrders.reduce((sum, o) => sum + o.totalAmount, 0));

    } catch (err) {
      console.error("Error fetching POS data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add Product to Cart
  const addToCart = (product) => {
    if (product.quantity <= 0) {
      alert("Product is out of stock!");
      return;
    }

    const exist = cart.find(item => item.product === product._id);
    if (exist) {
      if (exist.quantity >= product.quantity) {
        alert(`Cannot add more. Only ${product.quantity} units available.`);
        return;
      }
      setCart(cart.map(item =>
        item.product === product._id ? { ...exist, quantity: exist.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, {
        product: product._id,
        name: product.productName,
        price: product.price,
        quantity: 1,
        maxStock: product.quantity
      }]);
    }
  };

  // Update Cart Quantity
  const updateCartQty = (productId, qty) => {
    const exist = cart.find(item => item.product === productId);
    if (!exist) return;
    const parsedQty = parseInt(qty, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) return;

    if (parsedQty > exist.maxStock) {
      alert(`Cannot set quantity. Only ${exist.maxStock} units available.`);
      return;
    }

    setCart(cart.map(item =>
      item.product === productId ? { ...item, quantity: parsedQty } : item
    ));
  };

  // Remove from Cart
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product !== productId));
  };

  // Add Customer Inline
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomer.customerName) return;
    try {
      const res = await api.post("/customers", {
        name: newCustomer.customerName,
        phone: newCustomer.phone,
        email: newCustomer.email,
        address: newCustomer.address
      });
      // Refresh customer list and auto-select
      const custRes = await api.get("/customers");
      setCustomers(custRes.data.data || []);
      setSelectedCustomerId(res.data.customer._id);
      setShowAddCustomer(false);
      setNewCustomer({ customerName: "", phone: "", email: "", address: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add customer");
    }
  };

  // Billing Math
  const getSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const getDiscount = () => {
    const subtotal = getSubtotal();
    if (discountType === "percent") {
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  };
  const getGST = () => {
    const subtotal = getSubtotal();
    const discount = getDiscount();
    // 18% standard GST on discount-adjusted subtotal
    return Math.max(((subtotal - discount) * 18) / 100, 0);
  };
  const getTotal = () => {
    const subtotal = getSubtotal();
    const discount = getDiscount();
    const gst = getGST();
    return Math.max(subtotal - discount + gst, 0);
  };

  // Complete POS Transaction
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      if (paymentMethod === "cash" && cashReceived < getTotal()) {
        alert("Cash received must cover the total amount.");
        return;
      }

      const orderData = {
        customerId: selectedCustomerId || undefined,
        items: cart.map(item => ({
          product: item.product,
          quantity: item.quantity
        })),
        discount: getDiscount(),
        tax: getGST(),
        paymentMethod
      };

      const res = await api.post("/orders", orderData);
      setCreatedOrder(res.data.order);
      setCheckoutSuccess(true);
      setShowReceipt(true);
      setCart([]);
      setSelectedCustomerId("");
      setDiscountValue(0);
      setCashReceived(0);
      
      // Refresh local inventory data
      fetchCashierPOSData();
    } catch (err) {
      alert(err.response?.data?.message || "Checkout failed");
    }
  };

  // Change Password logic
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordStatus({ success: "", error: "" });
    try {
      const res = await api.post("/auth/change-password", passwordForm);
      setPasswordStatus({ success: res.data.message || "Password updated", error: "" });
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPasswordStatus({ success: "", error: err.response?.data?.message || "Update failed" });
    }
  };

  // Receipt Printing Trigger
  const triggerPrintReceipt = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    const receiptHtml = receiptRef.current.innerHTML;
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt Print</title>
          <style>
            body { font-family: monospace; padding: 20px; color: #000; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 4px 0; text-align: left; }
            .mt-20 { margin-top: 20px; }
          </style>
        </head>
        <body>
          ${receiptHtml}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Filters for POS Products catalogue
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.barcode && p.barcode.includes(searchQuery));
    const matchesCategory = selectedCategory === "" || p.category?._id === selectedCategory;
    return matchesSearch && matchesCategory && p.status === "active";
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Sidebar />
      <div className="ml-0 md:ml-72">
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          
          {/* ================= ADMIN VIEW ================= */}
          {role === "admin" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">Management Overview</p>
                  <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate("/reports")} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                    View Reports
                  </button>
                  <button onClick={() => navigate("/products")} className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition">
                    Manage Products
                  </button>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {[
                  { title: "Total Revenue", value: `₹${adminStats.totalRevenue.toLocaleString()}`, color: "bg-blue-600", desc: "Gross completed income", icon: HiOutlineCash },
                  { title: "Total Sales", value: adminStats.totalSales, color: "bg-emerald-600", desc: "Completed orders", icon: HiOutlineShoppingCart },
                  { title: "Total Products", value: adminStats.totalProducts, color: "bg-indigo-600", desc: "Catalog scale", icon: HiOutlineCube },
                  { title: "Total Customers", value: adminStats.totalCustomers, color: "bg-violet-600", desc: "Loyalty members", icon: HiOutlineUserGroup },
                  { title: "Total Orders", value: adminStats.totalOrders, color: "bg-amber-600", desc: "All processed bookings", icon: HiOutlineShoppingCart },
                  { title: "Low Stock Alerts", value: adminStats.lowStockCount, color: "bg-rose-600", desc: "Items below threshold", icon: HiOutlineExclamationCircle },
                ].map((stat, i) => (
                  <div key={i} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-lg transition duration-300">
                    <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${stat.color} text-white shadow-md`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">{stat.title}</p>
                    <p className="mt-2 text-2xl font-black text-slate-800 dark:text-white leading-none">{stat.value}</p>
                    <p className="mt-2.5 text-[10px] text-slate-400">{stat.desc}</p>
                  </div>
                ))}
              </div>

              {/* Analytics Charts */}
              <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                  <h3 className="text-lg font-bold">Sales Trend</h3>
                  <p className="text-xs text-slate-500 mb-6">Revenue tracking over the last 6 months</p>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={adminStats.monthlySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="sales" stroke="#2563eb" fill="url(#salesGrad)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">Low Stock alerts</h3>
                      <span className="text-xs bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 font-bold px-2 py-0.5 rounded-full">Urgent</span>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {adminStats.lowStockAlerts.length === 0 ? (
                        <p className="text-xs text-slate-400">All products are healthy.</p>
                      ) : (
                        adminStats.lowStockAlerts.map(p => (
                          <div key={p._id} className="flex items-center justify-between border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950 p-4">
                            <div>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{p.name}</p>
                              <p className="text-[10px] text-slate-400">Product ID: {p._id}</p>
                            </div>
                            <span className="text-xs font-black bg-rose-50 dark:bg-rose-950/20 text-rose-600 px-2 py-1 rounded-xl">{p.quantity} left</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Employee stats */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-1">Employee Statistics</h3>
                <p className="text-xs text-slate-500 mb-6">Cashier sales volumes and platform activity log</p>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Employee Name</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Orders Count</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {adminStats.employeeStats.map(emp => (
                        <tr key={emp._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-100">{emp.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{emp.email}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              emp.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                            }`}>
                              {emp.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-center font-bold text-slate-700 dark:text-slate-300">{emp.ordersCount}</td>
                          <td className="px-6 py-4 text-sm font-black text-right text-slate-800 dark:text-white">₹{emp.totalSales.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= CASHIER / USER VIEW ================= */}
          {role === "user" && (
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr] animate-fadeIn">
              
              {/* Left Column: POS Cashier Billing Cart System */}
              <div className="space-y-6">
                
                {/* Product catalog catalog & search bar */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold">Billing POS Terminal</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Scan barcodes or select products to check out</p>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Search and Catalog */}
                  <div className="relative mb-6">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <HiOutlineSearch className="h-5 w-5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search product by name or scan barcode..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3.5 pl-11 pr-4 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 max-h-[400px] overflow-y-auto pr-2">
                    {filteredProducts.length === 0 ? (
                      <p className="col-span-full py-10 text-center text-xs text-slate-400">No matching active products found</p>
                    ) : (
                      filteredProducts.map(p => (
                        <div
                          key={p._id}
                          onClick={() => addToCart(p)}
                          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200"
                        >
                          <div className="flex gap-3">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              {p.image ? (
                                <img src={p.image} alt={p.productName} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-400">
                                  IMAGE
                                </div>
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{p.productName}</h4>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.barcode || "No Barcode"}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm font-black text-blue-600 dark:text-blue-400">₹{p.price}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  p.quantity < 10 ? "bg-rose-100 text-rose-700 dark:bg-rose-950/20" : "bg-green-100 text-green-700 dark:bg-green-950/20"
                                }`}>
                                  Stock: {p.quantity}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button className="absolute right-3 bottom-3 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <HiOutlinePlus className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Cart View */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                    <span>Active Cart</span>
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">{cart.length} unique items</span>
                  </h3>

                  {cart.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-sm text-slate-400">POS Cart is empty. Select products above to populate.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto pr-2">
                      {cart.map(item => (
                        <div key={item.product} className="flex items-center justify-between py-4">
                          <div className="max-w-[50%]">
                            <h4 className="font-bold text-sm truncate">{item.name}</h4>
                            <span className="text-xs text-slate-400">₹{item.price} each</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min="1"
                              max={item.maxStock}
                              value={item.quantity}
                              onChange={(e) => updateCartQty(item.product, e.target.value)}
                              className="w-16 text-center border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl px-2 py-1.5 text-sm"
                            />
                            <span className="w-20 text-right font-black text-slate-800 dark:text-white">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.product)}
                              className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-2 rounded-xl"
                            >
                              <HiOutlineTrash className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Checkout panel, loyalty details, and user profile */}
              <div className="space-y-6">
                
                {/* Checkout & Bill Summary panel */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Invoice Summary</h3>

                  {/* Customer selection */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Lookup</label>
                      <button
                        onClick={() => setShowAddCustomer(!showAddCustomer)}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <HiOutlinePlus className="h-3 w-3" /> New Customer
                      </button>
                    </div>

                    {!showAddCustomer ? (
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm"
                      >
                        <option value="">Walk-in Customer</option>
                        {customers.map(c => (
                          <option key={c._id} value={c._id}>
                            {c.customerName} ({c.phone || "No Phone"}) - Pts: {c.loyaltyPoints}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <form onSubmit={handleAddCustomer} className="space-y-2.5 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950">
                        <input
                          type="text"
                          placeholder="Customer Name"
                          value={newCustomer.customerName}
                          onChange={(e) => setNewCustomer({ ...newCustomer, customerName: e.target.value })}
                          className="w-full text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl px-2.5 py-2"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Phone Number"
                          value={newCustomer.phone}
                          onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                          className="w-full text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl px-2.5 py-2"
                        />
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={newCustomer.email}
                          onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                          className="w-full text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl px-2.5 py-2"
                        />
                        <div className="flex gap-2 justify-end">
                          <button type="button" onClick={() => setShowAddCustomer(false)} className="text-[10px] text-slate-500 px-2 py-1">Cancel</button>
                          <button type="submit" className="text-[10px] bg-blue-600 text-white rounded px-3 py-1 font-bold">Save</button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Discount Section */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Discount</label>
                    <div className="flex gap-2">
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2 py-2 text-xs"
                      >
                        <option value="percent">Percentage (%)</option>
                        <option value="flat">Flat Value (₹)</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                        className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-right"
                      />
                    </div>
                  </div>

                  {/* Calculations */}
                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 text-sm">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Subtotal</span>
                      <span>₹{getSubtotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Discount</span>
                      <span>-₹{getDiscount().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>GST (18% standard)</span>
                      <span>₹{getGST().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-lg font-black text-slate-900 dark:text-white">
                      <span>Total Amount</span>
                      <span>₹{getTotal().toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Payment Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["cash", "card", "upi"].map(method => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`rounded-xl py-2 text-xs font-bold capitalize border transition ${
                            paymentMethod === method 
                              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10" 
                              : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>

                    {paymentMethod === "cash" && (
                      <div className="mt-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cash Received</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={cashReceived}
                            onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-right font-black"
                          />
                          <div className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Change: <span className="font-black text-green-600 ml-1">₹{Math.max(cashReceived - getTotal(), 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className="w-full mt-6 rounded-2xl bg-blue-600 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition disabled:bg-slate-200 dark:disabled:bg-slate-800 dark:disabled:text-slate-600"
                  >
                    Proceed Checkout & Invoice
                  </button>
                </div>

                {/* Personal cashier statistics */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Cashier Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Today&apos;s Orders</span>
                      <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">{todayOrders}</span>
                    </div>
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Today&apos;s Revenue</span>
                      <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">₹{todayRevenue.toLocaleString()}</span>
                    </div>
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Revenue</span>
                      <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">₹{personalRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Cashier Profile and Password change */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <HiOutlineKey className="h-5 w-5 text-slate-400" />
                    <span>Change Profile Password</span>
                  </h3>
                  
                  {passwordStatus.success && <p className="text-xs text-green-600 mb-3 font-semibold">{passwordStatus.success}</p>}
                  {passwordStatus.error && <p className="text-xs text-rose-600 mb-3 font-semibold">{passwordStatus.error}</p>}

                  <form onSubmit={handlePasswordChange} className="space-y-3">
                    <input
                      type="password"
                      placeholder="Current Password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5"
                      required
                    />
                    <input
                      type="password"
                      placeholder="New Password (min 6 chars)"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5"
                      required
                    />
                    <button type="submit" className="w-full rounded-xl bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 py-2.5 text-xs font-bold transition">
                      Change Security Password
                    </button>
                  </form>
                </div>

              </div>

            </div>
          )}

        </main>
      </div>

      {/* ================= PRINT RECEIPT / INVOICE MODAL ================= */}
      {showReceipt && createdOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-black p-6 rounded-3xl w-full max-w-sm shadow-2xl relative flex flex-col max-h-[90vh]">
            <h3 className="text-lg font-bold border-b pb-2 mb-4 text-center">Invoice Completed</h3>
            
            {/* The printable receipt block */}
            <div ref={receiptRef} className="flex-1 overflow-y-auto pr-1 text-xs font-mono leading-relaxed">
              <div className="text-center">
                <h2 className="bold text-lg">RETAIL POS</h2>
                <p>123 Store Lane, City Central</p>
                <p>Phone: +91 98765 43210</p>
                <p className="divider"></p>
                <p className="bold">RECEIPT / INVOICE</p>
                <p className="divider"></p>
              </div>

              <div>
                <p>Order ID: {createdOrder.orderId}</p>
                <p>Date: {new Date(createdOrder.createdAt).toLocaleString()}</p>
                <p>Payment: {createdOrder.paymentMethod.toUpperCase()}</p>
                <p>Customer: {createdOrder.customer ? "Loyalty Account" : "Walk-in"}</p>
                <p className="divider"></p>
              </div>

              <table>
                <thead>
                  <tr className="bold">
                    <th>Item</th>
                    <th className="text-center">Qty</th>
                    <th className="text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {createdOrder.items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-right">₹{(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="divider"></div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{createdOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-₹{createdOrder.discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span>₹{createdOrder.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between bold text-sm">
                  <span>TOTAL AMOUNT:</span>
                  <span>₹{createdOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="divider"></div>

              <div className="text-center mt-20">
                <p className="bold">Thank you for shopping with us!</p>
                <p>Please visit again</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-6 pt-4 border-t">
              <button
                onClick={triggerPrintReceipt}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold flex items-center justify-center gap-2 text-xs transition"
              >
                <HiOutlinePrinter className="h-4 w-4" /> Print Receipt
              </button>
              <button
                onClick={() => { setShowReceipt(false); setCreatedOrder(null); }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl px-4 py-3 font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
