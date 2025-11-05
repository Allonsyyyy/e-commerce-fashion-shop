	import Container from '../components/Container'
	import ProductCard from '../components/ProductCard'
	import { useEffect, useState } from "react"
	import type { Product, ProductImage } from "../types/product";

	export default function Shop() {
		const [products, setProducts] = useState<Product[]>([])

		useEffect(() => {
			fetch("http://localhost:3000/api/v1/products?page=1&limit=50&sort=-createdAt")
				.then((res) => res.json())
				.then((data) => {
					if (!data.data) return;
					setProducts(data.data);
				})
				.catch((err) => console.error("Fetch products failed:", err))
		}, [])

		return (
			<main className="py-12">
				<Container>
					<div className="flex items-end justify-between gap-4 mb-10">
						<h1 className="heading-3">Shop</h1>
						<div className="body-small">Showing {products.length} results</div>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{products.map((p) => (
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
				</Container>
			</main>
		)
	}
