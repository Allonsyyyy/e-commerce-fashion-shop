export default function Newsletter() {
	return (
		<section className="bg-gradient-to-br from-neutral-50 to-neutral-100 py-14 rounded-2xl border border-neutral-200">
			<div className="mx-auto max-w-3xl px-6">
				<h3 className="heading-4 text-center">Đăng ký nhận bản tin</h3>
				<p className="mt-3 body-small text-center">Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt.</p>
				<form className="mt-8 flex flex-col sm:flex-row gap-3">
					<input className="input flex-1" type="email" placeholder="ban@example.com" required />
					<button type="submit" className="btn-primary whitespace-nowrap px-8">Đăng ký</button>
				</form>
			</div>
		</section>
	)
}


