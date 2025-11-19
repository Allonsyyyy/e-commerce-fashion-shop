import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Container from "../components/Container";
import { getCart } from "../api/cartApi";
import { buyNow, checkoutFromCart } from "../api/ordersApi";
import {
	calculateShippingFee,
	fetchDistricts,
	fetchProvinces,
	fetchWards,
	type District,
	type Province,
	type ShippingFeeQuote,
	type Ward,
} from "../api/shippingApi";

type PaymentMethod = "cod" | "vnpay";
type BuyNowSession = {
	variantId: number;
	quantity: number;
	price: number;
	productName: string;
	imageUrl?: string;
	weight?: number;
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
	style: "currency",
	currency: "VND",
});

const formatCurrency = (value: number) => currencyFormatter.format(Number(value) || 0);

export default function Checkout() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const isBuyNowMode = searchParams.get("mode") === "buy-now";
	const [cart, setCart] = useState<any | null>(null);
	const [loadingCart, setLoadingCart] = useState(true);
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [buyNowItem, setBuyNowItem] = useState<BuyNowSession | null>(null);

	const [provinces, setProvinces] = useState<Province[]>([]);
	const [districts, setDistricts] = useState<District[]>([]);
	const [wards, setWards] = useState<Ward[]>([]);
	const [provinceId, setProvinceId] = useState<string>("");
	const [districtId, setDistrictId] = useState<string>("");
	const [wardCode, setWardCode] = useState<string>("");

	const [form, setForm] = useState({
		fullName: "",
		phone: "",
		street: "",
	});

	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
	const [shippingFee, setShippingFee] = useState<number | null>(null);
	const [calculatingFee, setCalculatingFee] = useState(false);
	const [shippingError, setShippingError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (!isBuyNowMode) {
			sessionStorage.removeItem("buyNowItem");
			setBuyNowItem(null);
			return;
		}
		const stored = sessionStorage.getItem("buyNowItem");
		if (!stored) {
			setBuyNowItem(null);
			return;
		}
		try {
			setBuyNowItem(JSON.parse(stored));
		} catch {
			setBuyNowItem(null);
		}
	}, [isBuyNowMode]);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			navigate("/login");
			return;
		}

		if (isBuyNowMode) {
			setLoadingCart(false);
			setCart(null);
			return;
		}

		setLoadingCart(true);
		setGlobalError(null);

		getCart(token)
			.then((data) => setCart(data))
			.catch((err: unknown) => {
				console.error(err);
				setGlobalError("Cannot load cart. Please try again.");
			})
			.finally(() => setLoadingCart(false));
	}, [navigate, isBuyNowMode]);

	useEffect(() => {
		fetchProvinces()
			.then(setProvinces)
			.catch((err: unknown) => {
				console.error(err);
				setGlobalError("Unable to load provinces.");
			});
	}, []);

	useEffect(() => {
		if (!provinceId) {
			setDistricts([]);
			setDistrictId("");
			return;
		}
		setDistricts([]);
		setDistrictId("");
		setWardCode("");
		setWards([]);
		fetchDistricts(Number(provinceId))
			.then(setDistricts)
			.catch((err: unknown) => {
				console.error(err);
				setGlobalError("Unable to load districts.");
			});
	}, [provinceId]);

	useEffect(() => {
		if (!districtId) {
			setWardCode("");
			setWards([]);
			return;
		}
		setWardCode("");
		setWards([]);
		fetchWards(Number(districtId))
			.then(setWards)
			.catch((err: unknown) => {
				console.error(err);
				setGlobalError("Unable to load wards.");
			});
	}, [districtId]);

	const totalWeight = useMemo(() => {
		if (isBuyNowMode && buyNowItem) {
			const base = buyNowItem.weight ?? 200;
			return base * buyNowItem.quantity;
		}
		if (!cart?.items?.length) return 0;
		const baseWeight = 200;
		return cart.items.reduce((sum: number, item: any) => sum + baseWeight * item.quantity, 0) || baseWeight;
	}, [cart, isBuyNowMode, buyNowItem]);

	const orderItems = useMemo(() => {
		if (isBuyNowMode && buyNowItem) {
			return [
				{
					id: buyNowItem.variantId,
					quantity: buyNowItem.quantity,
					price: buyNowItem.price,
					variant: {
						product: {
							name: buyNowItem.productName,
							mainImageUrl: buyNowItem.imageUrl,
						},
					},
				},
			];
		}
		return cart?.items ?? [];
	}, [isBuyNowMode, buyNowItem, cart]);

	useEffect(() => {
		if (!orderItems.length || !districtId || !wardCode) {
			setShippingFee(null);
			setShippingError(null);
			return;
		}

		let cancelled = false;
		setCalculatingFee(true);
		setShippingError(null);

		calculateShippingFee({
			toDistrictId: Number(districtId),
			toWardCode: wardCode,
			weight: totalWeight || 200,
			insuranceValue:
				Number(
					isBuyNowMode && buyNowItem
						? buyNowItem.price * buyNowItem.quantity
						: cart?.totalPrice,
				) || undefined,
		})
			.then((quote: ShippingFeeQuote) => {
				if (cancelled) return;
				setShippingFee(Number(quote.total) || 0);
			})
			.catch((err: unknown) => {
				if (cancelled) return;
				console.error(err);
				setShippingFee(null);
				setShippingError("Unable to calculate shipping fee. Please try again.");
			})
			.finally(() => {
				if (cancelled) return;
				setCalculatingFee(false);
			});

		return () => {
			cancelled = true;
		};
	}, [orderItems.length, cart, districtId, wardCode, totalWeight]);

	const subtotal =
		isBuyNowMode && buyNowItem
			? buyNowItem.price * buyNowItem.quantity
			: Number(cart?.totalPrice || 0);
	const total = shippingFee !== null ? subtotal + shippingFee : subtotal;

	const cartIsEmpty = isBuyNowMode ? !buyNowItem : !cart?.items?.length;
	const canPlaceOrder =
		!cartIsEmpty &&
		Boolean(form.fullName && form.phone && form.street && wardCode) &&
		shippingFee !== null &&
		!isSubmitting;

	const selectedProvince = provinces.find((p) => String(p.ProvinceID) === provinceId);
	const selectedDistrict = districts.find((d) => String(d.DistrictID) === districtId);
	const selectedWard = wards.find((w) => w.WardCode === wardCode);

	const handlePlaceOrder = async () => {
		if (!canPlaceOrder) {
			setGlobalError("Please fill every required field and wait for the shipping fee.");
			return;
		}
		if (isBuyNowMode && !buyNowItem) {
			setGlobalError("Your selected product is no longer available. Please try again.");
			return;
		}

		const token = localStorage.getItem("token");
		if (!token) {
			navigate("/login");
			return;
		}

		const shippingAddress = [
			`${form.fullName} - ${form.phone}`,
			form.street,
			selectedWard?.WardName,
			selectedDistrict?.DistrictName,
			selectedProvince?.ProvinceName,
		]
			.filter(Boolean)
			.join(", ");

		try {
			setIsSubmitting(true);
			setGlobalError(null);

			const response = isBuyNowMode && buyNowItem
				? await buyNow(token, {
						variantId: buyNowItem.variantId,
						quantity: buyNowItem.quantity,
						paymentMethod,
						shippingAddress,
				  })
				: await checkoutFromCart(token, {
						paymentMethod,
						shippingAddress,
				  });

			const orderPayload = response.order ?? response;

			if (paymentMethod === "vnpay" && response.payUrl) {
				sessionStorage.removeItem("buyNowItem");
				window.location.href = response.payUrl;
				return;
			}

			sessionStorage.removeItem("buyNowItem");
			const orderId = orderPayload?.id;
			const url = orderId ? `/order-success?orderId=${orderId}` : "/order-success";
			navigate(url, {
				state: { order: orderPayload ?? null },
			});
		} catch (err: any) {
			console.error(err);
			const message = err?.message || "Checkout failed. Please try again later.";
			setGlobalError(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (loadingCart) {
		return <div className="py-20 text-center">Loading cart...</div>;
	}

	if (isBuyNowMode && !buyNowItem) {
		return (
			<main className="py-12">
				<Container>
					<h1 className="heading-3 mb-4">Product unavailable</h1>
					<p className="mb-6 text-neutral-600">Your buy-now selection expired. Please go back and try again.</p>
					<button className="btn-primary" onClick={() => navigate(-1)}>
						Go back
					</button>
				</Container>
			</main>
		);
	}

	if (cartIsEmpty) {
		return (
			<main className="py-12">
				<Container>
					<h1 className="heading-3 mb-4">Your cart is empty</h1>
					<p className="mb-6 text-neutral-600">Add some products to your cart before checking out.</p>
					<button className="btn-primary" onClick={() => navigate("/shop")}>
						Back to shop
					</button>
				</Container>
			</main>
		);
	}

	return (
		<main className="py-12">
			<Container>
				<h1 className="heading-3">Checkout</h1>
				{globalError && (
					<div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						{globalError}
					</div>
				)}
				<div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
					<form
						className="lg:col-span-2 space-y-6"
						onSubmit={(e) => {
							e.preventDefault();
							handlePlaceOrder();
						}}
					>
						<div className="card space-y-5 p-6">
							<h2 className="heading-4">Shipping information</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
								<input
									className="input"
									placeholder="Full name"
									value={form.fullName}
									onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
									required
								/>
								<input
									className="input"
									placeholder="Phone number"
									value={form.phone}
									onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
									required
								/>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
								<select
									className="input"
									value={provinceId}
									onChange={(e) => setProvinceId(e.target.value)}
									required
								>
									<option value="">Select province</option>
									{provinces.map((province) => (
										<option key={province.ProvinceID} value={province.ProvinceID}>
											{province.ProvinceName}
										</option>
									))}
								</select>
								<select
									className="input"
									value={districtId}
									onChange={(e) => setDistrictId(e.target.value)}
									disabled={!provinceId}
									required
								>
									<option value="">Select district</option>
									{districts.map((district) => (
										<option key={district.DistrictID} value={district.DistrictID}>
											{district.DistrictName}
										</option>
									))}
								</select>
								<select
									className="input"
									value={wardCode}
									onChange={(e) => setWardCode(e.target.value)}
									disabled={!districtId}
									required
								>
									<option value="">Select ward</option>
									{wards.map((ward) => (
										<option key={ward.WardCode} value={ward.WardCode}>
											{ward.WardName}
										</option>
									))}
								</select>
							</div>
							<input
								className="input"
								placeholder="Street address"
								value={form.street}
								onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))}
								required
							/>
							{shippingError && <p className="text-sm text-red-600">{shippingError}</p>}
						</div>

						<div className="card space-y-4 p-6">
							<h2 className="heading-4">Payment method</h2>
							<label className="flex items-center gap-3 rounded border border-neutral-200 px-4 py-3 text-sm font-medium">
								<input
									type="radio"
									name="payment"
									value="cod"
									checked={paymentMethod === "cod"}
									onChange={() => setPaymentMethod("cod")}
								/>
								<span>Cash on delivery</span>
							</label>
							<label className="flex items-center gap-3 rounded border border-neutral-200 px-4 py-3 text-sm font-medium">
								<input
									type="radio"
									name="payment"
									value="vnpay"
									checked={paymentMethod === "vnpay"}
									onChange={() => setPaymentMethod("vnpay")}
								/>
								<span>VNPay</span>
							</label>
						</div>
					</form>

					<aside className="card h-fit">
						<h2 className="heading-4">Order summary</h2>
						<div className="mt-4 space-y-3 max-h-[220px] overflow-auto pr-1">
							{orderItems.map((item: any) => (
								<div key={item.id} className="flex justify-between text-sm">
									<span className="text-neutral-600">
										{item.variant?.product?.name || "Sản phẩm"} x {item.quantity}
									</span>
									<span className="font-semibold">{formatCurrency(Number(item.price) * item.quantity)}</span>
								</div>
							))}
						</div>

						<div className="mt-6 space-y-3 text-sm">
							<div className="flex items-center justify-between">
								<span>Subtotal</span>
								<span className="font-semibold">{formatCurrency(subtotal)}</span>
							</div>
							<div className="flex items-center justify-between">
								<span>Shipping fee</span>
								<span className="font-semibold">
									{calculatingFee && wardCode ? "Calculating..." : shippingFee !== null ? formatCurrency(shippingFee) : "--"}
								</span>
							</div>
							<div className="flex items-center justify-between border-t pt-3 text-base font-semibold">
								<span>Grand total</span>
								<span>{formatCurrency(total)}</span>
							</div>
						</div>

						<button
							className="btn-primary mt-6 w-full disabled:opacity-60"
							onClick={handlePlaceOrder}
							disabled={!canPlaceOrder}
						>
							{isSubmitting ? "Placing order..." : paymentMethod === "vnpay" ? "Pay with VNPay" : "Place order"}
						</button>
					</aside>
				</div>
			</Container>
		</main>
	);
}
