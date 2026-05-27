function DashboardCard({ title, value }) {

  return (

    <div className="bg-white p-6 rounded-xl shadow">

      <h2 className="text-gray-500 text-lg">
        {title}
      </h2>

      <h1 className="text-3xl font-bold mt-2">
        {value}
      </h1>

    </div>
  );
}

export default DashboardCard;