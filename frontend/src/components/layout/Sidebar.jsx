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
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-surface px-6 py-8">

      {/* LOGO SECTION */}
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-white">
          CW
        </div>
        <div>
          <h1 className="font-heading text-base font-semibold leading-tight text-textPrimary">
            CaseWise
          </h1>
          <p className="text-xs text-textSecondary leading-tight">
            {user?.role}
          </p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-accent text-white"
                  : "text-textSecondary hover:bg-surfaceHover hover:text-textPrimary"
              }`
            }
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="mt-auto pt-8 text-xs text-textSecondary">
        <div className="border-t border-border pt-4">
          © {new Date().getFullYear()} CaseWise
        </div>
      </div>

    </aside>
  );
}