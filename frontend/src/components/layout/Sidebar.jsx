import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../state/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: "▣" },
  { to: "/cases", label: "Cases", icon: "§" },
  { to: "/clients", label: "Clients", icon: "◉" },
  { to: "/tasks", label: "Tasks", icon: "✓" },
  { to: "/documents", label: "Documents", icon: "▤" },
  { to: "/settings", label: "Settings", icon: "⚙" }
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex w-72 flex-col border-r border-border bg-surface px-8 py-10">

      {/* LOGO SECTION */}
      <div className="mb-14">
        <h1 className="font-logo text-3xl tracking-wide text-textPrimary">
          CaseWise
        </h1>
        <p className="mt-2 text-xs text-textSecondary tracking-wider uppercase">
          {user?.role} • {user?.name}
        </p>
      </div>

      {/* NAVIGATION */}
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `relative flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "text-textPrimary"
                  : "text-textSecondary hover:text-textPrimary"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Accent bar */}
                {isActive && (
                  <span className="absolute left-0 top-0 h-full w-1 rounded-r bg-accent" />
                )}

                {/* Icon */}
                <span
                  className={`text-base transition-all duration-200 ${
                    isActive ? "text-accent" : "opacity-60"
                  }`}
                >
                  {item.icon}
                </span>

                {/* Label */}
                <span className="tracking-wide">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* FOOTER SPACE (optional future use) */}
      <div className="mt-auto pt-10 text-xs text-textSecondary">
        <div className="border-t border-border pt-6 opacity-60">
          © {new Date().getFullYear()} CaseWise
        </div>
      </div>

    </aside>
  );
}