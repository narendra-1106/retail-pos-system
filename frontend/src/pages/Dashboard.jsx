import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import DashboardCard from "../components/DashboardCard";

function Dashboard() {
  return (

    <div className="flex bg-gray-100 min-h-screen">

      <Sidebar />

      <div className="ml-64 w-full">

        <Navbar />

        <div className="p-6">

          <div className="grid grid-cols-4 gap-6">

            <DashboardCard title="Total Sales" value="₹50,000" />

            <DashboardCard title="Products" value="120" />

            <DashboardCard title="Orders" value="340" />

            <DashboardCard title="Users" value="25" />

            <div className="grid grid-cols-4 gap-6 mt-6">

              <DashboardCard
                title="Revenue"
                value="₹1,20,000"
              />

              <DashboardCard
                title="Products"
                value="120"
              />

              <DashboardCard
                title="Orders"
                value="350"
              />

              <DashboardCard
                title="Inventory Value"
                value="₹5,50,000"
              />

              <DashboardCard
                title="Customers"
                value="85"
              />

            </div>

              </div>

            </div>

          </div>

        </div>

    
  );
}

export default Dashboard;