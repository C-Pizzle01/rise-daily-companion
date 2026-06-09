import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { rankFromDay, RANK_DESCRIPTIONS } from "@/lib/rank";

export const Route = createFileRoute("/app/profile")({
  component: ProfilePage,
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="rd-label mb-1" style={{ color: "#6F8F9E" }}>{label}</div>
      <div style={{ color: "#EAE3D9", fontFamily: "system-ui, sans-serif", fontSize: 15 }}>{value}</div>
    </div>
  );
}

function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentDay, setCurrentDay] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("user_progress")
        .select("current_day")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setCurrentDay(data.current_day ?? 0);
    })();
  }, [user]);

  const rank = rankFromDay(currentDay);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login", replace: true });
  };

  return (
    <div className="px-5 pt-10 max-w-xl mx-auto">
      <div className="rd-label mb-2" style={{ color: "#6F8F9E" }}>Operator</div>
      <h1 className="rd-serif text-4xl mb-8" style={{ color: "#EAE3D9" }}>Profile.</h1>

      <div className="mb-6">
        <span
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 13,
            letterSpacing: "2px",
            color: "#F4C542",
            border: "1px solid #F4C542",
            padding: "5px 12px",
            borderRadius: 3,
          }}
        >
          // {rank} //
        </span>
        <div
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 12,
            color: "#6F8F9E",
            marginTop: 10,
          }}
        >
          {RANK_DESCRIPTIONS[rank]}
        </div>
      </div>

      <div className="rd-card p-6 space-y-5" style={{ borderRadius: 4 }}>
        <Row label="EMAIL" value={user?.email ?? "—"} />
        <Row label="ROLE" value={profile?.first_responder_type ?? "—"} />
        <Row label="ASSIGNMENT" value={profile?.department ?? "—"} />
      </div>

      <button onClick={handleSignOut} className="rd-btn-gold w-full mt-8">
        Sign Out
      </button>
    </div>
  );
}