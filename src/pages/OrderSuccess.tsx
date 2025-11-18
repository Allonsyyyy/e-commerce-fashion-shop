import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Container from "../components/Container";

export default function OrderSuccess() {
	const [params] = useSearchParams();
	const location = useLocation();

	const txnRef = params.get("vnp_TxnRef");
	const statusCode = params.get("vnp_ResponseCode");
	const manualStatus = params.get("status");
	const queryOrderId = params.get("orderId");
	const derivedOrderId = queryOrderId || (txnRef ? txnRef.split("_")[0] : null);
	const isVNPayFlow = Boolean(statusCode);
	const [order, setOrder] = useState<any>((location.state as any)?.order || null);
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
			setError("Please sign in to view your order details.");
			return;
		}

		setLoading(true);
		fetch(`http://localhost:3000/api/v1/orders/${derivedOrderId}`, {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => res.json())
			.then((data) => setOrder(data))
			.catch(() => setError("Unable to load your order information."))
			.finally(() => setLoading(false));
	}, [derivedOrderId, isSuccess, order]);

	const failureMessage = isVNPayFlow
		? "We could not complete your payment. Please try again."
		: manualStatus === "failed"
			? "The payment was cancelled or not completed."
			: "We could not complete your payment. Please try again.";

	if (!isSuccess) {
		return (
			<main className="py-12">
				<Container>
					<h1 className="heading-3 mb-4 text-red-600">Payment failed</h1>
					<p className="mb-4">{failureMessage}</p>
					<a href="/cart" className="btn-primary">
						Try again
					</a>
				</Container>
			</main>
		);
	}

	if (loading) {
		return <div className="py-20 text-center">Loading order information...</div>;
	}

	if (!order) {
		return (
			<main className="py-12">
				<Container>
					<h1 className="heading-3 mb-4">Could not load order details</h1>
					<p className="mb-6 text-neutral-600">{error || "Please try again later."}</p>
					<a href="/shop" className="btn-primary">
						Back to shop
					</a>
				</Container>
			</main>
		);
	}

	return (
		<main className="py-12">
			<Container>
				<h1 className="heading-3 mb-6 text-green-600">Order placed successfully</h1>
				<p>
					Order ID: <strong>#{order.id}</strong>
				</p>
				<p>
					Total amount: <strong>{Number(order.totalAmount).toLocaleString()}₫</strong>
				</p>
				<p>
					Payment method: <strong>{order.paymentMethod?.toUpperCase() || "COD"}</strong>
				</p>
				<p>
					Shipping address: <strong>{order.shippingAddress || "Updating..."}</strong>
				</p>

				<div className="mt-6">
					<h2 className="heading-4 mb-2">Products</h2>
					<ul className="space-y-3">
						{order.items?.map((item: any) => (
							<li key={item.id} className="border p-3 rounded-md">
								{item.variant?.product?.name} x {item.quantity}
							</li>
						))}
					</ul>
				</div>

				<a href="/shop" className="btn-primary mt-8 inline-block">
					Continue shopping
				</a>
			</Container>
		</main>
	);
}
