import { useEffect, useState } from "react";
import api from "../api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { HiOutlineSearch, HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineEye, HiOutlineX } from "react-icons/hi";

function Customers() {
  const [customers, setCustomers] = useState([]);
  
  // Form states
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Search/Filters states
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Detailed Customer History view states
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [role, setRole] = useState("user");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role) setRole(user.role);
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/customers?page=${page}&limit=10&search=${search}`);
      setCustomers(res.data.data || []);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!customerName) {
      alert("Customer Name is required");
      return;
    }

    try {
      await api.post("/customers", {
        name: customerName,
        phone,
        email,
        address
      });
      fetchCustomers();
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add customer");
    }
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/customers/${editingId}`, {
        name: customerName,
        phone,
        email,
        address
      });
      fetchCustomers();
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update customer");
    }
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
      if (activeCustomer?._id === id) setActiveCustomer(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete customer");
    }
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setCustomerName(c.customerName || c.name);
    setPhone(c.phone || "");
    setEmail(c.email || "");
    setAddress(c.address || "");
    setShowAddForm(true);
  };

  const viewCustomerDetails = async (c) => {
    setActiveCustomer(c);
    setLoadingHistory(true);
    try {
      // Fetch orders belonging to this customer
      const res = await api.get(`/orders?customerId=${c._id}`);
      setCustomerHistory(res.data.data || []);
    } catch (err) {
      console.error("Error fetching customer history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setCustomerName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setShowAddForm(false);
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors">
      <Sidebar />
      <div className="ml-0 md:ml-72 w-full flex flex-col">
        <Navbar />

        <div className="p-6 max-w-7xl mx-auto w-full space-y-6 flex-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">POS Customers Directory</p>
              <h1 className="text-3xl font-extrabold tracking-tight">Customer Management</h1>
            </div>
            <button
              onClick={() => { resetForm(); setShowAddForm(!showAddForm); }}
              className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition flex items-center gap-2"
            >
              <HiOutlinePlus className="h-5 w-5" />
              {showAddForm ? "Hide Form" : "Add Customer"}
            </button>
          </div>

          {/* ADD / EDIT CUSTOMER FORM */}
          {showAddForm && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm animate-fadeIn">
              <h3 className="text-lg font-bold mb-4">{editingId ? "Edit Customer Details" : "Register New Customer"}</h3>
              <form onSubmit={editingId ? handleUpdateCustomer : handleAddCustomer} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Customer Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Mira Patel"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-sm"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. customer@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Residential Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Sector-4, Delhi"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    {editingId ? "Update Details" : "Register Customer"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SEARCH FILTERS */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <HiOutlineSearch className="h-5 w-5" />
              </span>
              <input
                type="text"
                placeholder="Search customers by name or phone..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2.5 pl-11 pr-4 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            {/* CUSTOMER DIRECTORY LIST */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              {loading ? (
                <div className="py-20 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                  <p className="mt-2 text-xs text-slate-400">Loading customers...</p>
                </div>
              ) : customers.length === 0 ? (
                <p className="py-20 text-center text-sm text-slate-400">No customers registered in database</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Customer Name</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Phone</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Total Spent</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Loyalty Points</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center font-mono">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {customers.map((c) => (
                        <tr key={c._id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer ${activeCustomer?._id === c._id ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}`} onClick={() => viewCustomerDetails(c)}>
                          <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">{c.customerName || c.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{c.phone || "N/A"}</td>
                          <td className="px-6 py-4 text-sm font-black text-slate-800 dark:text-slate-200">₹{c.totalPurchases.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className="inline-block text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 px-2.5 py-0.5 rounded-full">
                              {c.loyaltyPoints} Points
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => viewCustomerDetails(c)}
                                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl"
                                title="View History"
                              >
                                <HiOutlineEye className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => startEdit(c)}
                                className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-xl"
                                title="Edit"
                              >
                                <HiOutlinePencil className="h-5 w-5" />
                              </button>
                              {role === "admin" && (
                                <button
                                  onClick={() => deleteCustomer(c._id)}
                                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl"
                                  title="Delete"
                                >
                                  <HiOutlineTrash className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950">
                  <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-semibold text-slate-500">Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* CUSTOMER PROFILE & ORDER HISTORY SUMMARY */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col self-start min-h-[400px]">
              {activeCustomer ? (
                <div className="space-y-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-800 dark:text-white leading-none">{activeCustomer.customerName || activeCustomer.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">Profile Details</p>
                    </div>
                    <button
                      onClick={() => setActiveCustomer(null)}
                      className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    >
                      <HiOutlineX className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs leading-relaxed">
                    <p><span className="font-bold text-slate-400">Phone:</span> {activeCustomer.phone || "N/A"}</p>
                    <p><span className="font-bold text-slate-400">Email:</span> {activeCustomer.email || "N/A"}</p>
                    <p><span className="font-bold text-slate-400">Address:</span> {activeCustomer.address || "N/A"}</p>
                    <p><span className="font-bold text-slate-400">Total purchases:</span> ₹{activeCustomer.totalPurchases.toLocaleString()}</p>
                    <p><span className="font-bold text-slate-400">Loyalty Accumulated:</span> {activeCustomer.loyaltyPoints} points</p>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Order History Log</h4>
                    
                    {loadingHistory ? (
                      <div className="py-10 text-center flex-1 flex items-center justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                      </div>
                    ) : customerHistory.length === 0 ? (
                      <p className="text-xs text-slate-400 py-10 text-center">No purchases recorded in system</p>
                    ) : (
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 flex-1">
                        {customerHistory.map(order => (
                          <div key={order._id} className="border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950 p-3">
                            <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                              <span className="font-mono text-slate-800 dark:text-slate-300">{order.orderId}</span>
                              <span className="text-blue-600 dark:text-blue-400">₹{order.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-slate-400">
                              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                              <span className="uppercase font-semibold">{order.paymentMethod}</span>
                            </div>
                            <div className="border-t border-slate-100 dark:border-slate-800/60 mt-2 pt-2 text-[10px] space-y-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-slate-500">
                                  <span>{item.name} (x{item.quantity})</span>
                                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center text-slate-400 py-20">
                  <p className="text-sm">Select a customer from the table list to inspect their purchase history and loyalty metrics.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Customers;
