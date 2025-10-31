import { Link } from 'react-router-dom'

type CategoryCardProps = {
	label: string
	to?: string
}

export default function CategoryCard({ label, to = '/shop' }: CategoryCardProps) {
	return (
		<Link to={to} className="group block">
			<div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200 shadow-sm transition-all duration-300 group-hover:shadow-md">
				<div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
				<div className="absolute inset-0 flex items-center justify-center">
					<span className="text-lg font-semibold text-neutral-900 group-hover:text-white transition-colors duration-300">
						{label}
					</span>
				</div>
			</div>
		</Link>
	)
}


