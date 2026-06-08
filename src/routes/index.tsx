import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rise Daily" },
      { name: "description", content: "Reclaim Control. One day at a time." },
    ],
  }),
  component: Index,
});

function Index() {
  const { loading, session, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/login", replace: true });
    } else if (!profile?.first_responder_type) {
      navigate({ to: "/onboarding", replace: true });
    } else {
      navigate({ to: "/app", replace: true });
    }
  }, [loading, session, profile, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#0F2F3A" }}>
      <div className="rd-mono text-xs tracking-[0.4em]" style={{ color: "#6F8F9E" }}>
        STANDING BY…
      </div>
    </div>
  );
}
