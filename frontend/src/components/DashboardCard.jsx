function DashboardCard({ title, value, subtitle, icon: Icon, iconClass = "bg-blue-500" }) {
  return (
    <div className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 p-6">
      <div className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl text-white ${iconClass}`}>
        {Icon && <Icon className="h-7 w-7" />}
      </div>
      <div className="mt-6">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
        {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

export default DashboardCard;