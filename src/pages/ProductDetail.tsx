import Breadcrumbs from '../components/Breadcrumbs'
import Container from '../components/Container'

export default function ProductDetail() {
	return (
		<main className="py-10">
			<Container>
				<Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shop', to: '/shop' }, { label: 'Product' }]} />
				<div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
					<div className="aspect-[4/5] w-full rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200 shadow-md" />
					<div>
						<h1 className="heading-3">Product name</h1>
						<p className="mt-4 text-2xl font-bold text-neutral-900">$129</p>
						<p className="mt-6 body-text">A short description about the product and its key highlights. Perfect for everyday wear with premium quality materials and exceptional comfort.</p>
						<div className="mt-8 flex flex-col sm:flex-row gap-4">
							<button className="btn-primary flex-1 sm:flex-none px-8 py-3">Add to cart</button>
							<button className="btn-secondary px-8 py-3">Wishlist</button>
						</div>
					</div>
				</div>
			</Container>
		</main>
	)
}


