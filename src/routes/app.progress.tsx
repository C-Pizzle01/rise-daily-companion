import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  Area,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export const Route = createFileRoute("/app/progress")({
  component: ProgressPage,
});

function useCountUp(target: number, duration = 800) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (target <= 0) {
      setV(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

function StatCard({ label, value }: { label: string; value: number }) {
  const display = useCountUp(value);
  return (
    <div
      className="rd-surface-grad p-5"
      style={{ borderRadius: 4 }}
    >
      <div className="rd-label mb-2" style={{ color: "#6F8F9E" }}>
        {label}
      </div>
      <div
        className="rd-mono"
        style={{ color: "#F4C542", fontSize: 32 }}
      >
        {String(display).padStart(2, "0")}
      </div>
    </div>
  );
}

function ProgressPage() {
  const { user } = useAuth();
  const [daysComplete, setDaysComplete] = useState(0);
  const [streak, setStreak] = useState(0);
  const [missed, setMissed] = useState(0);
  const [currentDay, setCurrentDay] = useState(1);
  const [checkins, setCheckins] = useState<
    { day_number: number; q2_nervous_system: number | null }[]
  >([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: prog } = await supabase
        .from("user_progress")
        .select("current_day, current_streak, total_checkins")
        .eq("user_id", user.id)
        .maybeSingle();
      if (prog) {
        const dc = prog.total_checkins ?? 0;
        const cd = prog.current_day ?? 1;
        setDaysComplete(dc);
        setStreak(prog.current_streak ?? 0);
        setMissed(Math.max(0, cd - 1 - dc));
        setCurrentDay(cd);
      }
      const { data: ci } = await supabase
        .from("daily_checkins")
        .select("day_number, q2_nervous_system")
        .eq("user_id", user.id)
        .order("day_number", { ascending: true });
      if (ci) setCheckins(ci as any);
    })();
  }, [user]);

  const remaining = Math.max(0, 28 - daysComplete);
  const stats = [
    { label: "DAYS COMPLETE", value: daysComplete },
    { label: "CURRENT STREAK", value: streak },
    { label: "MISSED", value: missed },
    { label: "REMAINING", value: remaining },
  ];

  return (
    <div className="px-5 pt-10 max-w-xl mx-auto">
      <div className="rd-label mb-2" style={{ color: "#6F8F9E" }}>Tracking</div>
      <h1 className="rd-serif text-4xl mb-8" style={{ color: "#EAE3D9" }}>Progress.</h1>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      <Heatmap checkins={checkins} currentDay={currentDay} />
      <TrendChart checkins={checkins} />
      <ToleranceBand checkins={checkins} />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rd-mono mt-10 mb-4"
      style={{
        color: "#F4C542",
        fontSize: 11,
        letterSpacing: 3,
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

function Heatmap({
  checkins,
  currentDay,
}: {
  checkins: { day_number: number; q2_nervous_system: number | null }[];
  currentDay: number;
}) {
  const byDay = new Map<number, number | null>();
  for (const c of checkins) byDay.set(c.day_number, c.q2_nervous_system);

  return (
    <>
      <SectionLabel>28-Day Record</SectionLabel>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => {
          const isPast = day < currentDay;
          const isCurrent = day === currentDay;
          const hasCheckin = byDay.has(day);
          const score = byDay.get(day);

          let bg = "#2F3E46";
          let border = "1px solid rgba(244,197,66,0.10)";
          let opacity = 1;

          if (hasCheckin && score != null) {
            const a = 0.2 + (Math.max(1, Math.min(10, score)) - 1) * (0.8 / 9);
            bg = `rgba(244,197,66,${a.toFixed(3)})`;
            border = "1px solid rgba(244,197,66,0.25)";
          } else if (isPast) {
            bg = "rgba(111,143,158,0.30)";
            border = "1px solid rgba(111,143,158,0.25)";
          }
          if (isCurrent) {
            border = "1px solid rgba(244,197,66,0.60)";
          }

          return (
            <div
              key={day}
              className={isCurrent ? "rd-pulse-glow" : ""}
              style={{
                aspectRatio: "1 / 1",
                background: bg,
                border,
                borderRadius: 4,
                opacity,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                padding: 4,
                fontFamily: "'Courier New', monospace",
                fontSize: 9,
                color: "#6F8F9E",
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </>
  );
}

function TrendChart({
  checkins,
}: {
  checkins: { day_number: number; q2_nervous_system: number | null }[];
}) {
  const data = checkins
    .filter((c) => c.q2_nervous_system != null)
    .map((c) => ({ day: c.day_number, ns: c.q2_nervous_system as number }));

  return (
    <>
      <SectionLabel>Nervous System Trend</SectionLabel>
      <div
        className="rd-surface-grad p-4"
        style={{ borderRadius: 4, border: "1px solid rgba(244,197,66,0.15)" }}
      >
        {data.length === 0 ? (
          <div
            className="rd-mono"
            style={{ color: "#6F8F9E", fontSize: 12, padding: "32px 8px", textAlign: "center" }}
          >
            Complete your first check-in to see your trend.
          </div>
        ) : (
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <ComposedChart data={data} margin={{ top: 10, right: 16, bottom: 4, left: -16 }}>
                <defs>
                  <linearGradient id="nsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F4C542" stopOpacity={0.16} />
                    <stop offset="100%" stopColor="#F4C542" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  type="number"
                  domain={[1, 28]}
                  ticks={[1, 7, 14, 21, 28]}
                  tick={{ fill: "#6F8F9E", fontFamily: "Courier New", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(111,143,158,0.25)" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 10]}
                  ticks={[0, 4, 7, 10]}
                  tick={{ fill: "#6F8F9E", fontFamily: "Courier New", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0F2F3A",
                    border: "1px solid rgba(244,197,66,0.25)",
                    fontFamily: "Courier New",
                    fontSize: 11,
                    color: "#EAE3D9",
                  }}
                  labelFormatter={(d) => `DAY ${d}`}
                />
                <ReferenceLine
                  y={7}
                  stroke="#F4C542"
                  strokeDasharray="4 4"
                  label={{
                    value: "REGULATED",
                    position: "insideTopRight",
                    fill: "#F4C542",
                    fontFamily: "Courier New",
                    fontSize: 9,
                  }}
                />
                <ReferenceLine
                  y={4}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: "THRESHOLD",
                    position: "insideBottomRight",
                    fill: "#ef4444",
                    fontFamily: "Courier New",
                    fontSize: 9,
                  }}
                />
                <Area type="monotone" dataKey="ns" stroke="none" fill="url(#nsFill)" />
                <Line
                  type="monotone"
                  dataKey="ns"
                  stroke="#F4C542"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#F4C542", stroke: "#F4C542" }}
                  activeDot={{ r: 5 }}
                  isAnimationActive
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </>
  );
}

function ToleranceBand({
  checkins,
}: {
  checkins: { day_number: number; q2_nervous_system: number | null }[];
}) {
  const scored = checkins
    .map((c) => c.q2_nervous_system)
    .filter((v): v is number => v != null);
  const enough = scored.length >= 3;
  const avg = scored.length
    ? scored.reduce((a, b) => a + b, 0) / scored.length
    : 0;

  // Min half-height 12, max 60, scaled by avg (clamped to 1-10)
  const clamped = Math.max(1, Math.min(10, avg));
  const minHalf = 12;
  const maxHalf = 60;
  const startHalf = minHalf;
  const endHalf = enough
    ? minHalf + ((clamped - 1) / 9) * (maxHalf - minHalf)
    : minHalf;

  const W = 600;
  const H = 160;
  const midY = H / 2;
  const topPath = `M 0 ${midY - startHalf} L ${W} ${midY - endHalf}`;
  const botPath = `M 0 ${midY + startHalf} L ${W} ${midY + endHalf}`;
  const fillPath = `M 0 ${midY - startHalf} L ${W} ${midY - endHalf} L ${W} ${midY + endHalf} L 0 ${midY + startHalf} Z`;

  return (
    <>
      <SectionLabel>Regulation Capacity</SectionLabel>
      <div
        className="rd-surface-grad p-4"
        style={{ borderRadius: 4, border: "1px solid rgba(244,197,66,0.15)" }}
      >
        <div
          className="rd-mono mb-1"
          style={{ color: "#6F8F9E", fontSize: 9, letterSpacing: 2 }}
        >
          HYPERACTIVATION
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
          <path d={fillPath} fill="rgba(244,197,66,0.15)" />
          <path d={topPath} stroke="#F4C542" strokeWidth={1.5} fill="none" />
          <path d={botPath} stroke="#F4C542" strokeWidth={1.5} fill="none" />
          <text
            x={W / 2}
            y={midY + 4}
            textAnchor="middle"
            fill="#F4C542"
            fontFamily="Courier New"
            fontSize={11}
            letterSpacing={3}
          >
            WINDOW OF TOLERANCE
          </text>
        </svg>
        <div
          className="rd-mono mt-1"
          style={{ color: "#6F8F9E", fontSize: 9, letterSpacing: 2 }}
        >
          HYPOACTIVATION
        </div>
        {!enough && (
          <div
            className="rd-mono mt-3"
            style={{ color: "#6F8F9E", fontSize: 10, textAlign: "center" }}
          >
            Band expands as you complete the protocol.
          </div>
        )}
      </div>
    </>
  );
}