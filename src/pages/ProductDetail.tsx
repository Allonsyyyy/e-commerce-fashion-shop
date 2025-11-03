// src/pages/ProductDetail.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import Container from "../components/Container";
import type { Product } from "../types/product";
import { buyNow } from "../api/ordersApi";

export default function ProductDetail() {
	const { id } = useParams();
	const [product, setProduct] = useState<Product | null>(null);
	const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [quantity, setQuantity] = useState<number>(1);

	useEffect(() => {
		fetch(`http://localhost:3000/api/v1/products/${id}`)
			.then((res) => res.json())
			.then((data) => {
				setProduct(data);
				setSelectedVariant(null);
				setSelectedImage(null);
				setQuantity(1);
			})
			.catch((err) => console.error("Fetch product failed:", err));
	}, [id]);

	if (!product) return <div className="py-20 text-center">Loading...</div>;

	const price = Number(product.price);
	const discount = Number(product.discount);
	const finalPrice = price.toLocaleString("vi-VN") + "₫";
	const originalPrice =
		discount > 0 ? (price / (1 - discount / 100)).toLocaleString("vi-VN") + "₫" : null;

	const activeVariant = product.variants?.find((v) => v.id === selectedVariant);

	const mainImage =
		selectedImage ||
		product.images?.find((img) => img.isMain)?.imageUrl ||
		product.mainImageUrl ||
		product.images?.[0]?.imageUrl ||
		"/placeholder.png";

	const handleBuyNow = async () => {
		if (!selectedVariant) {
			alert("Vui lòng chọn màu / size!");
			return;
		}
		const token = localStorage.getItem("token");
		if (!token) {
			alert("Bạn cần đăng nhập!");
			// option: window.location.href = "/login";
			return;
		}
		try {
			const resp = await buyNow(token, {
				variantId: selectedVariant,
				quantity: quantity || 1,
				paymentMethod: "vnpay", // hoặc "cod" nếu bạn muốn
				shippingAddress: "Địa chỉ mặc định",
			});
			if (resp.payUrl) {
				window.location.href = resp.payUrl; // redirect VNPay
			} else {
				alert("Tạo đơn thành công!");
			}
		} catch (err) {
			console.error(err);
			alert("Thanh toán thất bại!");
		}
	};

	return (
		<main className="py-10">
			<Container>
				<Breadcrumbs
					items={[
						{ label: "Home", to: "/" },
						{ label: product.category?.name || "Category", to: `/category/${product.categoryId}` },
						{ label: product.name },
					]}
				/>

				<div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
					{/* IMAGE GALLERY */}
					<div>
						{/* Ảnh lớn */}
						<img
							src={mainImage}
							alt={product.name}
							className="w-full rounded-lg shadow-md object-cover aspect-[4/5]"
						/>

						{/* Thumbnails */}
						<div className="flex gap-3 mt-4">
							{/* Ảnh chính */}
							<img
								src={product.mainImageUrl}
								className={`w-20 h-20 rounded-md object-cover cursor-pointer border ${
									!selectedImage ? "border-neutral-900" : "border-neutral-300"
								}`}
								onClick={() => setSelectedImage(null)}
							/>

							{/* Ảnh phụ */}
							{product.images
								?.filter((img) => !img.isMain)
								.map((img) => (
									<img
										key={img.id}
										src={img.imageUrl}
										className={`w-20 h-20 rounded-md object-cover cursor-pointer border ${
											selectedImage === img.imageUrl ? "border-neutral-900" : "border-neutral-300"
										}`}
										onClick={() => setSelectedImage(img.imageUrl)}
									/>
								))}
						</div>
					</div>

					{/* PRODUCT INFO */}
					<div>
						<h1 className="heading-3">{product.name}</h1>

						<div className="mt-4 flex items-center gap-3">
							<span className="text-2xl font-bold text-neutral-900">{finalPrice}</span>
							{originalPrice && (
								<span className="text-lg text-neutral-500 line-through">{originalPrice}</span>
							)}
						</div>

						<p className="mt-6 body-text">{product.description}</p>

						{/* VARIANTS */}
						{product.variants && product.variants.length > 0 && (
							<div className="mt-8 space-y-4">
								{/* Color */}
								<div>
									<h4 className="mb-2 font-medium">Màu sắc</h4>
									<div className="flex gap-2">
										{product.variants.map((v) => (
											<button
												key={v.id}
												className={`px-3 py-1 rounded-md border ${
													selectedVariant === v.id ? "border-neutral-900" : "border-neutral-300"
												}`}
												onClick={() => setSelectedVariant(v.id)}
											>
												{v.color?.color}
											</button>
										))}
									</div>
								</div>

								{/* Size */}
								<div>
									<h4 className="mb-2 font-medium">Kích cỡ</h4>
									<div className="flex gap-2">
										{product.variants.map((v) => (
											<button
												key={v.id + "-size"}
												className={`px-3 py-1 rounded-md border ${
													selectedVariant === v.id ? "border-neutral-900" : "border-neutral-300"
												}`}
												onClick={() => setSelectedVariant(v.id)}
											>
												{v.size?.size}
											</button>
										))}
									</div>
								</div>
							</div>
						)}

						{/* SỐ LƯỢNG */}
						<div className="mt-4">
							<label className="block text-sm text-neutral-700 mb-1">Số lượng</label>
							<input
								type="number"
								min={1}
								value={quantity}
								onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
								className="w-24 border rounded px-3 py-2"
							/>
						</div>

						{/* STOCK */}
						<div className="mt-4 text-sm text-neutral-600">
							Stock: {activeVariant?.stock ?? product.stock} sản phẩm
						</div>

						{/* ACTION BUTTONS */}
						<div className="mt-8 flex flex-col sm:flex-row gap-4">
							{/* Thêm vào giỏ (giữ như bạn) */}
							<button
								className="btn-primary flex-1 px-8 py-3"
								onClick={async () => {
									if (!selectedVariant) return alert("Vui lòng chọn màu / size!");
									const token = localStorage.getItem("token");
									if (!token) return alert("Bạn cần đăng nhập!");

									try {
										const res = await fetch("http://localhost:3000/api/v1/cart/add", {
											method: "POST",
											headers: {
												"Content-Type": "application/json",
												Authorization: `Bearer ${token}`,
											},
											body: JSON.stringify({
												variantId: selectedVariant,
												quantity: 1,
											}),
										}).then((res) => res.json());

										console.log("Added to cart:", res);
										alert("Đã thêm vào giỏ hàng!");
									} catch (error) {
										console.error(error);
										alert("Lỗi khi thêm vào giỏ hàng!");
									}
								}}
							>
								Thêm vào giỏ hàng
							</button>

							{/* Mua ngay */}
							<button
								className="btn-secondary px-8 py-3"
								onClick={handleBuyNow}
							>
								Mua ngay
							</button>
						</div>
					</div>
				</div>
			</Container>
		</main>
	);
}
