import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Search, Menu, X, User, Heart } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Container from './Container'

export default function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const [user, setUser] = useState<any>(null)
	const [profileOpen, setProfileOpen] = useState(false)
	const navigate = useNavigate()
	const location = useLocation()
	const profileRef = useRef<HTMLDivElement | null>(null)

	// Helper function to check if a nav item is active
	const isNavActive = (path: string, category?: string) => {
		const currentPath = location.pathname
		const searchParams = new URLSearchParams(location.search)
		const currentCategory = searchParams.get('category')

		if (path === '/shop') {
			if (category) {
				// For Men/Women: active if path is /shop and category matches exactly
				return currentPath === '/shop' && currentCategory === category
			} else {
				// For Shop: active if path is /shop and (no category or category is not men/women)
				return currentPath === '/shop' && (currentCategory === null || (currentCategory !== 'men' && currentCategory !== 'women'))
			}
		}
		// For About/Contact: check pathname only
		return currentPath === path
	}

	const loadUser = () => {
		const token = localStorage.getItem('token')
		if (!token) {
			setUser(null)
			return
		}

		fetch('http://localhost:3000/api/v1/auth/profile', {
			headers: { Authorization: `Bearer ${token}` }
		})
			.then((res) => res.json())
			.then((data) => setUser(data))
			.catch(() => setUser(null))
	}

	useEffect(() => {
		const handleAuthChanged = () => loadUser()

		loadUser()
		window.addEventListener('storage', handleAuthChanged)
		window.addEventListener('auth-changed', handleAuthChanged as EventListener)

		const handleClickOutside = (event: MouseEvent) => {
			if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
				setProfileOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)

		return () => {
			window.removeEventListener('storage', handleAuthChanged)
			window.removeEventListener('auth-changed', handleAuthChanged as EventListener)
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const handleLogout = () => {
		setProfileOpen(false)
		localStorage.removeItem('token')
		setUser(null)
		window.dispatchEvent(new Event('storage'))
		window.dispatchEvent(new Event('auth-changed'))
		navigate('/')
	}

	return (
		<header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
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

			<div className="bg-white">
				<Container>
					<div className="flex items-center gap-4 lg:gap-8 py-4">
						<Link to="/" className="font-display text-2xl font-bold tracking-tight text-neutral-900 hover:text-neutral-700 transition-colors flex-shrink-0">
							Shop
						</Link>

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

						<div className="flex items-center gap-4 ml-auto">
							<button className="md:hidden p-2 text-neutral-700 hover:text-neutral-900">
								<Search className="h-5 w-5" />
							</button>

							<div className="relative" ref={profileRef}>
								<button
									className="p-2 rounded-full border border-neutral-200 text-neutral-700 hover:text-neutral-900 hover:border-neutral-400 transition-colors"
									onClick={() => setProfileOpen((prev) => !prev)}
								>
									<User className="h-5 w-5" />
								</button>
								{profileOpen && (
									<div className="absolute right-0 mt-2 w-48 rounded-lg border border-neutral-200 bg-white shadow-lg py-2 text-sm z-50">
										{user ? (
											<>
												<div className="px-4 pb-2 text-xs uppercase text-neutral-500">
													Xin chào, {user?.name || user?.email}
												</div>
												<button className="w-full text-left px-4 py-2 hover:bg-neutral-50" onClick={() => { setProfileOpen(false); navigate('/profile') }}>
													Thông tin cá nhân
												</button>
												<button className="w-full text-left px-4 py-2 hover:bg-neutral-50" onClick={() => { setProfileOpen(false); navigate('/orders') }}>
													Đơn hàng của tôi
												</button>
												{user?.role === 'admin' && (
													<button
														className="w-full text-left px-4 py-2 hover:bg-neutral-50"
														onClick={() => {
															setProfileOpen(false)
															navigate('/admin')
														}}
													>
														Bảng quản trị
													</button>
												)}
												{user?.role === 'staff' && (
													<button
														className="w-full text-left px-4 py-2 hover:bg-neutral-50"
														onClick={() => {
															setProfileOpen(false)
															navigate('/staff/fulfillment')
														}}
													>
														Trang nhân viên
													</button>
												)}
												<button className="w-full text-left px-4 py-2 text-red-600 hover:bg-neutral-50" onClick={handleLogout}>
													Đăng xuất
												</button>
											</>
										) : (
											<button className="w-full text-left px-4 py-2 hover:bg-neutral-50" onClick={() => { setProfileOpen(false); navigate('/login') }}>
												Đăng nhập
											</button>
										)}
									</div>
								)}
							</div>

							<Link to="/wishlist" className="hidden sm:flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors relative">
								<Heart className="h-5 w-5" />
								<span className="absolute -right-1 -top-1 h-4 min-w-4 px-1 rounded-full bg-neutral-900 text-white text-[10px] font-semibold flex items-center justify-center">0</span>
							</Link>

							<Link to="/cart" className="relative inline-flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors">
								<ShoppingCart className="h-5 w-5" />
								<span className="hidden sm:inline">Cart</span>
								<span className="absolute -right-2 -top-2 h-5 min-w-5 px-1.5 rounded-full bg-neutral-900 text-white text-[10px] font-semibold flex items-center justify-center">0</span>
							</Link>

							<button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-neutral-700 hover:text-neutral-900">
								{mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
							</button>
						</div>
					</div>

					<nav className="hidden md:flex items-center gap-8 pb-4 border-t border-neutral-100 pt-4">
						<Link 
							to="/shop" 
							className={isNavActive('/shop') 
								? 'text-neutral-900 border-b-2 border-neutral-900 pb-1 font-medium' 
								: 'text-neutral-600 hover:text-neutral-900 transition-colors'
							}
						>
							Shop
						</Link>
						<Link 
							to="/shop?category=men" 
							className={isNavActive('/shop', 'men') 
								? 'text-neutral-900 border-b-2 border-neutral-900 pb-1 font-medium' 
								: 'text-neutral-600 hover:text-neutral-900 transition-colors'
							}
						>
							Men
						</Link>
						<Link 
							to="/shop?category=women" 
							className={isNavActive('/shop', 'women') 
								? 'text-neutral-900 border-b-2 border-neutral-900 pb-1 font-medium' 
								: 'text-neutral-600 hover:text-neutral-900 transition-colors'
							}
						>
							Women
						</Link>
						<Link 
							to="/about" 
							className={isNavActive('/about') 
								? 'text-neutral-900 border-b-2 border-neutral-900 pb-1 font-medium' 
								: 'text-neutral-600 hover:text-neutral-900 transition-colors'
							}
						>
							About
						</Link>
						<Link 
							to="/contact" 
							className={isNavActive('/contact') 
								? 'text-neutral-900 border-b-2 border-neutral-900 pb-1 font-medium' 
								: 'text-neutral-600 hover:text-neutral-900 transition-colors'
							}
						>
							Contact
						</Link>
					</nav>
				</Container>
			</div>

			{mobileMenuOpen && (
				<div className="md:hidden border-t border-neutral-200 bg-white">
					<Container>
						<div className="py-4 space-y-4">
							<Link 
								to="/shop" 
								onClick={() => setMobileMenuOpen(false)}
								className={`block py-2 transition-colors ${
									isNavActive('/shop') 
										? 'text-neutral-900 font-medium' 
										: 'text-neutral-600 hover:text-neutral-900'
								}`}
							>
								Shop
							</Link>
							<Link 
								to="/shop?category=men" 
								onClick={() => setMobileMenuOpen(false)}
								className={`block py-2 transition-colors ${
									isNavActive('/shop', 'men') 
										? 'text-neutral-900 font-medium' 
										: 'text-neutral-600 hover:text-neutral-900'
								}`}
							>
								Men
							</Link>
							<Link 
								to="/shop?category=women" 
								onClick={() => setMobileMenuOpen(false)}
								className={`block py-2 transition-colors ${
									isNavActive('/shop', 'women') 
										? 'text-neutral-900 font-medium' 
										: 'text-neutral-600 hover:text-neutral-900'
								}`}
							>
								Women
							</Link>
							<Link 
								to="/about" 
								onClick={() => setMobileMenuOpen(false)}
								className={`block py-2 transition-colors ${
									isNavActive('/about') 
										? 'text-neutral-900 font-medium' 
										: 'text-neutral-600 hover:text-neutral-900'
								}`}
							>
								About
							</Link>
							<Link 
								to="/contact" 
								onClick={() => setMobileMenuOpen(false)}
								className={`block py-2 transition-colors ${
									isNavActive('/contact') 
										? 'text-neutral-900 font-medium' 
										: 'text-neutral-600 hover:text-neutral-900'
								}`}
							>
								Contact
							</Link>
						</div>
					</Container>
				</div>
			)}
		</header>
	)
}
