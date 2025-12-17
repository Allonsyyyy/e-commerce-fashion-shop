import Container from './Container'
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
	const currentYear = new Date().getFullYear()
	
	const footerLinks = {
		shop: [
			{ label: 'Hàng mới', to: '/shop?category=new' },
			{ label: 'Nam', to: '/shop?category=men' },
			{ label: 'Nữ', to: '/shop?category=women' },
			{ label: 'Phụ kiện', to: '/shop?category=accessories' },
			{ label: 'Khuyến mãi', to: '/shop?category=sale' },
		],
		company: [
			{ label: 'Về chúng tôi', to: '/about' },
			{ label: 'Liên hệ', to: '/contact' },
			{ label: 'Tuyển dụng', to: '#' },
			{ label: 'Báo chí', to: '#' },
		],
		support: [
			{ label: 'Thông tin giao hàng', to: '#' },
			{ label: 'Đổi trả', to: '#' },
			{ label: 'Câu hỏi thường gặp', to: '#' },
			{ label: 'Theo dõi đơn', to: '#' },
		],
		legal: [
			{ label: 'Chính sách bảo mật', to: '#' },
			{ label: 'Điều khoản sử dụng', to: '#' },
			{ label: 'Chính sách cookie', to: '#' },
		],
	}

	const socialLinks = [
		{ icon: Facebook, href: '#', label: 'Facebook' },
		{ icon: Instagram, href: '#', label: 'Instagram' },
		{ icon: Twitter, href: '#', label: 'Twitter' },
		{ icon: Mail, href: '#', label: 'Email' },
	]

	return (
		<footer className="border-t border-neutral-200 mt-20 bg-neutral-900 text-white">
			<Container>
				{/* Main footer content */}
				<div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 py-12">
					{/* Brand */}
					<div className="col-span-2 lg:col-span-1">
						<h3 className="font-display text-2xl font-bold mb-4">Shop</h3>
						<p className="body-small text-neutral-400 mb-6">
							Sản phẩm tinh gọn, thoải mái và thời trang.
						</p>
						<div className="flex items-center gap-4">
							{socialLinks.map((social, i) => (
								<a
									key={i}
									href={social.href}
									aria-label={social.label}
									className="p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
								>
									<social.icon className="h-5 w-5" />
								</a>
							))}
						</div>
					</div>

					{/* Shop */}
					<div>
						<h4 className="font-semibold mb-4">Mua sắm</h4>
						<ul className="space-y-3">
							{footerLinks.shop.map((link, i) => (
								<li key={i}>
									<Link to={link.to} className="body-small text-neutral-400 hover:text-white transition-colors">
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Company */}
					<div>
						<h4 className="font-semibold mb-4">Công ty</h4>
						<ul className="space-y-3">
							{footerLinks.company.map((link, i) => (
								<li key={i}>
									<Link to={link.to} className="body-small text-neutral-400 hover:text-white transition-colors">
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Support */}
					<div>
						<h4 className="font-semibold mb-4">Hỗ trợ</h4>
						<ul className="space-y-3">
							{footerLinks.support.map((link, i) => (
								<li key={i}>
									<Link to={link.to} className="body-small text-neutral-400 hover:text-white transition-colors">
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Legal */}
					<div>
						<h4 className="font-semibold mb-4">Pháp lý</h4>
						<ul className="space-y-3">
							{footerLinks.legal.map((link, i) => (
								<li key={i}>
									<Link to={link.to} className="body-small text-neutral-400 hover:text-white transition-colors">
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Bottom bar */}
				<div className="border-t border-neutral-800 py-6">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
						<p className="body-small text-neutral-400">
							© {currentYear} Shop. Giữ mọi quyền.
						</p>
						<div className="flex items-center gap-6">
							<Link to="#" className="body-small text-neutral-400 hover:text-white transition-colors">
								Bảo mật
							</Link>
							<Link to="#" className="body-small text-neutral-400 hover:text-white transition-colors">
								Điều khoản
							</Link>
							<Link to="#" className="body-small text-neutral-400 hover:text-white transition-colors">
								Cookie
							</Link>
						</div>
					</div>
				</div>
			</Container>
		</footer>
	)
}

