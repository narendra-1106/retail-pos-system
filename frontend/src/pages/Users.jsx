import { useEffect, useState } from "react";
import api from "../api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineX
} from "react-icons/hi";

function Users() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user", status: "active" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchEmployeeStats();
  }, [page, search, filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let query = `/users?page=${page}&limit=10`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (filterRole) query += `&role=${filterRole}`;
      if (filterStatus) query += `&status=${filterStatus}`;
      const res = await api.get(query);
      setUsers(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Unable to load employees", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeStats = async () => {
    try {
      const res = await api.get("/orders/stats");
      setStats(res.data.employeeStats || []);
    } catch (err) {
      console.error("Unable to load employee stats", err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: "", email: "", password: "", role: "user", status: "active" });
    setMessage("");
    setShowForm(false);
  };

  const handleEdit = (user) => {
    setEditingId(user._id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "user",
      status: user.status || "active"
    });
    setShowForm(true);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, {
          name: form.name,
          email: form.email,
          role: form.role,
          status: form.status
        });
        setMessage("Employee updated successfully.");
      } else {
        await api.post("/users", {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role
        });
        setMessage("New employee added successfully.");
      }
      fetchUsers();
      fetchEmployeeStats();
      resetForm();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to save employee.");
    }
  };

  const toggleStatus = async (user) => {
    try {
      const newStatus = user.status === "active" ? "inactive" : "active";
      await api.patch(`/users/${user._id}/status`, { status: newStatus });
      fetchUsers();
      setMessage(`Employee ${newStatus === "active" ? "activated" : "disabled"} successfully.`);
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to update status.");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this employee and remove access permanently?")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
      setMessage("Employee removed successfully.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to delete employee.");
    }
  };

  const getUserStats = (id) => stats.find((item) => item._id === id) || { ordersCount: 0, totalSales: 0 };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors">
      <Sidebar />
      <div className="ml-0 md:ml-72 w-full flex flex-col">
        <Navbar />

        <main className="p-6 max-w-7xl mx-auto w-full space-y-6 flex-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">Employee Administration</p>
              <h1 className="text-3xl font-extrabold tracking-tight">Team & Sales Performance</h1>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm((prev) => !prev); }}
              className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition flex items-center gap-2"
            >
              <HiOutlinePlus className="h-5 w-5" />
              {showForm ? "Hide Form" : "Add Employee"}
            </button>
          </div>

          {showForm && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold">{editingId ? "Edit Employee" : "Create New Employee"}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Manage login access and role assignments.</p>
                </div>
                <button
                  onClick={resetForm}
                  className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                >
                  <HiOutlineX className="inline h-5 w-5" />
                </button>
              </div>
              {message && <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-4">{message}</p>}
              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm"
                    required
                  />
                </div>
                {!editingId && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm"
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm"
                  >
                    <option value="user">Cashier</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Disabled</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    {editingId ? "Update Employee" : "Create Employee"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[0.75fr_1fr]">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold">Sales performance snapshot</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Based on cashier order activity and completed revenue.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Total employees</p>
                    <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{users.length}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Active staff</p>
                    <p className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400">{users.filter((u) => u.status === "active").length}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {stats.slice(0, 3).map((item) => (
                  <div key={item._id} className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Orders: {item.ordersCount} · Revenue: ₹{item.totalSales.toLocaleString()}</p>
                      </div>
                      <span className={`text-[10px] rounded-full px-2 py-1 font-semibold ${item.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-bold">Employee roster</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Search, filter, and manage employee accounts.</p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={filterRole}
                      onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm"
                    >
                      <option value="">All roles</option>
                      <option value="admin">Admin</option>
                      <option value="user">Cashier</option>
                    </select>
                    <select
                      value={filterStatus}
                      onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm"
                    >
                      <option value="">All statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Disabled</option>
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <HiOutlineSearch className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search employees by name or email..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3.5 pl-11 pr-4 text-sm"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                {loading ? (
                  <div className="py-16 text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="mt-4 text-sm text-slate-500">Loading employee list…</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
                      <thead className="bg-slate-50 dark:bg-slate-950">
                        <tr>
                          <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Name</th>
                          <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Email</th>
                          <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Role</th>
                          <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                          <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Orders</th>
                          <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Revenue</th>
                          <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {users.map((user) => {
                          const userStats = getUserStats(user._id);
                          return (
                            <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="px-5 py-4 text-sm font-semibold text-slate-900 dark:text-white">{user.name}</td>
                              <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">{user.email}</td>
                              <td className="px-5 py-4 text-sm capitalize text-slate-600 dark:text-slate-300">{user.role}</td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${user.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right text-sm font-semibold text-slate-800 dark:text-white">{userStats.ordersCount}</td>
                              <td className="px-5 py-4 text-right text-sm text-slate-600 dark:text-slate-300">₹{userStats.totalSales.toLocaleString()}</td>
                              <td className="px-5 py-4 text-center">
                                <div className="inline-flex gap-1">
                                  <button
                                    onClick={() => handleEdit(user)}
                                    className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                                  >
                                    <HiOutlinePencil className="inline h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => toggleStatus(user)}
                                    className="rounded-2xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                                  >
                                    <HiOutlineCheck className="inline h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteUser(user._id)}
                                    className="rounded-2xl bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:hover:bg-rose-900"
                                  >
                                    <HiOutlineTrash className="inline h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 text-sm text-slate-500">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="rounded-2xl border border-slate-200 px-4 py-2 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span>Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="rounded-2xl border border-slate-200 px-4 py-2 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Users;
