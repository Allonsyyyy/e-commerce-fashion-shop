import { Link } from "react-router-dom";
import type {CategoryCardProps} from "../types/category.ts";

export default function CategoryCard({ label, to }: CategoryCardProps) {
	return (
		<Link to={to} className="group block">
			<div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200 shadow-sm transition-all duration-300 group-hover:shadow-md">
				<div className="absolute inset-0 flex items-center justify-center">
					<span className="text-lg font-semibold text-neutral-900 group-hover:text-white transition-colors duration-300">
						{label}
					</span>
				</div>
			</div>
		</Link>
	);
}
