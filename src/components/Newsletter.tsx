export default function Newsletter() {
	return (
		<section className="bg-gradient-to-br from-neutral-50 to-neutral-100 py-14 rounded-2xl border border-neutral-200">
			<div className="mx-auto max-w-3xl px-6">
				<h3 className="heading-4 text-center">Subscribe to our newsletter</h3>
				<p className="mt-3 body-small text-center">Get updates about new products and special offers.</p>
				<form className="mt-8 flex flex-col sm:flex-row gap-3">
					<input className="input flex-1" type="email" placeholder="you@example.com" required />
					<button type="submit" className="btn-primary whitespace-nowrap px-8">Subscribe</button>
				</form>
			</div>
		</section>
	)
}


