import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";

const data = [
    { month: "Jan", sales: 4000 },
    { month: "Feb", sales: 3000 },
    { month: "Mar", sales: 5000 },
    { month: "Apr", sales: 4500 },
];

function Analytics() {
    return (
        <div className="p-6">

            <h1 className="text-3xl font-bold mb-6">
                Sales Analytics
            </h1>

            <div className="bg-white p-6 rounded shadow">

                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sales" />
                    </BarChart>
                </ResponsiveContainer>

            </div>

        </div>
    );
}

export default Analytics;