import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

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
      }
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
    </div>
  );
}