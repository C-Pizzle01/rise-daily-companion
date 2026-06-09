import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/checkin")({
  component: CheckinPage,
});

const MONO = "'Courier New', Courier, monospace";
const SERIF = "Georgia, serif";
const GOLD = "#F4C542";
const TEXT = "#EAE3D9";
const MUTED = "#6F8F9E";
const SURFACE = "#2F3E46";
const BG = "#1B262C";
const DANGER = "#dc2626";
const AMBER = "#f59e0b";

const WEBHOOK_URL =
  "https://services.leadconnectorhq.com/hooks/vxapd3jx9Tp1B4DK8SWv/webhook-trigger/PLACEHOLDER";

function Dots({ step }: { step: 0 | 1 | 2 | 3 }) {
  return (
    <div className="flex justify-center gap-2 pt-6 pb-8">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: i === step ? GOLD : "rgba(255,255,255,0.15)",
          }}
        />
      ))}
    </div>
  );
}

function GoldButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full"
      style={{
        fontFamily: MONO,
        fontSize: 12,
        letterSpacing: "2px",
        color: GOLD,
        border: `1px solid ${GOLD}`,
        backgroundColor: "transparent",
        padding: "14px 0",
        borderRadius: 3,
        textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}

function CheckinPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [q1, setQ1] = useState<boolean | null>(null);
  const [q2, setQ2] = useState<number | null>(null);
  const [q3, setQ3] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const dayNumber = 1;

  // Auto-advance when YES selected on screen 1
  useEffect(() => {
    if (step === 0 && q1 === true) {
      const t = setTimeout(() => setStep(1), 400);
      return () => clearTimeout(t);
    }
  }, [step, q1]);

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    const submittedAt = new Date().toISOString();
    const today = submittedAt.slice(0, 10);

    try {
      const { error: ciErr } = await supabase.from("daily_checkins").upsert(
        {
          user_id: user.id,
          day_number: dayNumber,
          q1_completed: q1,
          q2_nervous_system: q2,
          q3_reflection: q3 || null,
          submitted_at: submittedAt,
        },
        { onConflict: "user_id,day_number" },
      );
      if (ciErr) throw ciErr;

      // Update user_progress: increment counters
      const { data: prog } = await supabase
        .from("user_progress")
        .select("total_checkins, streak")
        .eq("user_id", user.id)
        .maybeSingle();

      await supabase.from("user_progress").upsert(
        {
          user_id: user.id,
          total_checkins: (prog?.total_checkins ?? 0) + 1,
          streak: (prog?.streak ?? 0) + 1,
          last_checkin_date: today,
        },
        { onConflict: "user_id" },
      );

      // Fire webhook — best-effort, never block
      try {
        const firstName =
          (user.user_metadata?.first_name as string | undefined) ||
          (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ||
          profile?.department ||
          "";
        fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: firstName,
            email: user.email,
            day_number: dayNumber,
            q1_completed: q1,
            q2_nervous_system: q2,
            q3_reflection: q3 || null,
            submitted_at: submittedAt,
          }),
        }).catch(() => {});
      } catch {
        // silent fail — webhook is best-effort
      }

      setCelebrate(true);
      setTimeout(() => {
        setCelebrate(false);
        setStep(3);
      }, 600);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Submission failed";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG }}>
      {celebrate && <Celebration />}
      <div className="max-w-xl mx-auto px-5">
        {step < 3 && <Dots step={step} />}

        {step === 0 && (
          <Screen1
            q1={q1}
            onSelect={setQ1}
            onContinue={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <Screen2 q2={q2} onSelect={setQ2} onContinue={() => setStep(2)} />
        )}
        {step === 2 && (
          <Screen3
            q3={q3}
            setQ3={setQ3}
            onSubmit={handleSubmit}
            submitting={submitting}
            dayNumber={dayNumber}
          />
        )}
        {step === 3 && (
          <Done dayNumber={dayNumber} onBack={() => navigate({ to: "/app" })} />
        )}
        {error && (
          <p
            className="text-center mt-4"
            style={{ color: "#ff6b6b", fontFamily: MONO, fontSize: 12 }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

function Screen1({
  q1,
  onSelect,
  onContinue,
}: {
  q1: boolean | null;
  onSelect: (v: boolean) => void;
  onContinue: () => void;
}) {
  return (
    <div className="pt-4 pb-10">
      <h1
        style={{
          fontFamily: SERIF,
          fontSize: 28,
          color: TEXT,
          lineHeight: 1.2,
          marginBottom: 10,
        }}
      >
        Did you complete today's protocol?
      </h1>
      <p
        style={{
          fontFamily: MONO,
          fontSize: 12,
          color: MUTED,
          letterSpacing: "1px",
          marginBottom: 28,
        }}
      >
        Be honest. This is just for you.
      </p>

      <button
        onClick={() => onSelect(true)}
        className="w-full text-left p-5 mb-3 relative"
        style={{
          backgroundColor:
            q1 === true ? "rgba(244,197,66,0.12)" : "transparent",
          border: `1px solid ${GOLD}`,
          borderRadius: 3,
          fontFamily: MONO,
          fontSize: 13,
          letterSpacing: "2px",
          color: GOLD,
          cursor: "pointer",
        }}
      >
        YES — I SHOWED UP
      </button>

      <button
        onClick={() => onSelect(false)}
        className="w-full text-left p-5"
        style={{
          backgroundColor:
            q1 === false ? "rgba(255,255,255,0.05)" : "transparent",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 3,
          fontFamily: MONO,
          fontSize: 13,
          letterSpacing: "2px",
          color: TEXT,
          cursor: "pointer",
        }}
      >
        NOT TODAY
      </button>

      {q1 === false && (
        <div className="mt-8">
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 18,
              color: TEXT,
              lineHeight: 1.5,
              marginBottom: 20,
              fontStyle: "italic",
            }}
          >
            That's okay. Showing up to this check-in counts.
          </p>
          <GoldButton onClick={onContinue}>CONTINUE →</GoldButton>
        </div>
      )}
    </div>
  );
}

function Screen2({
  q2,
  onSelect,
  onContinue,
}: {
  q2: number | null;
  onSelect: (n: number) => void;
  onContinue: () => void;
}) {
  return (
    <div className="pt-4 pb-10">
      <h1
        style={{
          fontFamily: SERIF,
          fontSize: 28,
          color: TEXT,
          lineHeight: 1.2,
          marginBottom: 10,
        }}
      >
        Where is your nervous system right now?
      </h1>
      <p
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: MUTED,
          letterSpacing: "1px",
          marginBottom: 28,
        }}
      >
        1 = completely dysregulated &nbsp;&nbsp; 10 = fully regulated
      </p>

      <div
        className="text-center"
        style={{
          fontFamily: SERIF,
          fontSize: 80,
          lineHeight: 1,
          color: q2 ? GOLD : "rgba(244,197,66,0.15)",
          minHeight: 96,
          marginBottom: 24,
        }}
      >
        {q2 ?? "—"}
      </div>

      <div className="grid grid-cols-5 gap-2 mb-8">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onSelect(n)}
            style={{
              padding: "14px 0",
              backgroundColor: q2 === n ? "rgba(244,197,66,0.12)" : SURFACE,
              border:
                q2 === n
                  ? `1px solid ${GOLD}`
                  : "1px solid rgba(255,255,255,0.06)",
              color: q2 === n ? GOLD : TEXT,
              fontFamily: MONO,
              fontSize: 14,
              borderRadius: 3,
              cursor: "pointer",
            }}
          >
            {n}
          </button>
        ))}
      </div>

      {q2 !== null && (
        <GoldButton onClick={onContinue}>CONTINUE →</GoldButton>
      )}
    </div>
  );
}

