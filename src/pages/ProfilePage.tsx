import { useEffect, useState } from "react";
import Container from "../components/Container";

export default function ProfilePage() {
	const [profile, setProfile] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			setError("Vui lòng đăng nhập để xem hồ sơ.");
			setLoading(false);
			return;
		}

		fetch("http://localhost:3000/api/v1/auth/profile", {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => res.json())
			.then((data) => setProfile(data))
			.catch(() => setError("Không thể tải thông tin hồ sơ."))
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return <div className="py-20 text-center">Đang tải hồ sơ...</div>;
	}

	if (error || !profile) {
		return (
			<main className="py-12">
				<Container>
					<h1 className="heading-3 mb-4">Hồ sơ</h1>
					<p className="text-neutral-600">{error || "Không có dữ liệu."}</p>
				</Container>
			</main>
		);
	}

	return (
		<main className="py-12">
			<Container>
				<h1 className="heading-3 mb-6">Hồ sơ của tôi</h1>
				<div className="card space-y-3">
					<p>
						<span className="font-semibold">Tên:</span> {profile.name || "N/A"}
					</p>
					<p>
						<span className="font-semibold">Email:</span> {profile.email}
					</p>
					<p>
						<span className="font-semibold">Vai trò:</span> {profile.role}
					</p>
				</div>
			</Container>
		</main>
	);
}
