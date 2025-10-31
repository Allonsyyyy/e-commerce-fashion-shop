import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import 'swiper/swiper-bundle.css'
import CategoryCard from './CategoryCard'

export default function Carousel() {
	const categories = [
		'Men\'s Fashion', 'Women\'s Fashion', 'Accessories', 'Shoes', 'Bags', 'Watches', 'Jewelry', 'Sale'
	]
	
	return (
		<div className="relative">
			<Swiper
				modules={[Navigation, Pagination]}
				spaceBetween={20}
				slidesPerView={2}
				navigation={{
					nextEl: '.swiper-button-next-custom',
					prevEl: '.swiper-button-prev-custom',
				}}
				pagination={{
					clickable: true,
					el: '.swiper-pagination-custom',
				}}
				breakpoints={{
					640: { slidesPerView: 3 },
					768: { slidesPerView: 4 },
					1024: { slidesPerView: 5 },
				}}
				className="!pb-12"
			>
				{categories.map((category, i) => (
					<SwiperSlide key={i}>
						<CategoryCard label={category} />
					</SwiperSlide>
				))}
			</Swiper>
			
			{/* Custom navigation */}
			<button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-4 hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-white border border-neutral-200 shadow-md hover:bg-neutral-50 transition-colors">
				<ChevronLeft className="h-5 w-5 text-neutral-700" />
			</button>
			<button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-4 hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-white border border-neutral-200 shadow-md hover:bg-neutral-50 transition-colors">
				<ChevronRight className="h-5 w-5 text-neutral-700" />
			</button>
			
			{/* Custom pagination */}
			<div className="swiper-pagination-custom flex justify-center gap-2 mt-4" />
		</div>
	)
}


