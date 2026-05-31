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
} from "react-icons/hi";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const stats = [
  {
    title: "Total Revenue",
    value: "₹1.2M",
    description: "12.5% increase from last month",
    icon: HiOutlineCash,
    iconClass: "bg-blue-600 text-white",
  },
  {
    title: "Total Products",
    value: "320",
    description: "New products added this quarter",
    icon: HiOutlineCube,
    iconClass: "bg-sky-500 text-white",
  },
  {
    title: "Total Orders",
    value: "1,980",
    description: "Orders processed this month",
    icon: HiOutlineShoppingCart,
    iconClass: "bg-emerald-500 text-white",
  },
  {
    title: "Total Customers",
    value: "1,240",
    description: "Active customers this month",
    icon: HiOutlineUserGroup,
    iconClass: "bg-violet-500 text-white",
  },
  {
    title: "Inventory Value",
    value: "₹750K",
    description: "Total stock valuation",
    icon: HiOutlineChartBar,
    iconClass: "bg-indigo-500 text-white",
  },
  {
    title: "Low Stock Products",
    value: "12",
    description: "Products requiring restock",
    icon: HiOutlineExclamationCircle,
    iconClass: "bg-amber-500 text-white",
  },
];

const monthlySales = [
  { month: "Jan", sales: 34000 },
  { month: "Feb", sales: 42000 },
  { month: "Mar", sales: 51000 },
  { month: "Apr", sales: 47000 },
  { month: "May", sales: 59000 },
  { month: "Jun", sales: 67000 },
];

const revenueOverview = [
  { month: "Jan", revenue: 28000 },
  { month: "Feb", revenue: 33000 },
  { month: "Mar", revenue: 39000 },
  { month: "Apr", revenue: 45000 },
  { month: "May", revenue: 54000 },
  { month: "Jun", revenue: 62000 },
];

const recentOrders = [
  { id: "#OD3542", customer: "Mira Patel", amount: "₹5,800", status: "Completed" },
  { id: "#OD3538", customer: "Rahul Sen", amount: "₹2,400", status: "Processing" },
  { id: "#OD3520", customer: "Sneha Rao", amount: "₹8,900", status: "Delivered" },
  { id: "#OD3511", customer: "Amit Kumar", amount: "₹1,200", status: "Cancelled" },
];

const lowStockAlerts = [
  { name: "Wireless Charger", quantity: 4 },
  { name: "Denim Jacket", quantity: 6 },
  { name: "Desk Lamp", quantity: 3 },
];

const statusStyle = (status) => {
  switch (status) {
    case "Completed":
      return "bg-emerald-100 text-emerald-700";
    case "Processing":
      return "bg-amber-100 text-amber-700";
    case "Delivered":
      return "bg-sky-100 text-sky-700";
    case "Cancelled":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Sidebar />
      <div className="ml-0 md:ml-72">
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Retail POS Overview</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                Export Report
              </button>
              <button className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                New Order
              </button>
            </div>
          </div>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-3xl ${item.iconClass}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <p className="mt-6 text-sm font-medium uppercase tracking-[0.24em] text-slate-500">{item.title}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{item.value}</p>
                  <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                </div>
              );
            })}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Monthly Sales</h2>
                  <p className="text-sm text-slate-500">Revenue performance over the last 6 months.</p>
                </div>
              </div>

              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="sales" stroke="#2563eb" fill="url(#salesGradient)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Revenue Overview</h2>
                    <p className="text-sm text-slate-500">Monthly revenue trend and growth.</p>
                  </div>
                </div>

                <div className="mt-6 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueOverview} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#2563eb" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Low Stock Alerts</h2>
                    <p className="text-sm text-slate-500">Products that need a restock.</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Urgent</span>
                </div>
                <div className="mt-6 space-y-4">
                  {lowStockAlerts.map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">{item.quantity} units remaining</p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Low stock</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Recent Activity</h2>
                  <p className="text-sm text-slate-500">Latest orders in the system.</p>
                </div>
                <button className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                  View All Orders
                </button>
              </div>
              <div className="overflow-hidden rounded-3xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Order ID</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Customer</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{order.id}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{order.customer}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">{order.amount}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
