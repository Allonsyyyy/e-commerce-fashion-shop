import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/authApi";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await register(formData);
            alert("Đăng ký thành công! Vui lòng đăng nhập.");
            navigate("/login");
        } catch (err: any) {
            alert(err.message || "Đăng ký thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="py-20 flex justify-center">
            <form onSubmit={handleSubmit} className="w-96 space-y-4 border p-6 rounded-lg">
                <h2 className="text-2xl font-semibold text-center mb-4">Đăng ký</h2>

                <input
                    type="text"
                    placeholder="Họ và tên"
                    className="w-full border px-3 py-2 rounded"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border px-3 py-2 rounded"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />

                <input
                    type="password"
                    placeholder="Mật khẩu"
                    className="w-full border px-3 py-2 rounded"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />

                <input
                    type="tel"
                    placeholder="Số điện thoại"
                    className="w-full border px-3 py-2 rounded"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                />

                <input
                    type="text"
                    placeholder="Địa chỉ"
                    className="w-full border px-3 py-2 rounded"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-2 rounded hover:bg-neutral-800 disabled:opacity-50"
                >
                    {loading ? "Đang đăng ký..." : "Đăng ký"}
                </button>

                <p className="text-center text-sm text-neutral-600">
                    Đã có tài khoản?{" "}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Đăng nhập
                    </Link>
                </p>
            </form>
        </main>
    );
}

