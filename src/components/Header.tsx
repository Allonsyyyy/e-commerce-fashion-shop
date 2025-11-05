import { Link, NavLink, useNavigate, useLocation, useParams } from 'react-router-dom'
import { ShoppingCart, Search, Menu, X, User, Heart } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import Container from './Container'

export default function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const [user, setUser] = useState<any>(null)
	const navigate = useNavigate()
	const location = useLocation()
	const { id: categoryId } = useParams<{ id: string }>()
	const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null)

	const loadUser = () => {
		const token = localStorage.getItem("token")
		if (!token) {
			setUser(null)
			return
		}

		fetch("http://localhost:3000/api/v1/auth/profile", {
			headers: { Authorization: `Bearer ${token}` }
		})
			.then(res => res.json())
			.then(data => setUser(data))
			.catch(() => setUser(null))
	}

	useEffect(() => {
		loadUser()
		window.addEventListener("storage", loadUser)

		return () => window.removeEventListener("storage", loadUser)
	}, [])

	// Fetch category name if on category page
	useEffect(() => {
		if (categoryId) {
			fetch(`http://localhost:3000/api/v1/categories/${categoryId}`)
				.then(res => res.json())
				.then(data => setActiveCategoryName(data?.name || null))
				.catch(() => setActiveCategoryName(null))
		} else {
			setActiveCategoryName(null)
		}
	}, [categoryId])

	// Determine which nav item should be active
	const activeNav = useMemo(() => {
		const searchParams = new URLSearchParams(location.search)
		const categoryParam = searchParams.get('category')

		// Check if on Shop page without category filter
		if (location.pathname === '/shop' && !categoryParam) {
			return 'shop'
		}

		// Check query string for category
		if (categoryParam === 'men') {
			return 'men'
		}
		if (categoryParam === 'women') {
			return 'women'
		}

		// Check category name from CategoryPage
		if (activeCategoryName) {
			const nameLower = activeCategoryName.toLowerCase()
			if (nameLower.includes('nam') || nameLower === 'men' || nameLower === 'nam') {
				return 'men'
			}
			if (nameLower.includes('nữ') || nameLower === 'women' || nameLower === 'nu') {
				return 'women'
			}
		}

		return null
	}, [location.pathname, location.search, activeCategoryName])

	const handleLogout = () => {
		localStorage.removeItem("token")
		setUser(null)

		window.dispatchEvent(new Event("storage"))

		navigate("/")
	}

	return (
		<header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
			{/* Top bar */}
			<div className="bg-neutral-900 text-white text-xs py-2">
				<Container>
					<div className="flex items-center justify-between">
						<p>Free shipping on orders over $100</p>
						<div className="hidden sm:flex items-center gap-4">
							<a href="#" className="hover:text-neutral-300">Help</a>
							<a href="#" className="hover:text-neutral-300">Returns</a>
							<a href="#" className="hover:text-neutral-300">Track Order</a>
						</div>
					</div>
				</Container>
			</div>

			{/* Main header */}
			<div className="bg-white">
				<Container>
					<div className="flex items-center gap-4 lg:gap-8 py-4">
						{/* Logo */}
						<Link to="/" className="font-display text-2xl font-bold tracking-tight text-neutral-900 hover:text-neutral-700 transition-colors flex-shrink-0">
							Shop
						</Link>

						{/* Search bar */}
						<div className="hidden md:flex flex-1 max-w-2xl">
							<div className="relative w-full">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
								<input
									type="text"
									placeholder="Search products..."
									className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
								/>
							</div>
						</div>

						{/* Right side */}
						<div className="flex items-center gap-4 ml-auto">

							{/* Search icon mobile */}
							<button className="md:hidden p-2 text-neutral-700 hover:text-neutral-900">
								<Search className="h-5 w-5" />
							</button>

							{user ? (
								<div className="hidden sm:flex items-center gap-3 text-sm font-medium text-neutral-700">
									<User className="h-5 w-5" />
									<span>Hi, {user?.name || user?.email}</span>
									<button onClick={handleLogout} className="text-red-600 hover:underline text-sm">
										Logout
									</button>
								</div>
							) : (
								/* 🔹 Chưa login */
								<Link
									to="/login"
									className="hidden sm:flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
								>
									<User className="h-5 w-5" />
									<span>Login</span>
								</Link>
							)}

							{/* Wishlist */}
							<Link to="/wishlist" className="hidden sm:flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors relative">
								<Heart className="h-5 w-5" />
								<span className="absolute -right-1 -top-1 h-4 min-w-4 px-1 rounded-full bg-neutral-900 text-white text-[10px] font-semibold flex items-center justify-center">0</span>
							</Link>

							{/* Cart */}
							<Link to="/cart" className="relative inline-flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors">
								<ShoppingCart className="h-5 w-5" />
								<span className="hidden sm:inline">Cart</span>
								<span className="absolute -right-2 -top-2 h-5 min-w-5 px-1.5 rounded-full bg-neutral-900 text-white text-[10px] font-semibold flex items-center justify-center">0</span>
							</Link>

							{/* Mobile menu */}
							<button
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								className="md:hidden p-2 text-neutral-700 hover:text-neutral-900"
							>
								{mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
							</button>
						</div>
					</div>

					{/* Navigation */}
					<nav className="hidden md:flex items-center gap-8 pb-4 border-t border-neutral-100 pt-4">
						<NavLink 
							to="/shop" 
							className={activeNav === 'shop' 
								? 'text-neutral-900 border-b-2 border-neutral-900 pb-1 font-medium' 
								: 'text-neutral-600 hover:text-neutral-900 transition-colors'
							}
						>
							Shop
						</NavLink>

						<NavLink 
							to="/shop?category=men" 
							className={activeNav === 'men' 
								? 'text-neutral-900 border-b-2 border-neutral-900 pb-1 font-medium' 
								: 'text-neutral-600 hover:text-neutral-900 transition-colors'
							}
						>
							Men
						</NavLink>

						<NavLink 
							to="/shop?category=women" 
							className={activeNav === 'women' 
								? 'text-neutral-900 border-b-2 border-neutral-900 pb-1 font-medium' 
								: 'text-neutral-600 hover:text-neutral-900 transition-colors'
							}
						>
							Women
						</NavLink>

						<NavLink to="/about" className={({ isActive }) =>
							isActive ? 'text-neutral-900 border-b-2 border-neutral-900 pb-1 font-medium' :
								'text-neutral-600 hover:text-neutral-900 transition-colors'
						}>About</NavLink>

						<NavLink to="/contact" className={({ isActive }) =>
							isActive ? 'text-neutral-900 border-b-2 border-neutral-900 pb-1 font-medium' :
								'text-neutral-600 hover:text-neutral-900 transition-colors'
						}>Contact</NavLink>
					</nav>
				</Container>
			</div>

			{/* Mobile menu */}
			{mobileMenuOpen && (
				<div className="md:hidden border-t border-neutral-200 bg-white">
					<Container>
						<div className="py-4 space-y-4">
							<NavLink 
								to="/shop" 
								className={activeNav === 'shop' 
									? 'block py-2 text-neutral-900 font-medium border-l-4 border-neutral-900 pl-3' 
									: 'block py-2 text-neutral-600 hover:text-neutral-900'
								}
							>
								Shop
							</NavLink>
							<NavLink 
								to="/shop?category=men" 
								className={activeNav === 'men' 
									? 'block py-2 text-neutral-900 font-medium border-l-4 border-neutral-900 pl-3' 
									: 'block py-2 text-neutral-600 hover:text-neutral-900'
								}
							>
								Men
							</NavLink>
							<NavLink 
								to="/shop?category=women" 
								className={activeNav === 'women' 
									? 'block py-2 text-neutral-900 font-medium border-l-4 border-neutral-900 pl-3' 
									: 'block py-2 text-neutral-600 hover:text-neutral-900'
								}
							>
								Women
							</NavLink>
							<NavLink to="/about" className="block py-2 text-neutral-600 hover:text-neutral-900">About</NavLink>
							<NavLink to="/contact" className="block py-2 text-neutral-600 hover:text-neutral-900">Contact</NavLink>
						</div>
					</Container>
				</div>
			)}
		</header>
	)
}
