import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { rankFromDay } from "@/lib/rank";

export const Route = createFileRoute("/app/command")({
  component: CommandPage,
});

const MONO = "'Courier New', Courier, monospace";
const SERIF = "Georgia, serif";
const GOLD = "#F4C542";
const TEXT = "#EAE3D9";
const MUTED = "#6F8F9E";
const SURFACE = "#2F3E46";
const DANGER = "#dc2626";
const AMBER = "#f59e0b";

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  department: string | null;
  first_responder_type: string | null;
  is_admin: boolean | null;
};

type ProgressRow = {
  user_id: string;
  current_day: number | null;
  current_streak: number | null;
};

type CheckinRow = {
  user_id: string;
  day_number: number | null;
  q2_nervous_system: number | null;
  ghl_synced: boolean | null;
  created_at: string;
};

type Operator = {
  id: string;
  name: string;
  type: string;
  department: string;
  currentDay: number;
  streak: number;
  lastScore: number | null;
  daysSinceCheckin: number | null;
  ghlSynced: boolean;
  atRisk: boolean;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(iso: string): number {
  const d = new Date(iso);
  const now = new Date();
  const ms = now.getTime() - d.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function CommandPage() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [checkins, setCheckins] = useState<CheckinRow[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!profile?.is_admin) {
      navigate({ to: "/app", replace: true });
    }
  }, [profile, loading, navigate]);

  useEffect(() => {
    if (!profile?.is_admin) return;
    (async () => {
      const [{ data: p }, { data: pr }, { data: ci }] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "id, first_name, last_name, department, first_responder_type, is_admin",
          ),
        supabase
          .from("user_progress")
          .select("user_id, current_day, current_streak"),
        supabase
          .from("daily_checkins")
          .select("user_id, day_number, q2_nervous_system, ghl_synced, created_at")
          .order("created_at", { ascending: false }),
      ]);
      setProfiles((p as ProfileRow[]) ?? []);
      setProgress((pr as ProgressRow[]) ?? []);
      setCheckins((ci as CheckinRow[]) ?? []);
      setReady(true);
    })();
  }, [profile]);

  const today = todayIso();

  const operators = useMemo<Operator[]>(() => {
    const progByUser = new Map(progress.map((r) => [r.user_id, r]));
    const latestByUser = new Map<string, CheckinRow>();
    for (const c of checkins) {
      if (!latestByUser.has(c.user_id)) latestByUser.set(c.user_id, c);
    }

    const list = profiles.map<Operator>((p) => {
      const pr = progByUser.get(p.id);
      const last = latestByUser.get(p.id);
      const name =
        [p.first_name, p.last_name].filter(Boolean).join(" ").trim() ||
        "Unnamed Operator";
      const lastScore = last?.q2_nervous_system ?? null;
      const daysSince = last ? daysBetween(last.created_at) : null;
      const atRisk =
        (lastScore != null && lastScore <= 4) ||
        daysSince == null ||
        daysSince >= 2;
      return {
        id: p.id,
        name,
        type: p.first_responder_type ?? "—",
        department: p.department ?? "—",
        currentDay: pr?.current_day ?? 0,
        streak: pr?.current_streak ?? 0,
        lastScore,
        daysSinceCheckin: daysSince,
        ghlSynced: !!last?.ghl_synced,
        atRisk,
      };
    });

    list.sort((a, b) => {
      if (a.atRisk !== b.atRisk) return a.atRisk ? -1 : 1;
      return b.currentDay - a.currentDay;
    });
    return list;
  }, [profiles, progress, checkins]);

  const checkedInToday = useMemo(() => {
    const set = new Set<string>();
    for (const c of checkins) {
      if (c.created_at.slice(0, 10) === today) set.add(c.user_id);
    }
    return set.size;
  }, [checkins, today]);

  const avgNsToday = useMemo(() => {
    const todays = checkins.filter(
      (c) => c.created_at.slice(0, 10) === today && c.q2_nervous_system != null,
    );
    if (!todays.length) return null;
    const sum = todays.reduce((a, b) => a + (b.q2_nervous_system as number), 0);
    return Math.round((sum / todays.length) * 10) / 10;
  }, [checkins, today]);

  const atRisk = operators.filter((o) => o.atRisk);

  const dateLabel = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  if (loading || !profile?.is_admin) {
    return (
      <div className="px-5 pt-10 max-w-5xl mx-auto">
        <div className="rd-mono" style={{ color: MUTED, fontSize: 11 }}>
          AUTHORIZING…
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-10 pb-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1
            style={{ fontFamily: SERIF, fontSize: 36, color: TEXT, lineHeight: 1.1 }}
          >
            COMMAND CENTER
          </h1>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "3px",
              color: MUTED,
              marginTop: 6,
              textTransform: "uppercase",
            }}
          >
            OPERATOR OVERVIEW
          </div>
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 12,
            color: GOLD,
            letterSpacing: "2px",
            paddingTop: 6,
          }}
        >
          {dateLabel}
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <SummaryCard label="ACTIVE OPERATORS" value={profiles.length} />
        <SummaryCard label="CHECKED IN TODAY" value={checkedInToday} />
        <SummaryCard label="AT RISK" value={atRisk.length} danger />
        <SummaryCard
          label="AVG NS SCORE"
          value={avgNsToday == null ? "—" : avgNsToday.toFixed(1)}
        />
      </div>

      {/* At Risk panel */}
      <div
        className="mt-8 p-5"
        style={{
          backgroundColor: SURFACE,
          border: `1px solid ${DANGER}`,
          borderRadius: 4,
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 12,
            letterSpacing: "3px",
            color: DANGER,
            marginBottom: 14,
          }}
        >
          ⚠ REQUIRES ATTENTION
        </div>

        {!ready ? (
          <Empty>LOADING…</Empty>
        ) : atRisk.length === 0 ? (
          <div
            style={{
              fontFamily: MONO,
              fontSize: 13,
              letterSpacing: "2px",
              color: GOLD,
              textAlign: "center",
              padding: "16px 0",
            }}
          >
            ALL OPERATORS NOMINAL
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {atRisk.map((o) => (
              <div
                key={o.id}
                className="grid grid-cols-12 items-center gap-3 p-3"
                style={{
                  backgroundColor: "rgba(220,38,38,0.08)",
                  borderLeft: `3px solid ${DANGER}`,
                  borderRadius: 3,
                }}
              >
                <div className="col-span-12 md:col-span-4">
                  <div style={{ fontFamily: SERIF, fontSize: 16, color: TEXT }}>
                    {o.name}
                  </div>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      color: MUTED,
                      letterSpacing: 1,
                    }}
                  >
                    {o.department}
                  </div>
                </div>
                <Stat label="DAY" value={String(o.currentDay).padStart(2, "0")} />
                <Stat
                  label="LAST NS"
                  value={o.lastScore == null ? "—" : String(o.lastScore)}
                  color={scoreColor(o.lastScore)}
                />
                <Stat
                  label="LAST CHECK-IN"
                  value={
                    o.daysSinceCheckin == null
                      ? "NEVER"
                      : `${o.daysSinceCheckin}d AGO`
                  }
                />
                <div className="col-span-6 md:col-span-2 flex md:justify-end">
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      letterSpacing: "2px",
                      color: DANGER,
                      border: `1px solid ${DANGER}`,
                      padding: "4px 10px",
                      borderRadius: 3,
                    }}
                  >
                    CONTACT
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Roster */}
      <div className="mt-10">
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "3px",
            color: GOLD,
            marginBottom: 12,
          }}
        >
          FULL ROSTER
        </div>

        <div className="flex flex-col gap-2">
          {operators.map((o) => {
            const rank = rankFromDay(o.currentDay);
            return (
              <div
                key={o.id}
                className="grid grid-cols-12 items-center gap-3 p-3"
                style={{
                  backgroundColor: SURFACE,
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft: o.atRisk
                    ? `3px solid rgba(220,38,38,0.4)`
                    : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 3,
                }}
              >
                <div className="col-span-12 md:col-span-3">
                  <div style={{ fontFamily: SERIF, fontSize: 15, color: TEXT }}>
                    {o.name}
                  </div>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      color: MUTED,
                      letterSpacing: 1,
                    }}
                  >
                    {o.type}
                  </div>
                </div>
                <Stat label="DEPT" value={o.department} />
                <Stat label="DAY" value={`DAY ${String(o.currentDay).padStart(2, "0")}`} />
                <Stat
                  label="STREAK"
                  value={o.streak >= 3 ? `${o.streak} 🔥` : String(o.streak)}
                />
                <Stat
                  label="LAST NS"
                  value={o.lastScore == null ? "—" : String(o.lastScore)}
                  color={scoreColor(o.lastScore)}
                />
                <Stat
                  label="GHL"
                  value={o.ghlSynced ? "SYNCED" : "PENDING"}
                  color={o.ghlSynced ? GOLD : MUTED}
                />
                <div className="col-span-6 md:col-span-1 flex md:justify-end">
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 9,
                      letterSpacing: "2px",
                      color: GOLD,
                      border: `1px solid ${GOLD}`,
                      padding: "3px 8px",
                      borderRadius: 3,
                    }}
                  >
                    {rank}
                  </span>
                </div>
              </div>
            );
          })}
          {ready && operators.length === 0 && (
            <Empty>NO OPERATORS ENROLLED</Empty>
          )}
        </div>
      </div>
    </div>
  );
}

function scoreColor(score: number | null): string {
  if (score == null) return MUTED;
  if (score <= 3) return DANGER;
  if (score <= 6) return AMBER;
  return GOLD;
}

function SummaryCard({
  label,
  value,
  danger,
}: {
  label: string;
  value: number | string;
  danger?: boolean;
}) {
  return (
    <div className="rd-surface-grad p-5" style={{ borderRadius: 4 }}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "2px",
          color: MUTED,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 30,
          color: danger ? DANGER : GOLD,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color = TEXT,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="col-span-6 md:col-span-2">
      <div
        style={{
          fontFamily: MONO,
          fontSize: 9,
          letterSpacing: "2px",
          color: MUTED,
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 13, color }}>{value}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 12,
        color: MUTED,
        textAlign: "center",
        padding: "16px 0",
      }}
    >
      {children}
    </div>
  );
}