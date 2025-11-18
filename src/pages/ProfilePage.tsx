import { useEffect, useState } from "react";
import Container from "../components/Container";

export default function ProfilePage() {
	const [profile, setProfile] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			setError("Please log in to view your profile.");
			setLoading(false);
			return;
		}

		fetch("http://localhost:3000/api/v1/auth/profile", {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => res.json())
			.then((data) => setProfile(data))
			.catch(() => setError("Unable to load profile information."))
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return <div className="py-20 text-center">Loading profile...</div>;
	}

	if (error || !profile) {
		return (
			<main className="py-12">
				<Container>
					<h1 className="heading-3 mb-4">Profile</h1>
					<p className="text-neutral-600">{error || "No data available."}</p>
				</Container>
			</main>
		);
	}

	return (
		<main className="py-12">
			<Container>
				<h1 className="heading-3 mb-6">My profile</h1>
				<div className="card space-y-3">
					<p>
						<span className="font-semibold">Name:</span> {profile.name || "N/A"}
					</p>
					<p>
						<span className="font-semibold">Email:</span> {profile.email}
					</p>
					<p>
						<span className="font-semibold">Role:</span> {profile.role}
					</p>
				</div>
			</Container>
		</main>
	);
}
