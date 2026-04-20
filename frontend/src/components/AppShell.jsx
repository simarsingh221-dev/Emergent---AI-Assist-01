import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import FlowLogo from "@/components/FlowLogo";
import {
  Headset, Broadcast, ChartLineUp, BookOpen, Gear, SignOut, ClockCounterClockwise, User
} from "@phosphor-icons/react";

export default function AppShell() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const items = [
    { to: "/app/workspace", icon: Headset, label: "Workspace", testid: "nav-workspace" },
    { to: "/app/supervisor", icon: Broadcast, label: "Supervisor", testid: "nav-supervisor", role: "supervisor" },
    { to: "/app/history", icon: ClockCounterClockwise, label: "History", testid: "nav-history" },
    { to: "/app/kb", icon: BookOpen, label: "Knowledge", testid: "nav-kb" },
    { to: "/app/analytics", icon: ChartLineUp, label: "Analytics", testid: "nav-analytics" },
    { to: "/app/settings", icon: Gear, label: "Settings", testid: "nav-settings" },
  ].filter((i) => !i.role || user?.role === i.role);

  return (
    <div className="flex min-h-screen bg-[#F4F4F5]" data-testid="app-shell">
      <aside className="w-[220px] bg-[#09090B] text-white flex flex-col border-r border-black">
        <div className="px-5 py-6 border-b border-neutral-800">
          <div className="font-heading text-xl font-bold tracking-tight">VanguardCX</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mt-1">Agent Assist · v1.0</div>
        </div>
        <nav className="flex-1 py-3">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              data-testid={it.testid}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-sm border-l-2 ${
                  isActive ? "border-[#7B61FF] bg-neutral-900 text-white" : "border-transparent text-neutral-400 hover:text-white hover:bg-neutral-900"
                }`
              }
            >
              <it.icon size={18} weight="regular" />
              <span>{it.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-neutral-800 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 brand-gradient-bg flex items-center justify-center">
              <User size={16} weight="bold" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate" data-testid="user-name">{user?.name}</div>
              <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">{user?.role}</div>
            </div>
          </div>
          <button
            data-testid="logout-btn"
            onClick={() => { logout(); nav("/"); }}
            className="w-full flex items-center gap-2 text-xs text-neutral-400 hover:text-white py-2 px-2 border border-neutral-800 hover:border-neutral-600"
          >
            <SignOut size={14} /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
