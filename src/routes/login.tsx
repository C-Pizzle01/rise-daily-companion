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
  const [mode, setMode] = useState<"signup" | "signin">("signup");
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

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      setSubmitting(false);
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setSubmitting(false);
      if (error) setError(error.message);
    }
  };

  const isSignUp = mode === "signup";

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

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="rd-serif" style={{ fontSize: 26, fontWeight: 700, color: "#EAE3D9" }}>
              {isSignUp ? "CREATE YOUR ACCOUNT" : "WELCOME BACK, OPERATOR"}
            </h1>
            <p
              className="rd-mono mt-2"
              style={{ color: "#6F8F9E", fontSize: 11, letterSpacing: "1px" }}
            >
              {isSignUp
                ? "First time here? Enter your email and create a password."
                : "Enter your credentials to continue the protocol."}
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
                autoComplete={isSignUp ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rd-input"
                placeholder="••••••••"
              />
              {isSignUp && (
                <p className="rd-mono mt-1" style={{ color: "#6F8F9E", fontSize: 9, letterSpacing: "0.5px" }}>
                  Minimum 6 characters
                </p>
              )}
            </div>

            {error && (
              <div className="rd-mono text-xs" style={{ color: "#E07A5F" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="rd-btn-gold w-full mt-2">
              {submitting
                ? isSignUp
                  ? "Creating Account…"
                  : "Signing In…"
                : isSignUp
                  ? "Create Account"
                  : "Sign In"}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(111,143,158,0.25)" }} />
            <span className="rd-mono" style={{ color: "#6F8F9E", fontSize: 10, letterSpacing: "1px", whiteSpace: "nowrap" }}>
              {isSignUp ? "Already have an account?" : "New here?"}
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(111,143,158,0.25)" }} />
          </div>

          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => {
                setMode(isSignUp ? "signin" : "signup");
                setError(null);
              }}
              className="rd-mono"
              style={{
                color: "#F4C542",
                fontSize: 11,
                letterSpacing: "2px",
                textDecoration: "underline",
                textUnderlineOffset: 3,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {isSignUp ? "SIGN IN →" : "CREATE ACCOUNT →"}
            </button>
          </div>

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