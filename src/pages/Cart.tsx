import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, removeCartItem, updateCartItem, clearCart } from "../api/cartApi";
import Container from "../components/Container";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, X } from "lucide-react";

export default function Cart() {
	const navigate = useNavigate();
	const [cart, setCart] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState<number | null>(null);

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

	const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
		if (newQuantity < 1) return;

		const token = localStorage.getItem("token");
		if (!token) return;

		setUpdating(itemId);
		try {
			const updated = await updateCartItem(token, itemId, newQuantity);
			setCart(updated);
		} catch (err) {
			console.error("Failed to update cart:", err);
			alert("An error occurred while updating quantity!");
		} finally {
			setUpdating(null);
		}
	};

	const handleRemoveItem = async (itemId: number) => {
		if (!confirm("Are you sure you want to remove this item from your cart?")) return;

		const token = localStorage.getItem("token");
		if (!token) return;

		try {
			await removeCartItem(token, itemId);
			await loadCart();
		} catch (err) {
			console.error("Failed to remove item:", err);
			alert("An error occurred while removing the item!");
		}
	};

	const handleClearCart = async () => {
		if (!confirm("Are you sure you want to clear your entire cart?")) return;

		const token = localStorage.getItem("token");
		if (!token) return;

		try {
			await clearCart(token);
			await loadCart();
		} catch (err) {
			console.error("Failed to clear cart:", err);
			alert("An error occurred while clearing the cart!");
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
			<main className="py-20 min-h-screen bg-neutral-50">
				<Container>
					<div className="text-center max-w-md mx-auto">
						<div className="inline-flex items-center justify-center w-24 h-24 bg-neutral-100 rounded-full mb-6">
							<ShoppingCart className="h-12 w-12 text-neutral-400" />
						</div>
						<h1 className="heading-3 mb-4">Your Cart is Empty</h1>
						<p className="body-text text-neutral-600 mb-8">
							You don't have any items in your cart yet. Start shopping now!
						</p>
						<button onClick={() => navigate("/shop")} className="btn-primary">
							Continue Shopping
						</button>
					</div>
				</Container>
			</main>
		);
	}

	return (
		<main className="py-12 bg-neutral-50 min-h-screen">
			<Container>
				<div className="flex items-center justify-between mb-8">
					<h1 className="heading-3">My Cart</h1>
					<span className="body-text text-neutral-600">
						{cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
					</span>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Cart Items */}
					<div className="lg:col-span-2 space-y-4">
						{cart.items.map((item: any) => (
							<div
								key={item.id}
								className="card p-4 flex gap-4 hover:shadow-md transition-shadow"
							>
								{/* Product Image */}
								<img
									src={
										item.variant?.imageUrl ||
										item.variant?.product?.mainImageUrl ||
										"https://via.placeholder.com/150"
									}
									alt={item.variant?.product?.name}
									className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
								/>

								{/* Product Info */}
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold text-neutral-900 mb-1 truncate">
										{item.variant?.product?.name}
									</h3>
									<div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
										{item.variant?.size?.size && (
											<span className="px-2 py-1 bg-neutral-100 rounded">
												Size: {item.variant.size.size}
											</span>
										)}
										{item.variant?.color?.color && (
										<span className="px-2 py-1 bg-neutral-100 rounded">
												Color: {item.variant.color.color}
										</span>
										)}
									</div>
									<p className="font-bold text-lg text-neutral-900 mb-3">
										{Number(item.price).toLocaleString()}₫
									</p>

									{/* Quantity Controls */}
									<div className="flex items-center gap-3">
										<label className="text-sm text-neutral-600">Quantity:</label>
										<div className="flex items-center gap-2 border rounded-lg">
											<button
												type="button"
												onClick={() =>
													handleUpdateQuantity(item.id, item.quantity - 1)
												}
												disabled={updating === item.id || item.quantity <= 1}
												className="p-2 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
											>
												<Minus className="h-4 w-4" />
											</button>
											<span className="px-4 py-2 min-w-[60px] text-center font-medium">
												{updating === item.id ? "..." : item.quantity}
											</span>
											<button
												type="button"
												onClick={() =>
													handleUpdateQuantity(item.id, item.quantity + 1)
												}
												disabled={updating === item.id}
												className="p-2 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
											>
												<Plus className="h-4 w-4" />
											</button>
										</div>
									</div>
								</div>

								{/* Actions */}
								<div className="flex flex-col items-end justify-between">
									<button
										type="button"
										onClick={() => handleRemoveItem(item.id)}
										className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
										title="Remove item"
									>
										<Trash2 className="h-5 w-5" />
									</button>
									<div className="text-right">
										<p className="text-xs text-neutral-500 mb-1">Subtotal</p>
										<p className="font-bold text-lg text-neutral-900">
											{(Number(item.price) * item.quantity).toLocaleString()}₫
										</p>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Order Summary */}
					<div className="lg:col-span-1">
						<div className="card sticky top-4">
							<h2 className="heading-4 mb-6">Order Summary</h2>

							<div className="space-y-4 mb-6">
								<div className="flex items-center justify-between body-small">
									<span className="text-neutral-600">Subtotal</span>
									<span className="font-semibold">
										{Number(cart.totalPrice).toLocaleString()}₫
									</span>
								</div>
								<div className="flex items-center justify-between body-small">
									<span className="text-neutral-600">Shipping</span>
									<span className="font-semibold text-green-600">Free</span>
								</div>
								<div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
									<span className="font-semibold text-lg text-neutral-900">
										Total
									</span>
									<span className="font-bold text-xl text-neutral-900">
										{Number(cart.totalPrice).toLocaleString()}₫
									</span>
								</div>
							</div>

							<button
								onClick={() => navigate("/checkout")}
								className="btn-primary w-full py-3 flex items-center justify-center gap-2 mb-4"
							>
								Checkout
								<ArrowRight className="h-5 w-5" />
							</button>

							<button
								onClick={handleClearCart}
								className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
							>
								<Trash2 className="h-5 w-5" />
								Clear Cart
							</button>

							<div className="mt-6 pt-6 border-t border-neutral-200">
								<button
									onClick={() => navigate("/shop")}
									className="w-full text-center text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
								>
									← Continue Shopping
								</button>
							</div>
						</div>
					</div>
				</div>
			</Container>
		</main>
	);
}
