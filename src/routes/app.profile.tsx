import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

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

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login", replace: true });
  };

  return (
    <div className="px-5 pt-10 max-w-xl mx-auto">
      <div className="rd-label mb-2" style={{ color: "#6F8F9E" }}>Operator</div>
      <h1 className="rd-serif text-4xl mb-8" style={{ color: "#EAE3D9" }}>Profile.</h1>

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