import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import About from './pages/About'
import Contact from './pages/Contact'
import CategoryPage from "./pages/CategoryPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import OrderSuccess from "./pages/OrderSuccess.tsx";

function App() {
	return (
		<div className="min-h-full flex flex-col">
			<Header />
			<div className="flex-1">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/shop" element={<Shop />} />
					<Route path="/product/:id" element={<ProductDetail />} />
					<Route path="/cart" element={<Cart />} />
					<Route path="/checkout" element={<Checkout />} />
					<Route path="/about" element={<About />} />
					<Route path="/contact" element={<Contact />} />
					<Route path="/category/:id" element={<CategoryPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/order-success" element={<OrderSuccess />} />
				</Routes>
			</div>
			<Footer />
		</div>
	)
}

export default App
