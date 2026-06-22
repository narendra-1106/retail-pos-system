import { useEffect, useState } from "react";
import api from "../api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { HiOutlineDatabase, HiOutlineArrowUp, HiOutlineAdjustments, HiOutlineExclamationCircle, HiOutlinePlus } from "react-icons/hi";

function Inventory() {
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Restock Form states
  const [selectedProductId, setSelectedProductId] = useState("");
  const [restockQty, setRestockQty] = useState("");
  const [restockReason, setRestockReason] = useState("");

  // Stats
  const [valuation, setValuation] = useState(0);
  const [totalStockCount, setTotalStockCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchInventoryLogs();
    fetchInventoryOverview();
  }, [page]);

  const fetchInventoryLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/inventory/logs?page=${page}&limit=10`);
      setLogs(res.data.data || []);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching inventory logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryOverview = async () => {
    try {
      // Get low stock alerts
      const alertRes = await api.get("/inventory/alerts?threshold=10");
      setAlerts(alertRes.data || []);

      // Get all active products to calculate valuation & use in restock dropdown
      const prodRes = await api.get("/products?limit=1000");
      const list = prodRes.data.data || [];
      setProducts(list);

      const valTotal = list.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      const stockTotal = list.reduce((sum, p) => sum + p.quantity, 0);
      setValuation(valTotal);
      setTotalStockCount(stockTotal);
    } catch (err) {
      console.error("Error loading inventory stats:", err);
    }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    if (!selectedProductId || !restockQty || parseInt(restockQty, 10) <= 0) {
      alert("Please select a product and supply a valid quantity");
      return;
    }

    try {
      await api.post("/inventory/restock", {
        productId: selectedProductId,
        quantity: parseInt(restockQty, 10),
        reason: restockReason
      });

      setSelectedProductId("");
      setRestockQty("");
      setRestockReason("");
      alert("Product restocked successfully!");
      fetchInventoryLogs();
      fetchInventoryOverview();
    } catch (err) {
      alert(err.response?.data?.message || "Restock failed");
    }
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors">
      <Sidebar />
      <div className="ml-0 md:ml-72 w-full flex flex-col">
        <Navbar />

        <div className="p-6 max-w-7xl mx-auto w-full space-y-6 flex-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">Stock Operations</p>
            <h1 className="text-3xl font-extrabold tracking-tight">Inventory Management</h1>
          </div>

          {/* OVERVIEW STATS */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
                <HiOutlineDatabase className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Total Stock Assets</p>
              <p className="mt-2 text-2xl font-black text-slate-800 dark:text-white leading-none">{totalStockCount} units</p>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                <HiOutlineArrowUp className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Inventory Valuation</p>
              <p className="mt-2 text-2xl font-black text-slate-800 dark:text-white leading-none">₹{valuation.toLocaleString()}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md">
                <HiOutlineExclamationCircle className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Low Stock Products</p>
              <p className="mt-2 text-2xl font-black text-slate-800 dark:text-white leading-none">{alerts.length} items</p>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
                <HiOutlineAdjustments className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Total Catalog SKU</p>
              <p className="mt-2 text-2xl font-black text-slate-800 dark:text-white leading-none">{products.length} types</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            {/* INVENTORY LOGS */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold">Stock Movement Log</h3>
                <p className="text-xs text-slate-500">Record history of sales, adjustments, and restocks</p>
              </div>

              {loading ? (
                <div className="py-20 text-center flex-1 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : logs.length === 0 ? (
                <p className="py-20 text-center text-sm text-slate-400 flex-1">No inventory movements logged yet</p>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Product</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Type</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Qty Shift</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Reason / Reference</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Date Logged</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {logs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">
                            {log.product?.productName || "Deleted Product"}
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                              log.type === "restock" 
                                ? "bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400" 
                                : log.type === "sale" 
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400" 
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                            }`}>
                              {log.type}
                            </span>
                          </td>
                          <td className={`px-6 py-4 text-sm text-center font-black ${log.quantity > 0 ? "text-green-600" : "text-rose-600"}`}>
                            {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{log.reason || "N/A"}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">{new Date(log.date).toLocaleString()}</td>
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

            {/* RESTOCK FORM & LOW STOCK PANEL */}
            <div className="space-y-6">
              
              {/* RESTOCK ACTION FORM */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <HiOutlinePlus className="h-5 w-5 text-blue-500" />
                  <span>Restock Products</span>
                </h3>
                <form onSubmit={handleRestock} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Select Product *</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-xs"
                      required
                    >
                      <option value="">Choose item...</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>{p.productName} (Current: {p.quantity})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Restock Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 25"
                      value={restockQty}
                      onChange={(e) => setRestockQty(e.target.value)}
                      className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-xs"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Reason / Reference</label>
                    <input
                      type="text"
                      placeholder="e.g. Supplier delivery invoice #45"
                      value={restockReason}
                      onChange={(e) => setRestockReason(e.target.value)}
                      className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition"
                  >
                    Add Restock Entry
                  </button>
                </form>
              </div>

              {/* LOW STOCK ALERTS VIEW */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                  <span>Critical Stock Alerts</span>
                  <span className="text-xs bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 font-bold px-2 py-0.5 rounded-full">
                    {alerts.length} Items
                  </span>
                </h3>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {alerts.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">All product stocks are stable.</p>
                  ) : (
                    alerts.map(item => (
                      <div key={item._id} className="flex items-center justify-between border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950 p-3">
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.productName}</p>
                          <p className="text-[10px] text-slate-400">Barcode: {item.barcode || "N/A"}</p>
                        </div>
                        <span className="text-xs font-black bg-rose-50 dark:bg-rose-950/20 text-rose-600 px-2 py-1 rounded-xl">
                          {item.quantity} left
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Inventory;