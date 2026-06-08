import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import logoAsset from "@/assets/path-to-rise-logo.png.asset.json";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign In — Rise Daily" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (session) {
      if (!profile?.first_responder_type) navigate({ to: "/onboarding", replace: true });
      else navigate({ to: "/app", replace: true });
    }
  }, [session, profile, authLoading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: "#0F2F3A" }}>
      <div className="w-full max-w-md">
        <div className="rd-radial-gold p-8 sm:p-10" style={{ borderRadius: 4, border: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="text-center mb-8">
            <img
              src={logoAsset.url}
              alt="Path to Rise"
              className="mx-auto mb-4"
              style={{ height: 80, width: "auto", mixBlendMode: "screen" }}
            />
            <div
              className="rd-mono"
              style={{ color: "#F4C542", letterSpacing: "6px", fontSize: 18, fontWeight: 700 }}
            >
              RISE DAILY
            </div>
            <p
              className="rd-serif italic mt-3"
              style={{ color: "#6F8F9E", fontSize: 14 }}
            >
              Reclaim Control. One day at a time.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="rd-label block mb-2" style={{ color: "#6F8F9E" }}>Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rd-input"
                placeholder="you@department.gov"
              />
            </div>
            <div>
              <label className="rd-label block mb-2" style={{ color: "#6F8F9E" }}>Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rd-input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rd-mono text-xs" style={{ color: "#E07A5F" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="rd-btn-gold w-full mt-2">
              {submitting ? "Signing In…" : "Sign In"}
            </button>
          </form>

          <p
            className="text-center mt-6"
            style={{ color: "#6F8F9E", fontSize: 12, fontFamily: "system-ui, sans-serif" }}
          >
            Don't have access? Contact your coach.
          </p>
        </div>
      </div>
    </div>
  );
}