import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/progress")({
  component: ProgressPage,
});

function ProgressPage() {
  const stats = [
    { label: "DAYS COMPLETE", value: "01" },
    { label: "CURRENT STREAK", value: "01" },
    { label: "MISSED", value: "00" },
    { label: "REMAINING", value: "27" },
  ];
  return (
    <div className="px-5 pt-10 max-w-xl mx-auto">
      <div className="rd-label mb-2" style={{ color: "#6F8F9E" }}>Tracking</div>
      <h1 className="rd-serif text-4xl mb-8" style={{ color: "#EAE3D9" }}>Progress.</h1>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rd-card p-5" style={{ borderRadius: 4 }}>
            <div className="rd-label mb-2" style={{ color: "#6F8F9E" }}>{s.label}</div>
            <div className="rd-mono" style={{ color: "#F4C542", fontSize: 32 }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}