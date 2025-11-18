import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/authApi";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await login({ email, password });
            localStorage.setItem("token", res.access_token);
            window.dispatchEvent(new Event("auth-changed"));
            alert("Đăng nhập thành công!");
            navigate("/");
        } catch (err: any) {
            alert(err.message || "Đăng nhập thất bại!");
        } finally {
            setLoading(false);
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
                    disabled={loading}
                    className="w-full bg-black text-white py-2 rounded hover:bg-neutral-800 disabled:opacity-50"
                >
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>

                <p className="text-center text-sm text-neutral-600">
                    Chưa có tài khoản?{" "}
                    <Link to="/register" className="text-blue-600 hover:underline">
                        Đăng ký
                    </Link>
                </p>
            </form>
        </main>
    );
}

