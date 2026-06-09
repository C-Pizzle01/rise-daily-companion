import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/app/protocol")({
  component: ProtocolPage,
});

const MONO = "'Courier New', Courier, monospace";
const SERIF = "Georgia, serif";
const GOLD = "#F4C542";
const TEXT = "#EAE3D9";
const MUTED = "#6F8F9E";
const DANGER = "#dc2626";

const DAYS: { title: string; description: string }[] = [
  { title: "Welcome to the Protocol", description: "Set your baseline and begin the 28-day sequence." },
  { title: "Regulation", description: "Learn to down-regulate after activation." },
  { title: "Breath Work", description: "Tactical breathing to anchor the nervous system." },
  { title: "Awareness", description: "Track internal signals through the day." },
  { title: "Grounding", description: "Return to baseline under load." },
  { title: "Recovery", description: "Sleep and parasympathetic reset." },
  { title: "Integration", description: "Tie week one together." },
  { title: "Stress Tolerance", description: "Expanding the window of tolerance." },
  { title: "Cold Exposure", description: "Voluntary stress and recovery." },
  { title: "Movement", description: "Discharging residual activation." },
  { title: "Sleep Architecture", description: "Engineering deeper sleep." },
  { title: "Nutrition", description: "Fueling for high-stakes work." },
  { title: "Connection", description: "Co-regulation with trusted people." },
  { title: "Mid-Protocol Reset", description: "Recalibrate and reassess." },
  { title: "Identity", description: "Who you are under pressure." },
  { title: "Values", description: "What you protect and why." },
  { title: "Mission", description: "Aligning daily action to purpose." },
  { title: "Boundaries", description: "Holding the line off-duty." },
  { title: "Forgiveness", description: "Releasing operational weight." },
  { title: "Gratitude", description: "Rewiring threat-scanning." },
  { title: "Week Three Review", description: "Patterns and progress." },
  { title: "Resilience", description: "Bounce back with intention." },
  { title: "Adaptability", description: "Flex without breaking." },
  { title: "Focus", description: "Single-task under chaos." },
  { title: "Endurance", description: "Sustain over the long arc." },
  { title: "Service", description: "Carrying others without collapse." },
  { title: "Legacy", description: "What you leave behind." },
  { title: "Graduation", description: "Lock in the new baseline." },
];

function ProtocolPage() {
  const currentDay = 1;

  return (
    <div className="px-5 pt-6 pb-8 max-w-xl mx-auto">
      <h1
        style={{
          fontFamily: SERIF,
          fontSize: 26,
          color: TEXT,
          marginBottom: 24,
        }}
      >
        MISSION BRIEF
      </h1>

      <div className="flex flex-col gap-3">
        {DAYS.map((d, i) => {
          const day = i + 1;
          const locked = day > currentDay;
          const isCurrent = day === currentDay;
          const inFriction = day >= 7 && day <= 14;
          return (
            <div key={day}>
              {day === 7 && (
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 9,
                    letterSpacing: "2px",
                    color: DANGER,
                    opacity: 0.7,
                    marginBottom: 6,
                    marginTop: 4,
                  }}
                >
                  ⚠ FRICTION WINDOW
                </div>
              )}
            <button
              type="button"
              disabled={locked}
              className={`relative text-left w-full flex items-start gap-4 p-4 ${
                locked ? "rd-redact" : ""
              } ${isCurrent ? "rd-active-pulse" : ""}`}
              style={{
                backgroundColor: "#2F3E46",
                border: isCurrent
                  ? `1px solid ${GOLD}`
                  : inFriction
                    ? "1px solid rgba(220,38,38,0.2)"
                    : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 3,
                opacity: locked ? 0.55 : 1,
                cursor: locked ? "not-allowed" : "pointer",
              }}
            >
              {locked && <span className="rd-stamp-locked">LOCKED</span>}
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: "2px",
                  color: GOLD,
                  minWidth: 48,
                  paddingTop: 4,
                }}
              >
                DAY {String(day).padStart(2, "0")}
              </div>
              <div className="flex-1">
                <div
                  style={{
                    fontFamily: SERIF,
                    fontSize: 17,
                    color: TEXT,
                    marginBottom: 4,
                  }}
                >
                  {d.title}
                </div>
                <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
                  {d.description}
                </div>
              </div>
              {locked && (
                <Lock size={14} style={{ color: MUTED, marginTop: 6 }} />
              )}
            </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}