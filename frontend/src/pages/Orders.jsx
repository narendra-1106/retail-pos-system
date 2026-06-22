import { useEffect, useState, useRef } from "react";
import api from "../api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { HiOutlineSearch, HiOutlineEye, HiOutlineX, HiOutlinePrinter, HiOutlineTrash } from "react-icons/hi";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Selected order details / invoice viewer states
  const [activeOrder, setActiveOrder] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const receiptRef = useRef();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role) setRole(user.role);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchOrders();
  }, [page, filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const query = `/orders?page=${page}&limit=10&status=${filterStatus}`;
      const res = await api.get(query);
      setOrders(res.data.data || []);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order? This will restock all products and reverse customer loyalty points!")) return;
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      fetchOrders();
      if (activeOrder?._id === orderId) {
        setShowInvoiceModal(false);
        setActiveOrder(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order");
    }
  };

  const viewOrderInvoice = async (order) => {
    setActiveOrder(order);
    setShowInvoiceModal(true);
  };

  const triggerPrintReceipt = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    const receiptHtml = receiptRef.current.innerHTML;
    printWindow.document.write(`
      <html>
        <head>
          <title>POS Receipt</title>
          <style>
            body { font-family: monospace; padding: 25px; color: #000; }
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

  // Client search filter on orderId or Customer Name
  const filteredOrders = orders.filter(o => {
    const orderIdMatch = o.orderId.toLowerCase().includes(search.toLowerCase());
    const cNameMatch = o.customer?.customerName?.toLowerCase().includes(search.toLowerCase()) || false;
    const walkInMatch = "walk-in".includes(search.toLowerCase()) && !o.customer;
    return orderIdMatch || cNameMatch || walkInMatch;
  });

  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors">
      <Sidebar />
      <div className="ml-0 md:ml-72 w-full flex flex-col">
        <Navbar />

        <div className="p-6 max-w-7xl mx-auto w-full space-y-6 flex-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">Order Logs</p>
            <h1 className="text-3xl font-extrabold tracking-tight">Orders Registry</h1>
          </div>

          {/* SEARCH FILTERS */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <HiOutlineSearch className="h-5 w-5" />
              </span>
              <input
                type="text"
                placeholder="Search by order ID or customer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2.5 pl-11 pr-4 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* ORDERS TABLE */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {loading ? (
              <div className="py-20 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-2 text-xs text-slate-400">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <p className="py-20 text-center text-sm text-slate-400">No orders registered under current filter</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Order ID</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Customer</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Created By</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Payment</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Total Amount</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Order Date</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-6 py-4 text-sm font-bold font-mono text-slate-800 dark:text-slate-100">{order.orderId}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {order.customer?.customerName || "Walk-in"}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                          {order.createdBy?.name || "Cashier"}
                        </td>
                        <td className="px-6 py-4 text-sm uppercase tracking-wider font-semibold text-slate-400">{order.paymentMethod}</td>
                        <td className="px-6 py-4 text-sm font-black text-slate-850 dark:text-white">₹{order.totalAmount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            order.status === "completed" 
                              ? "bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400" 
                              : "bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => viewOrderInvoice(order)}
                              className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl"
                              title="View Invoice"
                            >
                              <HiOutlineEye className="h-5 w-5" />
                            </button>
                            {order.status === "completed" && (
                              <button
                                onClick={() => cancelOrder(order._id)}
                                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl"
                                title="Cancel Order"
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
        </div>
      </div>

      {/* ================= INVOICE VIEWER / RECEIPT MODAL ================= */}
      {showInvoiceModal && activeOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-black p-6 rounded-3xl w-full max-w-sm shadow-2xl relative flex flex-col max-h-[90vh] animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="text-lg font-bold">Invoice Details</h3>
              <button
                onClick={() => { setShowInvoiceModal(false); setActiveOrder(null); }}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            {/* Receipt Content */}
            <div ref={receiptRef} className="flex-1 overflow-y-auto pr-1 text-xs font-mono leading-relaxed">
              <div className="text-center">
                <h2 className="bold text-lg">RETAIL POS</h2>
                <p>123 Store Lane, City Central</p>
                <p>Phone: +91 98765 43210</p>
                <p className="divider"></p>
                <p className="bold text-xs">ORDER STATUS: {activeOrder.status.toUpperCase()}</p>
                <p className="divider"></p>
              </div>

              <div>
                <p>Order ID: {activeOrder.orderId}</p>
                <p>Date: {new Date(activeOrder.createdAt).toLocaleString()}</p>
                <p>Payment: {activeOrder.paymentMethod.toUpperCase()}</p>
                <p>Customer: {activeOrder.customer?.customerName || "Walk-in"}</p>
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
                  {activeOrder.items.map((item, i) => (
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
                  <span>₹{activeOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-₹{activeOrder.discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span>₹{activeOrder.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between bold text-sm">
                  <span>TOTAL AMOUNT:</span>
                  <span>₹{activeOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="divider"></div>
              <div className="text-center mt-20">
                <p className="bold">Thank you for shopping with us!</p>
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
                onClick={() => { setShowInvoiceModal(false); setActiveOrder(null); }}
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

export default Orders;