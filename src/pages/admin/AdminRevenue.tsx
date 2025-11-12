import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { getRevenueStats } from "../../api/admin/analyticsApi";
import { DollarSign, ShoppingCart, TrendingUp, Package } from "lucide-react";

export default function AdminRevenue() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: "",
        endDate: "",
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const data = await getRevenueStats(token, {
                ...(dateRange.startDate && { startDate: dateRange.startDate }),
                ...(dateRange.endDate && { endDate: dateRange.endDate }),
            });
            setStats(data);
        } catch (err) {
            console.error("Failed to load revenue stats:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        setLoading(true);
        loadData();
    };

    const statCards = [
        {
            icon: DollarSign,
            label: "Tổng doanh thu",
            value: stats?.totalRevenue ? `${stats.totalRevenue.toLocaleString()}đ` : "0đ",
            color: "text-green-600",
        },
        {
            icon: ShoppingCart,
            label: "Tổng đơn hàng",
            value: stats?.totalOrders || 0,
            color: "text-blue-600",
        },
        {
            icon: TrendingUp,
            label: "Giá trị đơn trung bình",
            value: stats?.averageOrderValue ? `${stats.averageOrderValue.toLocaleString()}đ` : "0đ",
            color: "text-purple-600",
        },
        {
            icon: Package,
            label: "Sản phẩm đã bán",
            value: stats?.totalProducts || 0,
            color: "text-orange-600",
        },
    ];

    return (
        <AdminLayout>
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Thống kê doanh thu</h1>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            className="border px-3 py-2 rounded"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            placeholder="Từ ngày"
                        />
                        <input
                            type="date"
                            className="border px-3 py-2 rounded"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            placeholder="Đến ngày"
                        />
                        <button
                            onClick={handleFilter}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Lọc
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">Đang tải...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {statCards.map((stat, idx) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={idx} className="bg-white p-6 rounded-lg shadow">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-neutral-600 text-sm">{stat.label}</p>
                                                <p className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                                            </div>
                                            <Icon className={stat.color} size={32} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {stats?.revenueByMonth && stats.revenueByMonth.length > 0 && (
                            <div className="bg-white rounded-lg shadow p-6 mb-8">
                                <h2 className="text-xl font-bold mb-4">Doanh thu theo tháng</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-neutral-100">
                                            <tr>
                                                <th className="px-6 py-3 text-left">Tháng</th>
                                                <th className="px-6 py-3 text-left">Doanh thu</th>
                                                <th className="px-6 py-3 text-left">Số đơn</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.revenueByMonth.map((month: any, idx: number) => (
                                                <tr key={idx} className="border-t">
                                                    <td className="px-6 py-4">{month.month}</td>
                                                    <td className="px-6 py-4 font-semibold text-green-600">
                                                        {month.revenue.toLocaleString()}đ
                                                    </td>
                                                    <td className="px-6 py-4">{month.orders}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {stats?.revenueByCategory && stats.revenueByCategory.length > 0 && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-bold mb-4">Doanh thu theo danh mục</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-neutral-100">
                                            <tr>
                                                <th className="px-6 py-3 text-left">Danh mục</th>
                                                <th className="px-6 py-3 text-left">Doanh thu</th>
                                                <th className="px-6 py-3 text-left">Số lượng</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.revenueByCategory.map((cat: any, idx: number) => (
                                                <tr key={idx} className="border-t">
                                                    <td className="px-6 py-4 font-medium">{cat.categoryName}</td>
                                                    <td className="px-6 py-4 font-semibold text-green-600">
                                                        {cat.revenue.toLocaleString()}đ
                                                    </td>
                                                    <td className="px-6 py-4">{cat.quantity}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdminLayout>
    );
}

