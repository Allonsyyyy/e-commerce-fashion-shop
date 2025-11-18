import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { DollarSign, ShoppingCart, TrendingUp, Package } from "lucide-react";
import { getRevenueStats, type RevenueStats } from "../../api/admin/analyticsApi";

const initialRange = { startDate: "", endDate: "" };

export default function AdminRevenue() {
	const [stats, setStats] = useState<RevenueStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [dateRange, setDateRange] = useState(initialRange);

	useEffect(() => {
		loadData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const loadData = async () => {
		const token = localStorage.getItem("token");
		if (!token) return;
		setLoading(true);
		try {
			const data = await getRevenueStats(token, {
				...(dateRange.startDate && { startDate: dateRange.startDate }),
				...(dateRange.endDate && { endDate: dateRange.endDate }),
			});
			setStats(data);
		} catch (err) {
			console.error("Failed to load revenue stats:", err);
			setStats(null);
		} finally {
			setLoading(false);
		}
	};

	const statCards = [
		{
			icon: DollarSign,
			label: "Tổng doanh thu",
			value: stats?.totalRevenue ? `${stats.totalRevenue.toLocaleString()}₫` : "0₫",
			color: "text-green-600",
		},
		{
			icon: ShoppingCart,
			label: "Tổng đơn hàng",
			value: stats?.totalOrders ?? 0,
			color: "text-blue-600",
		},
		{
			icon: TrendingUp,
			label: "Giá trị đơn trung bình",
			value: stats?.averageOrderValue ? `${stats.averageOrderValue.toLocaleString()}₫` : "0₫",
			color: "text-purple-600",
		},
		{
			icon: Package,
			label: "Sản phẩm đã bán",
			value: stats?.productsSold ?? 0,
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
						/>
						<input
							type="date"
							className="border px-3 py-2 rounded"
							value={dateRange.endDate}
							onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
						/>
						<button
							onClick={loadData}
							className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
						>
							Lọc
						</button>
					</div>
				</div>

				{loading ? (
					<div className="text-center py-12">Đang tải...</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
				)}
			</div>
		</AdminLayout>
	);
}
