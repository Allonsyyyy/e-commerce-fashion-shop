import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/authApi";
import Container from "../components/Container";
import { LogIn, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await login({ email, password });
            localStorage.setItem("token", res.access_token);
            navigate("/");
            window.location.reload();
        } catch (err: any) {
            setError(err.message || "Login failed! Please check your information.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="py-20 min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
            <Container>
                <div className="max-w-md mx-auto">
                    <div className="card p-8 shadow-lg">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-900 rounded-full mb-4">
                                <LogIn className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="heading-3 mb-2">Sign In</h1>
                            <p className="body-text text-neutral-600">
                                Welcome back! Please sign in to your account.
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleLogin} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        className="input pl-10 w-full"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="input pl-10 w-full"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-6 flex items-center">
                            <div className="flex-1 border-t border-neutral-200"></div>
                            <span className="px-4 text-sm text-neutral-500">or</span>
                            <div className="flex-1 border-t border-neutral-200"></div>
                        </div>

                        {/* Register Link */}
                        <div className="text-center">
                            <p className="body-text text-neutral-600">
                                Don't have an account?{" "}
                                <Link
                                    to="/register"
                                    className="font-semibold text-neutral-900 hover:underline"
                                >
                                    Sign up now
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
        </main>
    );
}