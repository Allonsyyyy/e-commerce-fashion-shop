import Container from '../components/Container'

export default function Checkout() {
	return (
		<main className="py-12">
			<Container>
				<h1 className="heading-3">Checkout</h1>
				<div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
					<form className="lg:col-span-2 space-y-5">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
							<input className="input" placeholder="First name" required />
							<input className="input" placeholder="Last name" required />
						</div>
						<input className="input" type="email" placeholder="Email" required />
						<input className="input" placeholder="Address" required />
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
							<input className="input" placeholder="City" required />
							<input className="input" placeholder="State" required />
							<input className="input" placeholder="ZIP" required />
						</div>
					</form>
					<div className="card h-fit">
						<h2 className="heading-4">Order summary</h2>
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
						<button className="btn-primary mt-6 w-full">Place order</button>
					</div>
				</div>
			</Container>
		</main>
	)
}


