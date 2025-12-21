// src/pages/ProductDetail.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import Container from "../components/Container";
import type { Product } from "../types/product";
import { getProductReviews, type Review } from "../api/reviewsApi";

export default function ProductDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [product, setProduct] = useState<Product | null>(null);
	const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [quantity, setQuantity] = useState<number>(1);
	const [reviews, setReviews] = useState<Review[]>([]);
	const [reviewsTotal, setReviewsTotal] = useState(0);
	const [reviewsLoading, setReviewsLoading] = useState(false);
	const [reviewsError, setReviewsError] = useState<string | null>(null);
	const [openReplies, setOpenReplies] = useState<Record<number, boolean>>({});

	useEffect(() => {
		const token = localStorage.getItem("token");
		fetch(`http://localhost:3000/api/v1/products/${id}`, {
			headers: token
				? {
						Authorization: `Bearer ${token}`,
					}
				: undefined,
		})
			.then((res) => res.json())
			.then((data) => {
				setProduct(data);
				setSelectedVariant(null);
				setSelectedImage(null);
				setQuantity(1);
			})
			.catch((err) => console.error("Fetch product failed:", err));
	}, [id]);

	useEffect(() => {
		if (!id) return;
		const loadReviews = async () => {
			try {
				setReviewsLoading(true);
				setReviewsError(null);
				const token = localStorage.getItem("token");
				const res = await getProductReviews(Number(id), { page: 1, limit: 20, sort: "-createdAt" }, token);
				setReviews(res.data);
				setReviewsTotal(res.total);
			} catch (err: any) {
				console.error("Failed to load reviews", err);
				setReviewsError("Không tải được đánh giá.");
			} finally {
				setReviewsLoading(false);
			}
		};
		loadReviews();
	}, [id]);

if (!product) return <div className="py-20 text-center">Đang tải...</div>;

	const activeVariant = product.variants?.find((v) => v.id === selectedVariant);
	const price = Number(activeVariant?.price ?? product.price);
	const discount = Number(product.discount);
	const finalPrice = price.toLocaleString("vi-VN") + "₫";
	const originalPrice =
		discount > 0 ? (price / (1 - discount / 100)).toLocaleString("vi-VN") + "₫" : null;

	const mainImage =
		selectedImage ||
		product.images?.find((img) => img.isMain)?.imageUrl ||
		product.mainImageUrl ||
		product.images?.[0]?.imageUrl ||
		"/placeholder.png";

	const handleBuyNow = () => {
		if (!selectedVariant) {
			alert("Vui l�ng ch?n m�u / size!");
			return;
		}
		const token = localStorage.getItem("token");
		if (!token) {
			alert("B?n c?n dang nh?p!");
			navigate("/login");
			return;
		}

		const buyNowPayload = {
			variantId: selectedVariant,
			quantity: quantity || 1,
			price: Number(activeVariant?.price ?? product.price),
			productName: product.name,
			imageUrl:
				activeVariant?.imageUrl ||
				product.mainImageUrl ||
				product.images?.[0]?.imageUrl ||
				"/placeholder.png",
			weight: 200,
		};

		sessionStorage.setItem("buyNowItem", JSON.stringify(buyNowPayload));
		navigate("/checkout?mode=buy-now");
	};

	return (
		<main className="py-10">
			<Container>
				<Breadcrumbs
					items={[
						{ label: "Trang chủ", to: "/" },
						{ label: product.category?.name || "Danh mục", to: `/category/${product.categoryId}` },
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

						{/* QUANTITY */}
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
							Tồn kho: {activeVariant?.stock ?? product.stock} sản phẩm
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
										alert("Đã thêm vào giỏ!");
									} catch (error) {
										console.error(error);
										alert("Thêm vào giỏ thất bại!");
									}
								}}
							>
								Thêm vào giỏ
							</button>

							{/* Buy Now */}
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

			{/* REVIEWS */}
			<Container>
				<div className="mt-12 card">
					<div className="flex items-center justify-between mb-4">
						<h2 className="heading-4">Đánh giá sản phẩm</h2>
						{reviewsTotal > 0 && <span className="text-sm text-neutral-500">{reviewsTotal} đánh giá</span>}
					</div>
					{reviewsLoading ? (
						<p className="text-neutral-600">Đang tải đánh giá...</p>
					) : reviewsError ? (
						<p className="text-error-600">{reviewsError}</p>
					) : reviews.length === 0 ? (
						<p className="text-neutral-600">Chưa có đánh giá nào.</p>
					) : (
						<div className="space-y-4">
							{reviews.map((review) => (
								<div key={review.id} className="border border-neutral-200 rounded-lg p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="font-semibold text-neutral-900">{review.user?.name || "Khách hàng"}</p>
											<p className="text-xs text-neutral-500">
												{review.createdAt ? new Date(review.createdAt).toLocaleDateString("vi-VN") : ""}
											</p>
										</div>
										<div className="text-sm font-semibold text-amber-600">
											{review.rating} / 5 ★
										</div>
									</div>
									<p className="mt-2 text-sm text-neutral-800">{review.comment}</p>
									{(review.sellerReply ?? review.reply) && (
										<div className="mt-3">
											<button
												className="text-sm text-neutral-700 underline underline-offset-4 hover:text-neutral-900"
												onClick={() =>
													setOpenReplies((prev) => ({
														...prev,
														[review.id]: !prev[review.id],
													}))
												}
											>
												{openReplies[review.id] ? "Ẩn phản hồi của shop" : "Xem phản hồi của shop"}
											</button>
											{openReplies[review.id] && (
												<div className="mt-2 text-sm text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg p-3">
													<p className="text-xs text-neutral-500">
														Phản hồi từ cửa hàng
														{review.sellerRepliedAt
															? ` • ${new Date(review.sellerRepliedAt).toLocaleDateString("vi-VN")}`
															: ""}
													</p>
													<p>{review.sellerReply ?? review.reply}</p>
												</div>
											)}
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</Container>
		</main>
	);
}
