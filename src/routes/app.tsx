import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Home, Target, TrendingUp, User, LayoutGrid } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

const baseTabs = [
  { to: "/app", label: "Today", icon: Home, exact: true },
  { to: "/app/protocol", label: "Protocol", icon: Target, exact: false },
  { to: "/app/progress", label: "Progress", icon: TrendingUp, exact: false },
  { to: "/app/profile", label: "Profile", icon: User, exact: false },
] as const;

const adminTab = {
  to: "/app/command",
  label: "Command",
  icon: LayoutGrid,
  exact: false,
} as const;

function AppLayout() {
  const { session, loading, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/login", replace: true });
    else if (!profile?.first_responder_type)
      navigate({ to: "/onboarding", replace: true });
  }, [session, profile, loading, navigate]);

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0F2F3A" }}>
        <div className="rd-mono text-xs" style={{ color: "#6F8F9E", letterSpacing: "0.4em" }}>
          STANDING BY…
        </div>
      </div>
    );
  }

  const tabs = profile?.is_admin
    ? [...baseTabs, adminTab]
    : baseTabs;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0F2F3A" }}>
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      <div className="rd-coords">28.N // RCP-01</div>

      <nav
        className="fixed bottom-0 left-0 right-0 flex"
        style={{
          backgroundColor: "#2F3E46",
          borderTop: "1px solid rgba(244,197,66,0.25)",
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              activeOptions={{ exact: tab.exact }}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1"
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={20}
                    strokeWidth={1.5}
                    color={isActive ? "#F4C542" : "#6F8F9E"}
                  />
                  <span
                    className="rd-label"
                    style={{ color: isActive ? "#F4C542" : "#6F8F9E" }}
                  >
                    {tab.label}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}