import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/app/log", label: "Log", icon: LogIcon },
  { to: "/app/dashboard", label: "Dashboard", icon: DashboardIcon },
  { to: "/app/history", label: "History", icon: HistoryIcon },
  { to: "/app/rules", label: "Rules", icon: RulesIcon },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-sand-200">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                isActive
                  ? "text-warm-600"
                  : "text-sand-500 hover:text-sand-700"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

// Inline SVG icons -- small and purpose-built for the four tabs.

function LogIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 4v12M4 10h12" />
    </svg>
  );
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="5.5" height="8" rx="1.5" />
      <rect x="11.5" y="3" width="5.5" height="5" rx="1.5" />
      <rect x="11.5" y="11" width="5.5" height="6" rx="1.5" />
      <rect x="3" y="14" width="5.5" height="3" rx="1.5" />
    </svg>
  );
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l2.5 2.5" />
    </svg>
  );
}

function RulesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 4h10M5 8h10M5 12h7M5 16h4" />
    </svg>
  );
}
