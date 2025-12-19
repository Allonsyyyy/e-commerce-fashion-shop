import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Container from "../components/Container";
import { CheckCircle2, Truck, Package, MapPin, CreditCard, ArrowRight, Clock } from "lucide-react";

export default function OrderSuccess() {
	const [params] = useSearchParams();
	const location = useLocation();

	const txnRef = params.get("vnp_TxnRef");
	const statusCode = params.get("vnp_ResponseCode");
	const manualStatus = params.get("status");
	const queryOrderId = params.get("orderId");
	const derivedOrderId = queryOrderId || (txnRef ? txnRef.split("_")[0] : null);
	const isVNPayFlow = Boolean(statusCode);
	const routeState = location.state as any;
	const [order, setOrder] = useState<any>(routeState?.order || null);
	const clientTotals = routeState?.clientTotals;
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const isSuccess = isVNPayFlow
		? statusCode === "00"
		: manualStatus !== null
			? manualStatus === "success"
			: Boolean(derivedOrderId || order);

	useEffect(() => {
		if (!isSuccess) return;
		const needsFetch = !order || !order.items || order.items.length === 0;
		if (!needsFetch) return;
		if (!derivedOrderId) return;

		const token = localStorage.getItem("token");
		if (!token) {
			setError("Vui lòng đăng nhập để xem chi tiết đơn hàng.");
			return;
		}

		setLoading(true);
		fetch(`http://localhost:3000/api/v1/orders/${derivedOrderId}`, {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => res.json())
			.then((data) => setOrder(data))
			.catch(() => setError("Không tải được thông tin đơn hàng."))
			.finally(() => setLoading(false));
	}, [derivedOrderId, isSuccess, order]);

	const failureMessage = isVNPayFlow
		? "Thanh toán không thành công. Vui lòng thử lại."
		: manualStatus === "failed"
			? "Thanh toán bị hủy hoặc chưa hoàn tất."
			: "Thanh toán không thành công. Vui lòng thử lại.";

	if (!isSuccess) {
		return (
			<main className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white py-16">
				<Container>
					<div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl px-10 py-12 text-center border border-red-100">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-6">
							<Clock className="w-8 h-8" />
						</div>
						<h1 className="heading-3 mb-4 text-red-600">Thanh toán thất bại</h1>
						<p className="mb-8 text-neutral-600">{failureMessage}</p>
						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<a href="/cart" className="btn-primary px-8 py-3">
								Thử lại
							</a>
							<a href="/shop" className="btn-secondary px-8 py-3">
								Tiếp tục mua sắm
							</a>
						</div>
					</div>
				</Container>
			</main>
		);
	}

	if (loading) {
		return (
			<main className="min-h-screen flex items-center justify-center bg-neutral-50">
				<p className="text-neutral-600">Đang tải thông tin đơn hàng...</p>
			</main>
		);
	}

	if (!order) {
		return (
			<main className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-white py-16">
				<Container>
					<div className="max-w-3xl mx-auto text-center bg-white rounded-3xl shadow-xl border border-neutral-100 px-10 py-12">
						<h1 className="heading-3 mb-4">Không tải được chi tiết đơn</h1>
						<p className="mb-6 text-neutral-600">{error || "Vui lòng thử lại sau."}</p>
						<a href="/shop" className="btn-primary px-8 py-3">
							Về trang mua sắm
						</a>
					</div>
				</Container>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white py-12">
			<Container>
				<div className="max-w-5xl mx-auto space-y-8">
					<div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
						<div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-10 text-white">
							<div className="flex items-center gap-4">
								<div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center">
									<CheckCircle2 className="w-10 h-10" />
								</div>
								<div>
									<p className="text-sm uppercase tracking-wide text-white/80">Đặt hàng thành công</p>
									<h1 className="text-3xl font-bold mt-2">Cảm ơn bạn đã tin tưởng Fashion Shop!</h1>
								</div>
							</div>
						</div>

						<div className="px-8 py-10 space-y-8">
							<div className="grid gap-6 md:grid-cols-2">
								<div className="p-6 rounded-2xl border border-neutral-100 bg-neutral-50">
									<p className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Thông tin đơn hàng</p>
									<div className="space-y-2 text-sm text-neutral-600">
										<p className="flex justify-between">
											<span>Mã đơn</span>
											<strong className="text-neutral-900">#{order.id}</strong>
										</p>
										<p className="flex justify-between">
											<span>Tổng tiền</span>
											<strong className="text-neutral-900">
												{Number(
													clientTotals?.total ?? order.totalAmount,
												).toLocaleString("vi-VN")}
												₫
											</strong>
										</p>
										<p className="flex justify-between">
											<span>Trạng thái</span>
											<span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
												<Truck className="w-4 h-4" />
												{order.shipmentStatus || "Đang xử lý"}
											</span>
										</p>
									</div>
								</div>
								<div className="p-6 rounded-2xl border border-neutral-100 bg-neutral-50">
									<p className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Thanh toán & giao hàng</p>
									<ul className="space-y-3 text-sm text-neutral-600">
										<li className="flex items-center gap-3">
											<CreditCard className="w-4 h-4 text-neutral-400" />
											<span>Phương thức: {order.paymentMethod?.toUpperCase() || "COD"}</span>
										</li>
										<li className="flex items-start gap-3">
											<MapPin className="w-4 h-4 text-neutral-400 mt-0.5" />
											<span>Giao tới: {order.shippingAddress || "Đang cập nhật..."}</span>
										</li>
										<li className="flex items-center gap-3">
											<Clock className="w-4 h-4 text-neutral-400" />
											<span>Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}</span>
										</li>
									</ul>
								</div>
							</div>

							<div className="space-y-4">
								{clientTotals && (
									<div className="rounded-2xl border border-neutral-100 bg-white p-4">
										<p className="text-xs uppercase tracking-wide text-neutral-500 mb-2">
											Chi tiết thanh toán
										</p>
										<div className="space-y-2 text-sm text-neutral-600">
											<div className="flex justify-between">
												<span>Tạm tính</span>
												<span>
													{clientTotals.originalSubtotal.toLocaleString("vi-VN")}₫
												</span>
											</div>
											{clientTotals.discountAmount > 0 && (
												<div className="flex justify-between text-emerald-600">
													<span>Giảm giá</span>
													<span>
														-
														{clientTotals.discountAmount.toLocaleString("vi-VN")}₫
													</span>
												</div>
											)}
											<div className="flex justify-between">
												<span>Phí vận chuyển</span>
												<span>
													{clientTotals.shippingFee.toLocaleString("vi-VN")}₫
												</span>
											</div>
											<div className="flex justify-between font-semibold text-neutral-900 border-t border-neutral-100 pt-2">
												<span>Tổng thanh toán</span>
												<span>
													{clientTotals.total.toLocaleString("vi-VN")}₫
												</span>
											</div>
										</div>
									</div>
								)}
								<div className="flex items-center justify-between">
									<div>
										<p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Danh sách sản phẩm</p>
										<h2 className="text-xl font-semibold text-neutral-900">Bạn đã chọn</h2>
									</div>
									<span className="text-sm text-neutral-500">
										{order.items?.length || 0} sản phẩm •{" "}
										{Number(clientTotals?.total ?? order.totalAmount).toLocaleString("vi-VN")}₫
									</span>
								</div>

								<div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-100 overflow-hidden bg-white">
									{order.items?.map((item: any) => (
										<div key={item.id} className="p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
											<div className="flex items-start gap-3">
												<div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center">
													<Package className="w-5 h-5 text-neutral-500" />
												</div>
												<div>
													<p className="font-medium text-neutral-900">{item.variant?.product?.name}</p>
													<p className="text-sm text-neutral-500">
														SKU: {item.variant?.sku || "N/A"} • x{item.quantity}
													</p>
												</div>
											</div>
											<p className="text-sm font-semibold text-neutral-900">
												{Number(item.price || item.variant?.price || 0).toLocaleString("vi-VN")}₫
											</p>
										</div>
									))}
								</div>
							</div>

							<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
								<div className="text-sm text-neutral-500">
									<p>Đơn hàng đã được ghi nhận. Chúng mình sẽ cập nhật trạng thái vận chuyển liên tục.</p>
								</div>
								<div className="flex flex-col sm:flex-row gap-3">
									<a href="/orders" className="btn-secondary flex items-center justify-center gap-2 px-6 py-3">
										<Truck className="w-4 h-4" />
										Theo dõi đơn hàng
									</a>
									<a href="/shop" className="btn-primary flex items-center justify-center gap-2 px-6 py-3">
										Tiếp tục mua sắm
										<ArrowRight className="w-4 h-4" />
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Container>
		</main>
	);
}
