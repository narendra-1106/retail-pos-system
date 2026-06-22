import { useState } from "react";
import api from "../api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { HiOutlineDownload, HiOutlineDocumentText } from "react-icons/hi";

function Reports() {
  const [reportType, setReportType] = useState("sales"); // 'sales' | 'inventory' | 'customer'
  const [salesPeriod, setSalesPeriod] = useState("daily"); // 'daily' | 'weekly' | 'monthly'
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setReportData(null);
      let endpoint = "";
      if (reportType === "sales") {
        endpoint = `/reports/sales?period=${salesPeriod}`;
      } else if (reportType === "inventory") {
        endpoint = "/reports/inventory";
      } else {
        endpoint = "/reports/customers";
      }

      const res = await api.get(endpoint);
      setReportData(res.data);
    } catch (err) {
      alert("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const query = `/reports/export?type=${reportType}&period=${salesPeriod}`;
      const res = await api.get(query, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report_${reportType === "sales" ? salesPeriod : "all"}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to export CSV report");
    }
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors">
      <Sidebar />
      <div className="ml-0 md:ml-72 w-full flex flex-col">
        <Navbar />

        <div className="p-6 max-w-7xl mx-auto w-full space-y-6 flex-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">Store Audits</p>
            <h1 className="text-3xl font-extrabold tracking-tight">Reports Panel</h1>
          </div>

          {/* CONTROLS */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500">Report Category</label>
              <select
                value={reportType}
                onChange={(e) => { setReportType(e.target.value); setReportData(null); }}
                className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-sm"
              >
                <option value="sales">Sales Performance Report</option>
                <option value="inventory">Inventory Asset Report</option>
                <option value="customer">Customer Loyalty Report</option>
              </select>
            </div>

            {reportType === "sales" && (
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Sales Interval</label>
                <select
                  value={salesPeriod}
                  onChange={(e) => { setSalesPeriod(e.target.value); setReportData(null); }}
                  className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-sm"
                >
                  <option value="daily">Daily Sales (24 Hours)</option>
                  <option value="weekly">Weekly Sales (7 Days)</option>
                  <option value="monthly">Monthly Sales (30 Days)</option>
                </select>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={fetchReport}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition"
              >
                Compile Report
              </button>
              {reportData && (
                <button
                  onClick={handleExportCsv}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-5 py-3 text-sm font-semibold hover:bg-slate-100 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                >
                  <HiOutlineDownload className="h-5 w-5" /> Export Excel
                </button>
              )}
            </div>
          </div>

          {/* REPORT VIEWS */}
          {loading && (
            <div className="py-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-2 text-xs text-slate-400">Compiling report statistics...</p>
            </div>
          )}

          {!loading && !reportData && (
            <div className="py-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400">
              <HiOutlineDocumentText className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm">Click "Compile Report" above to review database audit data.</p>
            </div>
          )}

          {!loading && reportData && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Sales Report View */}
              {reportType === "sales" && (
                <div className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Compiled Sales</span>
                      <span className="text-2xl font-black text-slate-850 dark:text-white mt-1 block">{reportData.totalSales} bookings</span>
                    </div>
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Gross Revenues</span>
                      <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">₹{reportData.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Tax Collected (GST)</span>
                      <span className="text-2xl font-black text-slate-850 dark:text-white mt-1 block">₹{reportData.totalTax.toLocaleString()}</span>
                    </div>
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Discounts Availed</span>
                      <span className="text-2xl font-black text-rose-600 mt-1 block">-₹{reportData.totalDiscount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Orders Registry Log */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-lg font-bold">Transaction Listing</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
                        <thead className="bg-slate-50 dark:bg-slate-950">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Order ID</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Customer Name</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Invoice Value</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Payment</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Date Completed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {reportData.orders.map((o, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="px-6 py-4 text-sm font-bold font-mono text-slate-850 dark:text-slate-100">{o.orderId}</td>
                              <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{o.customerName}</td>
                              <td className="px-6 py-4 text-sm font-black text-right text-slate-850 dark:text-white">₹{o.totalAmount.toLocaleString()}</td>
                              <td className="px-6 py-4 text-xs uppercase font-bold text-slate-400">{o.paymentMethod}</td>
                              <td className="px-6 py-4 text-sm text-slate-400">{new Date(o.date).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Inventory Report View */}
              {reportType === "inventory" && (
                <div className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Store Valuation</span>
                      <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">₹{reportData.totalValuation.toLocaleString()}</span>
                    </div>
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Warehouse Quantity</span>
                      <span className="text-2xl font-black text-slate-850 dark:text-white mt-1 block">{reportData.totalItems} units</span>
                    </div>
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Critical Alerts Count</span>
                      <span className="text-2xl font-black text-rose-600 mt-1 block">{reportData.lowStockItems} SKUs</span>
                    </div>
                  </div>

                  {/* Product items listing */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-lg font-bold">Catalog Valuation breakdown</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
                        <thead className="bg-slate-50 dark:bg-slate-950">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Product SKU</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Barcode</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Price</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">In Stock</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Asset Valuation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {reportData.products.map((p, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="px-6 py-4 text-sm font-bold text-slate-850 dark:text-slate-100">{p.productName}</td>
                              <td className="px-6 py-4 text-sm font-mono text-slate-400">{p.barcode}</td>
                              <td className="px-6 py-4 text-sm text-right text-slate-500 dark:text-slate-400">₹{p.price.toLocaleString()}</td>
                              <td className="px-6 py-4 text-sm text-center">
                                <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${
                                  p.quantity < 10 ? "bg-rose-100 text-rose-700 dark:bg-rose-950/20" : "bg-green-100 text-green-700 dark:bg-green-950/20"
                                }`}>
                                  {p.quantity} units
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-black text-right text-slate-850 dark:text-white">₹{p.valuation.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Report View */}
              {reportType === "customer" && (
                <div className="space-y-6">
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm max-w-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Registered members</span>
                    <span className="text-2xl font-black text-slate-850 dark:text-white mt-1 block">{reportData.totalCustomers} members</span>
                  </div>

                  {/* Customer Rankings */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-lg font-bold">Customer Loyalty rankings</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
                        <thead className="bg-slate-50 dark:bg-slate-950">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Customer Name</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Phone</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Email</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Lifetime purchase</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Loyalty accumulated</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {reportData.topCustomers.map((c, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="px-6 py-4 text-sm font-bold text-slate-850 dark:text-slate-100">{c.customerName}</td>
                              <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{c.phone}</td>
                              <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{c.email}</td>
                              <td className="px-6 py-4 text-sm font-black text-right text-slate-850 dark:text-white">₹{c.totalPurchases.toLocaleString()}</td>
                              <td className="px-6 py-4 text-sm text-center">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
                                  {c.loyaltyPoints} Pts
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Reports;