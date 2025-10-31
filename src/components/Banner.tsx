export default function Banner() {
	return (
		<section className="relative overflow-hidden">
			<div className="grid lg:grid-cols-2 gap-0">
				{/* Left side - Content */}
				<div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white flex items-center py-20 sm:py-32 px-4 sm:px-6 lg:px-12">
					<div className="max-w-xl mx-auto lg:mx-0">
						<p className="text-sm uppercase tracking-wider text-neutral-300 mb-4">New Collection 2024</p>
						<h1 className="heading-1 text-white mb-6">Discover our new arrivals</h1>
						<p className="body-large text-neutral-200 mb-8">Premium essentials, curated for comfort and style. Shop the latest collection and elevate your wardrobe.</p>
						<div className="flex flex-col sm:flex-row gap-4">
							<a href="/shop" className="btn-primary bg-white text-neutral-900 hover:bg-neutral-100 text-center">
								Shop now
							</a>
							<a href="/shop?category=new" className="btn-outline border-white text-white hover:bg-white hover:text-neutral-900 text-center">
								View collection
							</a>
						</div>
					</div>
				</div>
				
				{/* Right side - Image */}
				<div className="relative aspect-[4/3] lg:aspect-auto bg-gradient-to-br from-neutral-100 to-neutral-200">
					<div className="absolute inset-0 bg-neutral-100" />
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="w-full h-full max-w-md opacity-20 bg-gradient-to-br from-neutral-900 to-transparent" />
					</div>
				</div>
			</div>
		</section>
	)
}


