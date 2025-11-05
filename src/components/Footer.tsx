import Container from './Container'
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
	const currentYear = new Date().getFullYear()
	
	const footerLinks = {
		shop: [
			{ label: 'New Arrivals', to: '/shop?category=new' },
			{ label: 'Men', to: '/shop?category=men' },
			{ label: 'Women', to: '/shop?category=women' },
			{ label: 'Accessories', to: '/shop?category=accessories' },
			{ label: 'Sale', to: '/shop?category=sale' },
		],
		company: [
			{ label: 'About Us', to: '/about' },
			{ label: 'Contact', to: '/contact' },
			{ label: 'Careers', to: '#' },
			{ label: 'Press', to: '#' },
		],
		support: [
			{ label: 'Shipping Info', to: '#' },
			{ label: 'Returns', to: '#' },
			{ label: 'FAQ', to: '#' },
			{ label: 'Track Order', to: '#' },
		],
		legal: [
			{ label: 'Privacy Policy', to: '#' },
			{ label: 'Terms of Service', to: '#' },
			{ label: 'Cookie Policy', to: '#' },
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
							Premium essentials, curated for comfort and style.
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
						<h4 className="font-semibold mb-4">Shop</h4>
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
						<h4 className="font-semibold mb-4">Company</h4>
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
						<h4 className="font-semibold mb-4">Support</h4>
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
						<h4 className="font-semibold mb-4">Legal</h4>
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
							© {currentYear} Shop. All rights reserved.
						</p>
						<div className="flex items-center gap-6">
							<Link to="#" className="body-small text-neutral-400 hover:text-white transition-colors">
								Privacy
							</Link>
							<Link to="#" className="body-small text-neutral-400 hover:text-white transition-colors">
								Terms
							</Link>
							<Link to="#" className="body-small text-neutral-400 hover:text-white transition-colors">
								Cookies
							</Link>
						</div>
					</div>
				</div>
			</Container>
		</footer>
	)
}


