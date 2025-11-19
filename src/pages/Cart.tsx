import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, removeCartItem, updateCartItem, clearCart } from "../api/cartApi";
import Container from "../components/Container";

export default function Cart() {
	const [cart, setCart] = useState<any>(null);

	const loadCart = async () => {
		const token = localStorage.getItem("token");
		if (!token) return;
		setCart(await getCart(token));
	};

	useEffect(() => {
		loadCart();
	}, []);

	if (!cart) return <div className="py-20 text-center">Loading...</div>;

	const handleCheckout = () => {
		const token = localStorage.getItem("token");
		if (!token) {
			alert("Bạn chưa đăng nhập!");
			navigate("/login");
			return;
		}
		if (!cart.items.length) {
			alert("Giỏ hàng trống.");
			return;
		}
		navigate("/checkout");
	};

	return (
		<main className="py-12">
			<Container>
				<h1 className="heading-3">Giỏ hàng</h1>

				<div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2 space-y-4">
						{cart.items.length === 0 && (
							<p className="text-neutral-500">Giỏ hàng trống.</p>
						)}

						{cart.items.map((item: any) => (
							<div key={item.id} className="card flex items-center gap-5">
								<img
									src={item.variant.product.mainImageUrl}
									className="h-24 w-24 rounded-lg object-cover"
								/>
								<div className="flex-1">
									<p className="font-medium">{item.variant.product.name}</p>
									<p className="font-semibold mt-1">
										{Number(item.price).toLocaleString()}
									</p>

									<input
										type="number"
										min={1}
										value={item.quantity}
										onChange={async (e) => {
											const token = localStorage.getItem("token");
											const quantity = Number(e.target.value);

											const updated = await updateCartItem(token!, item.id, quantity);

											// Tính toán totalPrice
											const newTotal = updated.items.reduce(
												(sum: number, it: any) => sum + it.price * it.quantity,
												0
											);

											setCart({ ...updated, totalPrice: newTotal });
										}}

										className="mt-2 w-16 border rounded px-2"
									/>
								</div>

								<button
									className="text-red-500"
									onClick={async () => {
										const token = localStorage.getItem("token");
										await removeCartItem(token!, item.id);
										await loadCart();
									}}
								>
									Xóa
								</button>
							</div>
						))}
					</div>

					<div className="card h-fit">
						<h2 className="heading-4">Tổng tiền</h2>
						<p className="mt-4 font-bold text-lg text-neutral-900">
							Total: {Number(cart.totalPrice).toLocaleString()}
						</p>

						<button className="btn-primary mt-6 w-full" onClick={handleCheckout}>
							Thanh toán
						</button>

						<button
							className="btn-secondary mt-4 w-full"
							onClick={async () => {
								if (!window.confirm("Xóa toàn bộ giỏ hàng?")) return;
								const token = localStorage.getItem("token");
								await clearCart(token!);
								await loadCart();
							}}
						>
							Xóa toàn bộ
						</button>
					</div>
				</div>
			</Container>
		</main>
	);
}