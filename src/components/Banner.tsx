export default function Banner() {
	return (
		<section className="relative overflow-hidden bg-neutral-900">
			<div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white flex items-center py-20 sm:py-32 px-4 sm:px-6 lg:px-16 relative">
				{/* Decorative pattern */}
				<div className="absolute inset-0 opacity-10">
					<div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
					<div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
				</div>
				<div className="max-w-4xl mx-auto relative z-10 text-center">
					<p className="text-sm uppercase tracking-wider text-neutral-300 mb-4 font-medium">New Collection 2024</p>
					<h1 className="heading-1 text-white mb-6 leading-tight">Discover our new arrivals</h1>
					<p className="body-large text-neutral-200 mb-10 leading-relaxed max-w-2xl mx-auto">Premium essentials, curated for comfort and style. Shop the latest collection and elevate your wardrobe.</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<a href="/shop" className="btn-primary bg-white text-neutral-900 hover:bg-neutral-100 text-center px-8 py-3.5 font-semibold shadow-lg hover:shadow-xl transition-all">
							Shop now
						</a>
						<a href="/shop?category=new" className="btn-outline border-2 border-white text-white hover:bg-white hover:text-neutral-900 text-center px-8 py-3.5 font-semibold transition-all">
							View collection
						</a>
					</div>
				</div>
			</div>
		</section>
	)
}


