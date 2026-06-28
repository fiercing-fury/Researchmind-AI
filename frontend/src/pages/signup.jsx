import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    async function signup() {
        setError("");
        setSuccess("");

        if (!name || !email || !password || !confirmPassword) {
            setError("All fields are required.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        try {
            await API.post("/auth/signup", { name, email, password });
            setSuccess("Account created! Redirecting to login...");
            setTimeout(() => navigate("/"), 1500);
        } catch (err) {
            const detail = err?.response?.data?.detail;
            setError(detail || "Signup failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="min-h-screen overflow-hidden bg-[#050711] text-white">
            <div className="futuristic-bg" />
            <div className="scanline" />

            <section className="relative z-10 grid min-h-screen place-items-center px-6 py-12">
                <div className="w-full max-w-6xl">
                    <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">

                        {/* Left side — same as Login */}
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100 shadow-[0_0_35px_rgba(34,211,238,0.14)]">
                                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
                                Neural research workspace online
                            </div>

                            <div className="space-y-5">
                                <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-normal text-white md:text-7xl">
                                    ResearchMind AI
                                </h1>
                                <p className="max-w-2xl text-lg leading-8 text-slate-300">
                                    A luminous command center for uploading papers, asking grounded questions, and keeping your research conversations in flow.
                                </p>
                            </div>

                            <div className="grid max-w-2xl gap-4 sm:grid-cols-3">
                                {["Semantic search", "PDF memory", "Streaming answers"].map((item) => (
                                    <div
                                        className="rounded border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200 backdrop-blur"
                                        key={item}
                                    >
                                        <div className="mb-3 h-1 w-10 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.8)]" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right side — Signup panel */}
                        <div className="glass-panel login-panel relative mx-auto w-full max-w-md p-7">
                            <div className="mb-8">
                                <p className="text-sm uppercase tracking-[0.32em] text-cyan-200/80">
                                    New Node
                                </p>
                                <h2 className="mt-3 text-3xl font-bold text-white">
                                    Create account
                                </h2>
                            </div>

                            <div className="space-y-5">
                                <label className="block">
                                    <span className="mb-2 block text-sm text-slate-300">Name</span>
                                    <input
                                        className="futuristic-input"
                                        placeholder="Your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm text-slate-300">Email</span>
                                    <input
                                        className="futuristic-input"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm text-slate-300">Password</span>
                                    <input
                                        className="futuristic-input"
                                        type="password"
                                        placeholder="Create a password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm text-slate-300">Confirm Password</span>
                                    <input
                                        className="futuristic-input"
                                        type="password"
                                        placeholder="Repeat your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") signup(); }}
                                    />
                                </label>

                                {error && (
                                    <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                                        {error}
                                    </p>
                                )}

                                {success && (
                                    <p className="rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                                        {success}
                                    </p>
                                )}

                                <button
                                    className="primary-action w-full"
                                    disabled={isLoading}
                                    onClick={signup}
                                >
                                    {isLoading ? "Creating account..." : "Create account"}
                                </button>

                                <p className="text-center text-sm text-slate-400">
                                    Already have an account?{" "}
                                    <Link to="/" className="text-cyan-300 hover:underline">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </main>
    );
}
