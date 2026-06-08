import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/app/")({
  component: TodayPage,
});

function TodayPage() {
  const { profile } = useAuth();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="px-5 pt-10 max-w-xl mx-auto">
      <div className="rd-label mb-2" style={{ color: "#6F8F9E" }}>
        {today}
      </div>
      <h1 className="rd-serif text-4xl mb-1" style={{ color: "#EAE3D9" }}>
        Today.
      </h1>
      <p className="rd-serif italic mb-8" style={{ color: "#6F8F9E" }}>
        Show up. That's the work.
      </p>

      <div className="rd-card rd-radial-gold p-6" style={{ borderRadius: 4 }}>
        <div
          className="rd-mono mb-2"
          style={{ color: "#F4C542", fontSize: 14, letterSpacing: "3px" }}
        >
          DAY 01 / 28
        </div>
        <h2 className="rd-serif text-2xl mb-3" style={{ color: "#EAE3D9" }}>
          Begin the protocol.
        </h2>
        <p style={{ color: "#6F8F9E", lineHeight: 1.6, fontSize: 14 }}>
          Welcome, {profile?.department || "operator"}. Your conditioning
          sequence will appear here each morning.
        </p>
      </div>
    </div>
  );
}