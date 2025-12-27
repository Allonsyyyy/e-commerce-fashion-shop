import Container from '../components/Container'
import ProductCard from '../components/ProductCard'
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import type { Product, ProductImage } from "../types/product";

export default function Shop() {
	const [products, setProducts] = useState<Product[]>([])

	// Lấy query ?q=...
	const location = useLocation()
	const searchParams = new URLSearchParams(location.search)
	const q = searchParams.get("q") || ""

	useEffect(() => {
		// Base URL
		let url = `http://localhost:3000/api/v1/products?page=1&limit=50&sort=-createdAt`

		// Nếu có search thì backend sẽ lọc theo q
		if (q.trim() !== "") {
			url += `&q=${encodeURIComponent(q)}`
		}

		fetch(url)
			.then((res) => res.json())
			.then((data) => {
				if (!data.data) return;
				setProducts(data.data);
			})
			.catch((err) => console.error("Tải sản phẩm thất bại:", err))
	}, [q]) // rất quan trọng: đổi q -> fetch lại

	return (
		<main className="py-12">
			<Container>
				<div className="flex items-end justify-between gap-4 mb-10">
					<h1 className="heading-3">Cửa hàng</h1>
					<div className="body-small">Hiển thị {products.length} kết quả</div>
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
