import Container from '../components/Container'
import ProductCard from '../components/ProductCard'

export default function Shop() {
	return (
		<main className="py-12">
			<Container>
				<div className="flex items-end justify-between gap-4 mb-10">
					<h1 className="heading-3">Shop</h1>
					<div className="body-small">Showing 1–16 of 128 results</div>
				</div>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{Array.from({ length: 12 }).map((_, i) => (
						<ProductCard key={i} title={`Product ${i + 1}`} price={`$${(i + 1) * 10}`} />
					))}
				</div>
			</Container>
		</main>
	)
}


