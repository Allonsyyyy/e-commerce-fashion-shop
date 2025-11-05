import { useEffect, useState } from "react";
import Banner from "../components/Banner";
import Carousel from "../components/Carousel";
import Container from "../components/Container";
import ProductCard from "../components/ProductCard";
import Newsletter from "../components/Newsletter";
import { Star, Truck, Shield, RefreshCw } from "lucide-react";
import type { Product, ProductImage } from "../types/product";

export default function Home() {
	const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

	useEffect(() => {
		fetch("http://localhost:3000/api/v1/products?page=1&limit=100&sort=-createdAt")
			.then((res) => res.json())
			.then((data) => {
				if (!data.data) return;
				const products: Product[] = data.data;

				// Lấy 8 sản phẩm mới nhất
				setFeaturedProducts(products.slice(0, 8));
			})
			.catch((err) => console.error("Fetch products failed:", err));
	}, []);

	const features = [
		{ icon: Truck, title: "Free Shipping", desc: "On orders over 100k" },
		{ icon: RefreshCw, title: "Easy Returns", desc: "30-day return policy" },
		{ icon: Shield, title: "Secure Payment", desc: "100% secure checkout" },
		{ icon: Star, title: "Best Quality", desc: "Premium products only" },
	];

	return (
		<main className="overflow-hidden">
			<Banner />

			{/* Categories */}
			<section className="py-20 sm:py-24 bg-white relative">
				{/* Decorative background */}
				<div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-50/30 to-transparent pointer-events-none"></div>
				<Container>
					<div className="text-center mb-14 relative z-10">
						<h2 className="heading-3 mb-4 text-neutral-900">Shop by Category</h2>
						<p className="body-text text-neutral-600 max-w-2xl mx-auto">
							Discover our curated collections crafted for your unique style
						</p>
					</div>
					<div className="relative z-10">
						<Carousel />
					</div>
				</Container>
			</section>

			{/* Featured Products */}
			<section className="py-20 sm:py-24 bg-gradient-to-b from-neutral-50 to-white relative">
				<Container>
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12">
						<div className="mb-4 sm:mb-0">
							<h2 className="heading-3 mb-3 text-neutral-900">Featured Products</h2>
							<p className="body-text text-neutral-600">
								Newly added products handpicked for you
							</p>
						</div>
						<a
							className="body-small text-neutral-900 hover:text-neutral-700 transition-colors font-semibold hidden md:inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white border border-neutral-200 hover:border-neutral-300 shadow-sm hover:shadow"
							href="/shop"
						>
							View all <span className="text-lg">→</span>
						</a>
					</div>

					{featuredProducts.length > 0 ? (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
							{featuredProducts.map((p) => (
								<ProductCard
									key={p.id}
									title={p.name}
									price={p.price}
									discount={p.discount}
									image={
										p.mainImageUrl ||
										p.images?.find((img: ProductImage) => img.isMain)?.imageUrl
									}
									to={`/product/${p.id}`}
								/>
							))}
						</div>
					) : (
						<div className="text-center py-12">
							<p className="text-neutral-500">Loading products...</p>
						</div>
					)}
				</Container>
			</section>

			{/* Features */}
			<section className="py-20 sm:py-24 bg-white border-y border-neutral-200 relative">
				<Container>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
						{features.map((feature, i) => (
							<div key={i} className="text-center group">
								<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-50 mb-5 group-hover:from-neutral-900 group-hover:to-neutral-800 transition-all duration-300 shadow-sm group-hover:shadow-lg">
									<feature.icon className="h-7 w-7 text-neutral-900 group-hover:text-white transition-colors duration-300" />
								</div>
								<h3 className="font-semibold text-neutral-900 mb-2.5 text-lg">
									{feature.title}
								</h3>
								<p className="body-small text-neutral-600 leading-relaxed">
									{feature.desc}
								</p>
							</div>
						))}
					</div>
				</Container>
			</section>

			{/* Newsletter */}
			<div className="py-20 sm:py-24 bg-gradient-to-b from-white to-neutral-50">
				<Container>
					<Newsletter />
				</Container>
			</div>
		</main>
	);
}
