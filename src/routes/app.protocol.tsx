import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/protocol")({
  component: ProtocolPage,
});

function ProtocolPage() {
  return (
    <div className="px-5 pt-10 max-w-xl mx-auto">
      <div className="rd-label mb-2" style={{ color: "#6F8F9E" }}>28-Day Sequence</div>
      <h1 className="rd-serif text-4xl mb-8" style={{ color: "#EAE3D9" }}>Protocol.</h1>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
          <div
            key={day}
            className="aspect-square flex items-center justify-center rd-mono"
            style={{
              backgroundColor: day === 1 ? "rgba(244,197,66,0.12)" : "#2F3E46",
              border: day === 1 ? "1px solid #F4C542" : "1px solid rgba(255,255,255,0.04)",
              color: day === 1 ? "#F4C542" : "#6F8F9E",
              fontSize: 13,
              borderRadius: 3,
            }}
          >
            {String(day).padStart(2, "0")}
          </div>
        ))}
      </div>
    </div>
  );
}