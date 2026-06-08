import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Begin — Rise Daily" }] }),
  component: OnboardingPage,
});

const TYPES = ["Law Enforcement", "Fire", "EMS", "Military", "Other"];

function OnboardingPage() {
  const navigate = useNavigate();
  const { session, profile, loading, user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<string | null>(null);
  const [department, setDepartment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/login", replace: true });
    else if (profile?.first_responder_type) navigate({ to: "/app", replace: true });
  }, [session, profile, loading, navigate]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    const { error: pErr } = await supabase.from("profiles").upsert({
      id: user.id,
      first_responder_type: type,
      department: department.trim(),
    });
    if (pErr) {
      setError(pErr.message);
      setSaving(false);
      return;
    }
    const { error: prErr } = await supabase.from("user_progress").upsert(
      { user_id: user.id, current_day: 1 },
      { onConflict: "user_id" },
    );
    if (prErr) {
      setError(prErr.message);
      setSaving(false);
      return;
    }
    await refreshProfile();
    navigate({ to: "/app", replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10" style={{ backgroundColor: "#0F2F3A" }}>
      <div className="w-full max-w-lg rd-card rd-radial-gold p-8" style={{ borderRadius: 4 }}>
        <div className="rd-label mb-6" style={{ color: "#6F8F9E" }}>
          Step {step} of 3
        </div>

        {step === 1 && (
          <>
            <h1 className="rd-serif text-3xl mb-2" style={{ color: "#EAE3D9" }}>
              Before we begin.
            </h1>
            <p className="mb-6" style={{ color: "#6F8F9E" }}>
              We want to know who we're working with.
            </p>
            <div className="space-y-3">
              {TYPES.map((t) => {
                const selected = type === t;
                return (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setType(t)}
                    className="w-full text-left p-4 transition-colors"
                    style={{
                      backgroundColor: selected ? "rgba(244,197,66,0.12)" : "#0F2F3A",
                      border: selected
                        ? "1px solid #F4C542"
                        : "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 3,
                      color: "#EAE3D9",
                      fontFamily: "system-ui, sans-serif",
                      fontSize: 15,
                      letterSpacing: "0.5px",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <button
              className="rd-btn-gold w-full mt-8"
              disabled={!type}
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="rd-serif text-3xl mb-2" style={{ color: "#EAE3D9" }}>
              Where do you serve?
            </h1>
            <p className="mb-6" style={{ color: "#6F8F9E" }}>
              Your unit, station, or department.
            </p>
            <input
              className="rd-input"
              style={{ fontSize: 16, padding: "16px" }}
              placeholder="Metro Police, Station 12, 3rd Battalion…"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <div className="flex gap-3 mt-8">
              <button
                className="rd-btn-gold flex-1"
                style={{ opacity: 0.6 }}
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                className="rd-btn-gold flex-1"
                disabled={!department.trim()}
                onClick={() => setStep(3)}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="rd-serif text-3xl mb-3" style={{ color: "#EAE3D9" }}>
              You're in.
            </h1>
            <p className="rd-serif text-xl mb-6" style={{ color: "#EAE3D9" }}>
              Day 1 starts today.
            </p>
            <div
              className="rd-mono mb-6"
              style={{ color: "#F4C542", fontSize: 22, letterSpacing: "2px" }}
            >
              {today.toUpperCase()}
            </div>
            <p
              className="rd-serif"
              style={{ color: "#EAE3D9", lineHeight: 1.6, fontSize: 15 }}
            >
              The next 28 days are yours. The protocol doesn't care how you feel.
              It only cares that you show up.
            </p>
            {error && (
              <div className="rd-mono text-xs mt-4" style={{ color: "#E07A5F" }}>
                {error}
              </div>
            )}
            <button
              className="rd-btn-gold w-full mt-8"
              disabled={saving}
              onClick={finish}
            >
              {saving ? "Activating…" : "Begin the Protocol"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}