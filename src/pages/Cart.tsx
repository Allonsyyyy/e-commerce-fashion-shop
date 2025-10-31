import Container from '../components/Container'

export default function Cart() {
	return (
		<main className="py-12">
			<Container>
				<h1 className="heading-3">Cart</h1>
				<div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2 space-y-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="card flex items-center gap-5">
								<div className="h-24 w-24 rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200 flex-shrink-0" />
								<div className="flex-1 min-w-0">
									<p className="font-medium text-neutral-900">Product {i + 1}</p>
									<p className="mt-1 body-small font-semibold">$50</p>
								</div>
								<button className="body-small text-neutral-600 hover:text-neutral-900 transition-colors whitespace-nowrap">Remove</button>
							</div>
						))}
					</div>
					<div className="card h-fit">
						<h2 className="heading-4">Summary</h2>
						<div className="mt-6 space-y-3">
							<div className="flex items-center justify-between body-small">
								<span>Subtotal</span>
								<span className="font-semibold">$150</span>
							</div>
							<div className="flex items-center justify-between body-small">
								<span>Shipping</span>
								<span className="font-semibold">Free</span>
							</div>
							<div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
								<span className="font-semibold text-neutral-900">Total</span>
								<span className="font-bold text-lg text-neutral-900">$150</span>
							</div>
						</div>
						<button className="btn-primary mt-6 w-full">Checkout</button>
					</div>
				</div>
			</Container>
		</main>
	)
}


