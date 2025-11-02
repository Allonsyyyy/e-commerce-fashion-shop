import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch("http://localhost:3000/api/v1/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            }).then(res => res.json());

            if (!res.access_token) {
                alert(res.message || "Đăng nhập thất bại!");
                return;
            }

            localStorage.setItem("token", res.access_token);
            alert("Đăng nhập thành công!");
            navigate("/");
        } catch (err) {
            console.error(err);
            alert("Lỗi server!");
        }
    };

    return (
        <main className="py-20 flex justify-center">
            <form onSubmit={handleLogin} className="w-80 space-y-4 border p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-center mb-4">Đăng nhập</h2>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border px-3 py-2 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Mật khẩu"
                    className="w-full border px-3 py-2 rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-black text-white py-2 rounded hover:bg-neutral-800"
                >
                    Đăng nhập
                </button>
            </form>
        </main>
    );
}