function Screen3({
  q3,
  setQ3,
  onSubmit,
  submitting,
  dayNumber,
}: {
  q3: string;
  setQ3: (v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  dayNumber: number;
}) {
  return (
    <div className="pt-4 pb-10">
      <h1
        style={{
          fontFamily: SERIF,
          fontSize: 28,
          color: TEXT,
          lineHeight: 1.2,
          marginBottom: 10,
        }}
      >
        What's pulling you back today?
      </h1>
      <p
        style={{
          fontFamily: MONO,
          fontSize: 12,
          color: MUTED,
          letterSpacing: "1px",
          marginBottom: 24,
          lineHeight: 1.5,
        }}
      >
        A shift. A thought. A night alone with your thoughts.
      </p>

      <textarea
        value={q3}
        onChange={(e) => setQ3(e.target.value.slice(0, 2000))}
        placeholder="Write anything. Or nothing."
        rows={7}
        className="w-full"
        style={{
          backgroundColor: SURFACE,
          border: "1px solid rgba(255,255,255,0.06)",
          color: TEXT,
          fontFamily: SERIF,
          fontSize: 15,
          padding: 16,
          borderRadius: 3,
          resize: "vertical",
          outline: "none",
          marginBottom: 14,
        }}
      />

      <div className="text-center mb-8">
        <button
          onClick={() => {
            setQ3("");
            onSubmit();
          }}
          style={{
            fontFamily: MONO,
            fontSize: 12,
            color: MUTED,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            letterSpacing: "1px",
          }}
        >
          Skip this question →
        </button>
      </div>

      <GoldButton onClick={onSubmit} disabled={submitting}>
        {submitting ? "LOCKING IN…" : `LOCK IN DAY ${dayNumber}`}
      </GoldButton>
    </div>
  );
}

function Done({
  dayNumber,
  onBack,
}: {
  dayNumber: number;
  onBack: () => void;
}) {
  const total = 28;
  const pct = (dayNumber / total) * 100;
  const r = 56;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="pt-16 pb-10 text-center">
      <div
        className="mx-auto flex items-center justify-center"
        style={{
          width: 88,
          height: 88,
          borderRadius: 999,
          border: `1px solid ${GOLD}`,
          backgroundColor: "rgba(244,197,66,0.08)",
          marginBottom: 28,
        }}
      >
        <Check size={44} color={GOLD} strokeWidth={1.5} />
      </div>

      <h1
        style={{
          fontFamily: SERIF,
          fontSize: 32,
          color: TEXT,
          marginBottom: 32,
        }}
      >
        Day {dayNumber} locked in.
      </h1>

      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: "2px",
          color: GOLD,
          marginTop: -20,
          marginBottom: 32,
        }}
      >
        MISSION COMPLETE — DAY {dayNumber} OF {total}
      </div>

      <div className="relative mx-auto mb-10" style={{ width: 140, height: 140 }}>
        <svg width={140} height={140} viewBox="0 0 140 140">
          <circle
            cx={70}
            cy={70}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={4}
          />
          <circle
            cx={70}
            cy={70}
            r={r}
            fill="none"
            stroke={GOLD}
            strokeWidth={4}
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
          />
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ fontFamily: MONO, color: GOLD }}
        >
          <span style={{ fontSize: 22, letterSpacing: "2px" }}>
            {dayNumber}/{total}
          </span>
          <span style={{ fontSize: 10, color: MUTED, letterSpacing: "2px", marginTop: 4 }}>
            COMPLETE
          </span>
        </div>
      </div>

      <GoldButton onClick={onBack}>BACK TO TODAY</GoldButton>
    </div>
  );
}