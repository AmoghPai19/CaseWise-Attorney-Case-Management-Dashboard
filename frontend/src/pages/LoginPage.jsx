import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../state/AuthContext";

function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-10 shadow-soft">

        {/* Branding */}
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl text-textPrimary">
            CaseWise
          </h1>
          <div className="mt-2 h-px w-12 bg-accent opacity-70 mx-auto"></div>
          <p className="mt-4 text-sm text-textSecondary">
            Legal Case Management Dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {error && (
            <div className="rounded-lg border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs uppercase tracking-wider text-textSecondary mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-textPrimary placeholder:text-textSecondary focus:outline-none focus:ring-1 focus:ring-accent transition"
              placeholder="you@firm.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs uppercase tracking-wider text-textSecondary mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-textPrimary placeholder:text-textSecondary focus:outline-none focus:ring-1 focus:ring-accent transition"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-6 py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-textSecondary">
          No account?{" "}
          <Link
            to="/register"
            className="font-medium text-accent hover:opacity-80 transition"
          >
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;