import Banner from '../components/Banner'
import Carousel from '../components/Carousel'
import Container from '../components/Container'
import ProductCard from '../components/ProductCard'
import Newsletter from '../components/Newsletter'
import { Star, Truck, Shield, RefreshCw } from 'lucide-react'

export default function Home() {
	const featuredProducts = [
		{ title: 'Classic T-Shirt', price: '$29', originalPrice: '$39', badge: 'Sale' },
		{ title: 'Slim Fit Jeans', price: '$79', badge: 'New' },
		{ title: 'Leather Jacket', price: '$199', originalPrice: '$249', badge: 'Sale' },
		{ title: 'Cotton Sweater', price: '$59' },
		{ title: 'Denim Shorts', price: '$45', badge: 'New' },
		{ title: 'Wool Coat', price: '$299', originalPrice: '$349' },
		{ title: 'Summer Dress', price: '$89', badge: 'New' },
		{ title: 'Sneakers', price: '$129', originalPrice: '$159', badge: 'Sale' },
	]

	const features = [
		{ icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
		{ icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
		{ icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
		{ icon: Star, title: 'Best Quality', desc: 'Premium products only' },
	]

	return (
		<main>
			<Banner />
			
			{/* Categories */}
			<section className="py-16 bg-white">
				<Container>
					<div className="text-center mb-12">
						<h2 className="heading-3 mb-4">Shop by Category</h2>
						<p className="body-text text-neutral-600">Discover our curated collections</p>
					</div>
					<Carousel />
				</Container>
			</section>

			{/* Featured Products */}
			<section className="py-16 bg-neutral-50">
				<Container>
					<div className="flex items-center justify-between mb-8">
						<div>
							<h2 className="heading-3 mb-2">Featured Products</h2>
							<p className="body-text text-neutral-600">Hand-picked items just for you</p>
						</div>
						<a className="body-small text-neutral-600 hover:text-neutral-900 transition-colors font-medium hidden md:inline-flex items-center gap-1" href="/shop">
							View all <span>→</span>
						</a>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{featuredProducts.map((product, i) => (
							<ProductCard
								key={i}
								title={product.title}
								price={product.price}
								originalPrice={product.originalPrice}
								badge={product.badge}
							/>
						))}
					</div>
				</Container>
			</section>

			{/* Features */}
			<section className="py-16 bg-white border-y border-neutral-200">
				<Container>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
						{features.map((feature, i) => (
							<div key={i} className="text-center">
								<div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 mb-4">
									<feature.icon className="h-6 w-6 text-neutral-900" />
								</div>
								<h3 className="font-semibold text-neutral-900 mb-2">{feature.title}</h3>
								<p className="body-small text-neutral-600">{feature.desc}</p>
							</div>
						))}
					</div>
				</Container>
			</section>

			{/* Newsletter */}
			<div className="py-16 bg-neutral-50">
				<Container>
					<Newsletter />
				</Container>
			</div>
		</main>
	)
}


