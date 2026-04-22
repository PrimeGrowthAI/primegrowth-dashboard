// PrimeGrowth AI — Agent Command Center
// Design: Premium Dark SaaS / Mission Control
// Layout: Fixed left sidebar (240px) + main content area

import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  GitBranch,
  Terminal,
  Activity,
  Zap,
  ChevronRight,
  Wifi,
  CalendarCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { AGENTS, getActiveAgents, DEPARTMENTS } from "@/lib/agents";

const NAV_ITEMS = [
  { href: "/", label: "Command Center", icon: LayoutDashboard },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/bridge", label: "Local Bridge", icon: Wifi },
  { href: "/commands", label: "Slash Commands", icon: Terminal },
];

const CLIENT_NAV_ITEMS = [
  { href: "/demo/dispatch", label: "Dispatch", icon: CalendarCheck },
  { href: "/demo/marges", label: "Marges & Finances", icon: TrendingUp },
  { href: "/demo/leads", label: "Leads", icon: Users },
];

const DEPT_COLORS: Record<string, string> = {
  revenue: "bg-amber-400",
  delivery: "bg-emerald-400",
  backoffice: "bg-blue-400",
  meta: "bg-violet-400",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const activeAgents = getActiveAgents();

  const deptCounts = Object.keys(DEPARTMENTS).map((dept) => ({
    dept,
    count: AGENTS.filter((a) => a.department === dept).length,
    active: AGENTS.filter((a) => a.department === dept && a.status === "active").length,
    info: DEPARTMENTS[dept as keyof typeof DEPARTMENTS],
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-[240px] flex-shrink-0 flex flex-col border-r border-border/60 bg-sidebar overflow-y-auto">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
                PrimeGrowth AI
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Agent Command Center
              </p>
            </div>
          </div>
        </div>

        {/* Live status */}
        <div className="px-5 py-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0081F2] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0081F2]"></span>
            </span>
            <span className="text-xs text-[#0081F2] font-medium">
              {activeAgents.length} agents active
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-3 py-3 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = location === href;
            return (
              <Link key={href} href={href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all",
                    isActive
                      ? "bg-primary/15 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Client Demo Nav */}
        <div className="px-3 py-3 mt-1 border-t border-border/60">
          <p className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Tableau de bord client
          </p>
          <div className="space-y-0.5">
            {CLIENT_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = location === href;
              return (
                <Link key={href} href={href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all",
                      isActive
                        ? "bg-[#0081F2]/15 text-[#0081F2] font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                    {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Departments */}
        <div className="px-3 py-3 mt-1">
          <p className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Departments
          </p>
          <div className="space-y-0.5">
            {deptCounts.map(({ dept, count, active, info }) => (
              <Link key={dept} href={`/?dept=${dept}`}>
                <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
                  <span className={cn("w-2 h-2 rounded-full flex-shrink-0", DEPT_COLORS[dept])} />
                  <span className="flex-1 truncate">{info.label}</span>
                  <span className="text-[10px] text-muted-foreground/60">
                    {active > 0 && <span className="text-emerald-400 mr-1">{active}●</span>}
                    {count}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="mt-auto px-5 py-4 border-t border-border/60">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Agents</p>
              <p className="text-lg font-bold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
                {AGENTS.length}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Active</p>
              <p className="text-lg font-bold text-emerald-400" style={{ fontFamily: "'Syne', sans-serif" }}>
                {activeAgents.length}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Activity className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">System operational</span>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
