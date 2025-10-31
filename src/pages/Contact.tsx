import Container from '../components/Container'

export default function Contact() {
	return (
		<main className="py-12">
			<Container>
				<div className="max-w-2xl">
					<h1 className="heading-3">Contact</h1>
					<p className="mt-4 body-text">Have a question? Send us a message and we'll get back to you as soon as possible.</p>
					<form className="mt-8 space-y-5">
						<input className="input" type="text" placeholder="Name" required />
						<input className="input" type="email" placeholder="Email" required />
						<textarea className="input min-h-[120px] resize-none" rows={5} placeholder="Message" required />
						<button className="btn-primary px-8 py-3">Send message</button>
					</form>
				</div>
			</Container>
		</main>
	)
}


