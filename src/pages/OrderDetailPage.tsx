import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Container from "../components/Container";
import { getShippingOrder } from "../api/shippingApi";

export default function OrderDetailPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [order, setOrder] = useState<any>(null);
	const [shipping, setShipping] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			navigate("/login");
			return;
		}
		if (!id) {
			setError("Không tìm thấy đơn hàng.");
			setLoading(false);
			return;
		}

		const load = async () => {
			try {
				setLoading(true);
				const res = await fetch(`http://localhost:3000/api/v1/orders/${id}`, {
					headers: { Authorization: `Bearer ${token}` },
				}).then((r) => r.json());
				setOrder(res);

				if (res?.ghnOrderCode) {
					const shippingRes = await getShippingOrder(res.ghnOrderCode);
					setShipping(shippingRes.data);
				}
			} catch (err: any) {
				console.error(err);
				setError("Không thể tải thông tin đơn hàng.");
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [id, navigate]);

	if (loading) return <div className="py-20 text-center">Đang tải đơn hàng...</div>;
	if (error)
		return (
			<main className="py-12">
				<Container>
					<h1 className="heading-3 mb-4">Chi tiết đơn hàng</h1>
					<p className="text-neutral-600">{error}</p>
				</Container>
			</main>
		);
	if (!order)
		return (
			<main className="py-12">
				<Container>
					<h1 className="heading-3 mb-4">Chi tiết đơn hàng</h1>
					<p className="text-neutral-600">Không có dữ liệu đơn hàng.</p>
				</Container>
			</main>
		);

	const logs: Array<{ status: string; updated_date?: string }> = shipping?.log ?? [];

	return (
		<main className="py-12">
			<Container>
				<div className="flex items-center justify-between mb-6">
					<div>
						<h1 className="heading-3">Đơn hàng #{order.id}</h1>
						<p className="text-neutral-600">Trạng thái: {order.orderStatus}</p>
					</div>
					<button className="btn-secondary" onClick={() => navigate(-1)}>
						← Quay lại
					</button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div className="card space-y-3">
						<h2 className="heading-4">Thông tin đơn hàng</h2>
						<p>
							<strong>Tổng tiền:</strong> {Number(order.totalAmount).toLocaleString()}₫
						</p>
						<p>
							<strong>Phương thức thanh toán:</strong> {order.paymentMethod?.toUpperCase()}
						</p>
						<p>
							<strong>Địa chỉ giao hàng:</strong> {order.shippingAddress}
						</p>
						<div>
							<strong>Sản phẩm:</strong>
							<ul className="mt-2 space-y-1 text-sm text-neutral-700">
								{order.items?.map((item: any) => (
									<li key={item.id}>
										{item.variant?.product?.name} x {item.quantity}
									</li>
								))}
							</ul>
						</div>
					</div>

					<div className="card space-y-3">
						<h2 className="heading-4">Trạng thái vận chuyển</h2>
						{order.ghnOrderCode ? (
							shipping ? (
								<>
									<p>
										<strong>Mã vận đơn GHN:</strong> {order.ghnOrderCode}
									</p>
									<p>
										<strong>Trạng thái hiện tại:</strong> {shipping.status}
									</p>
									<div>
										<strong>Lịch sử:</strong>
										<ul className="mt-3 space-y-2 text-sm text-neutral-700">
											{logs.length === 0 && <li>Chưa có dữ liệu cập nhật.</li>}
											{logs.map((log, idx) => (
												<li key={`${log.status}-${idx}`} className="flex justify-between border-b pb-1">
													<span>{log.status}</span>
													<span className="text-xs text-neutral-500">
														{log.updated_date ? new Date(log.updated_date).toLocaleString() : ""}
													</span>
												</li>
											))}
										</ul>
									</div>
								</>
							) : (
								<p>Không lấy được thông tin vận chuyển.</p>
							)
						) : (
							<p>Đơn hàng chưa được tạo vận đơn.</p>
						)}
					</div>
				</div>
			</Container>
		</main>
	);
}
