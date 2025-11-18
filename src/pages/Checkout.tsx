import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart } from "../api/cartApi";
import { checkoutFromCart } from "../api/ordersApi";
import { validateDiscountCode } from "../api/discountsApi";
import Container from "../components/Container";
import { CreditCard, Truck, MapPin, Tag, CheckCircle, XCircle } from "lucide-react";

export default function Checkout() {
	const navigate = useNavigate();
	const [cart, setCart] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [processing, setProcessing] = useState(false);
	const [formData, setFormData] = useState({
		shippingAddress: "",
		paymentMethod: "cod" as "cod" | "vnpay",
	});
	const [discountCode, setDiscountCode] = useState("");
	const [discount, setDiscount] = useState<any>(null);
	const [discountError, setDiscountError] = useState("");
	const [validatingDiscount, setValidatingDiscount] = useState(false);

	useEffect(() => {
		loadCart();
	}, []);

	const loadCart = async () => {
		const token = localStorage.getItem("token");
		if (!token) {
			navigate("/login");
			return;
		}
		try {
			const cartData = await getCart(token);
			setCart(cartData);
		} catch (err) {
			console.error("Failed to load cart:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleValidateDiscount = async () => {
		if (!discountCode.trim()) {
			setDiscountError("Please enter a discount code");
			return;
		}

		setValidatingDiscount(true);
		setDiscountError("");

		try {
			const result = await validateDiscountCode(discountCode);
			if (result.valid && result.discount) {
				setDiscount(result.discount);
				setDiscountError("");
			} else {
				setDiscount(null);
				setDiscountError(result.message || "Invalid discount code");
			}
		} catch (err: any) {
			setDiscount(null);
			setDiscountError(err.message || "An error occurred while validating the discount code");
		} finally {
			setValidatingDiscount(false);
		}
	};

	const handleRemoveDiscount = () => {
		setDiscount(null);
		setDiscountCode("");
		setDiscountError("");
	};

	const calculateTotal = () => {
		if (!cart) return 0;
		const subtotal = Number(cart.totalPrice);
		const discountAmount = discount
			? (subtotal * Number(discount.discountPercent)) / 100
			: 0;
		return subtotal - discountAmount;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.shippingAddress.trim()) {
			alert("Please enter shipping address");
			return;
		}

		const token = localStorage.getItem("token");
		if (!token) {
			navigate("/login");
			return;
		}

		setProcessing(true);
		try {
			const resp = await checkoutFromCart(token, {
				paymentMethod: formData.paymentMethod,
				shippingAddress: formData.shippingAddress,
			});

			if (resp.payUrl) {
				window.location.href = resp.payUrl;
			} else {
				navigate("/order-success");
			}
		} catch (err: any) {
			alert(err.message || "Checkout failed!");
		} finally {
			setProcessing(false);
		}
	};

	if (loading) {
		return (
			<main className="py-20">
				<Container>
					<div className="text-center">Loading...</div>
				</Container>
			</main>
		);
	}

	if (!cart || !cart.items || cart.items.length === 0) {
		return (
			<main className="py-20">
				<Container>
					<div className="text-center">
						<h1 className="heading-3 mb-4">Your Cart is Empty</h1>
						<button
							onClick={() => navigate("/shop")}
							className="btn-primary"
						>
							Continue Shopping
						</button>
					</div>
				</Container>
			</main>
		);
	}

	const subtotal = Number(cart.totalPrice);
	const discountAmount = discount ? (subtotal * Number(discount.discountPercent)) / 100 : 0;
	const total = subtotal - discountAmount;

	return (
		<main className="py-12 bg-neutral-50 min-h-screen">
			<Container>
				<h1 className="heading-3 mb-8">Checkout</h1>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Form Section */}
					<form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
						{/* Shipping Address */}
						<div className="card">
							<div className="flex items-center gap-3 mb-4">
								<MapPin className="h-5 w-5 text-neutral-600" />
								<h2 className="heading-4">Shipping Address</h2>
							</div>
							<textarea
								className="input w-full min-h-[100px] resize-none"
								placeholder="Enter full shipping address..."
								value={formData.shippingAddress}
								onChange={(e) =>
									setFormData({ ...formData, shippingAddress: e.target.value })
								}
								required
							/>
						</div>

						{/* Payment Method */}
						<div className="card">
							<div className="flex items-center gap-3 mb-4">
								<CreditCard className="h-5 w-5 text-neutral-600" />
								<h2 className="heading-4">Payment Method</h2>
							</div>
							<div className="space-y-3">
								<label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
									<input
										type="radio"
										name="paymentMethod"
										value="cod"
										checked={formData.paymentMethod === "cod"}
										onChange={(e) =>
											setFormData({
												...formData,
												paymentMethod: e.target.value as "cod" | "vnpay",
											})
										}
										className="w-4 h-4 text-neutral-900"
									/>
									<div className="flex-1">
										<div className="font-medium">Cash on Delivery (COD)</div>
										<div className="text-sm text-neutral-600">
											Pay with cash when you receive the order
										</div>
									</div>
								</label>
								<label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
									<input
										type="radio"
										name="paymentMethod"
										value="vnpay"
										checked={formData.paymentMethod === "vnpay"}
										onChange={(e) =>
											setFormData({
												...formData,
												paymentMethod: e.target.value as "cod" | "vnpay",
											})
										}
										className="w-4 h-4 text-neutral-900"
									/>
									<div className="flex-1">
										<div className="font-medium">VNPay</div>
										<div className="text-sm text-neutral-600">
											Pay online via VNPay
										</div>
									</div>
								</label>
							</div>
						</div>

						{/* Discount Code */}
						<div className="card">
							<div className="flex items-center gap-3 mb-4">
								<Tag className="h-5 w-5 text-neutral-600" />
								<h2 className="heading-4">Discount Code</h2>
							</div>
							{discount ? (
								<div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
									<div className="flex items-center gap-3">
										<CheckCircle className="h-5 w-5 text-green-600" />
										<div>
											<div className="font-medium text-green-900">
												Code: {discount.code}
											</div>
											<div className="text-sm text-green-700">
												{discount.discountPercent}% off
											</div>
										</div>
									</div>
									<button
										type="button"
										onClick={handleRemoveDiscount}
										className="text-green-700 hover:text-green-900"
									>
										<XCircle className="h-5 w-5" />
									</button>
								</div>
							) : (
								<div className="flex gap-2">
									<input
										type="text"
										className="input flex-1"
										placeholder="Enter discount code"
										value={discountCode}
										onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
										onKeyPress={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												handleValidateDiscount();
											}
										}}
									/>
									<button
										type="button"
										onClick={handleValidateDiscount}
										disabled={validatingDiscount}
										className="btn-secondary whitespace-nowrap"
									>
										{validatingDiscount ? "Validating..." : "Apply"}
									</button>
								</div>
							)}
							{discountError && (
								<div className="mt-2 text-sm text-red-600 flex items-center gap-2">
									<XCircle className="h-4 w-4" />
									{discountError}
								</div>
							)}
						</div>

						<button
							type="submit"
							disabled={processing}
							className="btn-primary w-full py-3 text-lg"
						>
							{processing ? "Processing..." : "Place Order"}
						</button>
					</form>

					{/* Order Summary */}
					<div className="lg:col-span-1">
						<div className="card sticky top-4">
							<h2 className="heading-4 mb-6">Order Summary</h2>

							{/* Cart Items */}
							<div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
								{cart.items.map((item: any) => (
									<div key={item.id} className="flex gap-3">
										<img
											src={
												item.variant?.imageUrl ||
												item.variant?.product?.mainImageUrl
											}
											alt={item.variant?.product?.name}
											className="w-16 h-16 rounded-lg object-cover"
										/>
										<div className="flex-1 min-w-0">
											<p className="font-medium text-sm truncate">
												{item.variant?.product?.name}
											</p>
											<p className="text-xs text-neutral-600">
												{item.variant?.size?.size} - {item.variant?.color?.color}
											</p>
											<p className="text-sm font-semibold mt-1">
												{Number(item.price).toLocaleString()}₫ x {item.quantity}
											</p>
										</div>
									</div>
								))}
							</div>

							<div className="border-t border-neutral-200 pt-4 space-y-3">
								<div className="flex items-center justify-between body-small">
									<span>Subtotal</span>
									<span className="font-semibold">
										{subtotal.toLocaleString()}₫
									</span>
								</div>
								{discount && (
									<div className="flex items-center justify-between body-small text-green-600">
										<span>Discount ({discount.discountPercent}%)</span>
										<span className="font-semibold">
											-{discountAmount.toLocaleString()}₫
										</span>
									</div>
								)}
								<div className="flex items-center justify-between body-small">
									<span>Shipping</span>
									<span className="font-semibold">Free</span>
								</div>
								<div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
									<span className="font-semibold text-lg text-neutral-900">
										Total
									</span>
									<span className="font-bold text-xl text-neutral-900">
										{total.toLocaleString()}₫
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Container>
		</main>
	);
}
