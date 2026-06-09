import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { rankFromDay } from "@/lib/rank";

export const Route = createFileRoute("/app/")({
  component: TodayPage,
});

const MONO = "'Courier New', Courier, monospace";
const SERIF = "Georgia, serif";
const GOLD = "#F4C542";
const TEXT = "#EAE3D9";
const MUTED = "#6F8F9E";

function statusFromScore(score: number | null): string {
  if (score == null) return "BASELINE";
  if (score >= 7) return "REGULATED";
  if (score >= 4) return "CALIBRATING";
  return "DYSREGULATED";
}

function Vitals({ ns, streak }: { ns: number | null; streak: number }) {
  const status = statusFromScore(ns);
  const items = [
    { label: "NS SCORE", value: ns == null ? "—" : String(ns) },
    { label: "STREAK", value: streak >= 3 ? `${streak} 🔥` : String(streak) },
    { label: "OPERATOR STATUS", value: status },
  ];
  return (
    <div
      className="grid grid-cols-3"
      style={{
        backgroundColor: "#2F3E46",
        border: "1px solid rgba(244,197,66,0.15)",
        borderRadius: 3,
      }}
    >
      {items.map((it, i) => (
        <div
          key={it.label}
          className="px-3 py-3 text-center"
          style={{
            borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 9,
              letterSpacing: "2px",
              color: MUTED,
              marginBottom: 6,
            }}
          >
            {it.label}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: it.label === "OPERATOR STATUS" ? 13 : 22,
              color: GOLD,
              fontWeight: 700,
              letterSpacing: it.label === "OPERATOR STATUS" ? "1px" : "0",
            }}
          >
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function Waveform() {
  return (
    <svg
      viewBox="0 0 400 60"
      className="w-full"
      style={{ height: 50, marginTop: 14, marginBottom: 6 }}
      preserveAspectRatio="none"
    >
      <path
        className="rd-wave"
        d="M0,30 Q25,30 35,30 T70,30 Q85,30 95,10 T120,30 Q135,30 145,30 T180,30 Q195,30 205,50 T230,30 Q245,30 255,30 T290,30 Q305,30 315,10 T340,30 Q355,30 365,30 T400,30"
        fill="none"
        stroke={GOLD}
        strokeOpacity={0.4}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

function DayRing({ day, total = 28 }: { day: number; total?: number }) {
  const size = 140;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, day / total));
  const offset = c * (1 - pct);
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={MUTED}
          strokeOpacity={0.2}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          className="rd-ring"
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={GOLD}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          style={
            {
              "--rd-ring-start": `${c}px`,
              "--rd-ring-end": `${offset}px`,
              strokeDashoffset: offset,
            } as React.CSSProperties
          }
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "2px",
            color: MUTED,
          }}
        >
          DAY
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 44,
            color: TEXT,
            lineHeight: 1,
          }}
        >
          {String(day).padStart(2, "0")}
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "2px",
            color: MUTED,
          }}
        >
          OF {total}
        </div>
      </div>
    </div>
  );
}

function TodayPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ns, setNs] = useState<number | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [currentDay, setCurrentDay] = useState<number>(1);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: prog } = await supabase
        .from("user_progress")
        .select("current_day, current_streak")
        .eq("user_id", user.id)
        .maybeSingle();
      if (prog) {
        setCurrentDay(prog.current_day ?? 1);
        setStreak(prog.current_streak ?? 0);
      }
      const { data: last } = await supabase
        .from("daily_checkins")
        .select("q2_nervous_system")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (last && last.q2_nervous_system != null) {
        setNs(Number(last.q2_nervous_system));
      }
    })();
  }, [user]);

  const today = new Date()
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
    })
    .toUpperCase()
    .replace(/,/g, "");

  return (
    <div>
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
        style={{
          backgroundColor: "#1B262C",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "3px",
            color: GOLD,
          }}
        >
          RISE DAILY
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "2px",
            color: MUTED,
          }}
        >
          {today}
        </span>
      </header>

      <div className="px-5 pt-6 pb-8 max-w-xl mx-auto">
        <Vitals ns={ns} streak={streak} />
        <Waveform />

        <div className="my-6">
          <DayRing day={currentDay} />
        </div>

        <div className="flex flex-col items-center gap-2 mb-6">
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "2px",
              color: GOLD,
              border: `1px solid ${GOLD}`,
              padding: "4px 10px",
              borderRadius: 3,
            }}
          >
            // {rankFromDay(currentDay)} //
          </span>
          {currentDay >= 7 && currentDay <= 14 && (
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: GOLD,
                textAlign: "center",
              }}
            >
              This is where operators are made.
            </div>
          )}
        </div>

        <SentinelUnlock currentDay={currentDay} />

        <div
          className="rd-radial-gold rd-surface-grad p-6"
          style={{
            borderRadius: 4,
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "3px",
              color: GOLD,
              marginBottom: 14,
            }}
          >
            DAY {currentDay} OF 28
          </div>
          <h2
            style={{
              fontFamily: SERIF,
              fontSize: 28,
              color: TEXT,
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            Welcome to the Protocol
          </h2>
          <p
            style={{
              fontSize: 16,
              color: MUTED,
              lineHeight: 1.5,
              marginBottom: 22,
            }}
          >
            Your 28-day nervous system conditioning program begins today.
          </p>
          <button
            className="w-full"
            onClick={() => navigate({ to: "/checkin" })}
            style={{
              fontFamily: MONO,
              fontSize: 12,
              letterSpacing: "2px",
              color: GOLD,
              border: `1px solid ${GOLD}`,
              backgroundColor: "transparent",
              padding: "14px 0",
              borderRadius: 3,
              cursor: "pointer",
            }}
          >
            CHECK IN TODAY →
          </button>
        </div>

        <p
          className="text-center mt-8"
          style={{
            fontFamily: MONO,
            fontSize: 12,
            color: MUTED,
            lineHeight: 1.6,
          }}
        >
          The protocol doesn't care how you feel.
          <br />
          It only cares that you show up.
        </p>
      </div>
    </div>
  );
}

function SentinelUnlock({ currentDay }: { currentDay: number }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (currentDay !== 14) return;
    if (typeof window === "undefined") return;
    const key = "rd-sentinel-unlocked";
    if (window.localStorage.getItem(key)) return;
    setOpen(true);
    window.localStorage.setItem(key, "1");
  }, [currentDay]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-sm w-full p-6"
        style={{
          backgroundColor: "#1B262C",
          border: `1px solid ${GOLD}`,
          borderRadius: 4,
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 12,
            letterSpacing: "3px",
            color: GOLD,
            marginBottom: 12,
          }}
        >
          SENTINEL UNLOCKED
        </div>
        <p style={{ color: GOLD, fontSize: 15, lineHeight: 1.5, marginBottom: 20 }}>
          You survived the friction window. 7 in 10 operators quit here. You didn't.
        </p>
        <button
          onClick={() => setOpen(false)}
          className="w-full"
          style={{
            fontFamily: MONO,
            fontSize: 12,
            letterSpacing: "2px",
            color: GOLD,
            border: `1px solid ${GOLD}`,
            backgroundColor: "transparent",
            padding: "12px 0",
            borderRadius: 3,
            cursor: "pointer",
          }}
        >
          DISMISS
        </button>
      </div>
    </div>
  );
}