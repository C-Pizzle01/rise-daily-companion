import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/app/")({
  component: TodayPage,
});

const MONO = "'Courier New', Courier, monospace";
const SERIF = "Georgia, serif";
const GOLD = "#F4C542";
const TEXT = "#EAE3D9";
const MUTED = "#6F8F9E";

function TodayPage() {
  const navigate = useNavigate();
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
        <div
          className="rd-radial-gold p-6"
          style={{
            border: "1px solid rgba(244,197,66,0.25)",
            borderRadius: 4,
            backgroundColor: "#2F3E46",
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
            DAY 1 OF 28
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