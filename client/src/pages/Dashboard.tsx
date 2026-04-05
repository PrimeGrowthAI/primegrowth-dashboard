// PrimeGrowth AI — Agent Command Center
// Dashboard: main overview with stats, filters, and agent grid

import { useState, useMemo } from "react";
import { useSearch } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import AgentCard from "@/components/AgentCard";
import {
  AGENTS,
  DEPARTMENTS,
  Department,
  getActiveAgents,
  getTotalTasksCompleted,
} from "@/lib/agents";
import { cn } from "@/lib/utils";
import { Search, Filter, Zap, CheckCircle2, Activity, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";

const PIPELINE_DATA = [
  { name: "Maxime Labreque", company: "Surface Bros", stage: "Proposal Call", date: "Apr 8", value: "$4,800", hot: true },
  { name: "Mathis Charrois", company: "Céramique DMC", stage: "Proposal Call", date: "Apr 7", value: "$3,600", hot: true },
  { name: "Julien Duchesne", company: "Coffrage Beaver", stage: "Discovery", date: "TBD", value: "~$5,200", hot: false },
  { name: "Team Herr", company: "Real Estate", stage: "Active Deal", date: "Ongoing", value: "$6,000", hot: false },
];

const STAGE_COLORS: Record<string, string> = {
  "Proposal Call": "text-amber-400 bg-amber-400/10 border-amber-400/20",
  "Discovery": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "Active Deal": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

export default function Dashboard() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialDept = params.get("dept") as Department | null;

  const [query, setQuery] = useState("");
  const [activeDept, setActiveDept] = useState<Department | "all">(initialDept || "all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "idle" | "future">("all");

  const activeAgents = getActiveAgents();
  const totalTasks = getTotalTasksCompleted();

  const filtered = useMemo(() => {
    return AGENTS.filter((a) => {
      const matchesDept = activeDept === "all" || a.department === activeDept;
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      const matchesQuery =
        !query ||
        a.displayName.toLowerCase().includes(query.toLowerCase()) ||
        a.description.toLowerCase().includes(query.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));
      return matchesDept && matchesStatus && matchesQuery;
    });
  }, [activeDept, statusFilter, query]);

  const deptOptions = [
    { value: "all" as const, label: "All Agents" },
    ...Object.entries(DEPARTMENTS).map(([key, info]) => ({
      value: key as Department,
      label: info.label,
    })),
  ];

  return (
    <DashboardLayout>
      <div className="px-6 py-6 space-y-6">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-bold text-foreground tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Agent Command Center
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {AGENTS.length} agents deployed — {activeAgents.length} currently active
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>Apr 5, 2026</p>
            <p className="text-emerald-400 font-medium">System Operational</p>
          </div>
        </div>

        {/* ── Stats row ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "Total Agents",
              value: AGENTS.length,
              icon: Zap,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Active Now",
              value: activeAgents.length,
              icon: Activity,
              color: "text-emerald-400",
              bg: "bg-emerald-400/10",
            },
            {
              label: "Tasks Completed",
              value: totalTasks,
              icon: CheckCircle2,
              color: "text-amber-400",
              bg: "bg-amber-400/10",
            },
            {
              label: "Pipeline Deals",
              value: PIPELINE_DATA.length,
              icon: TrendingUp,
              color: "text-violet-400",
              bg: "bg-violet-400/10",
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="rounded-xl border border-border/60 bg-card p-4 flex items-center gap-3"
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", bg)}>
                <Icon className={cn("w-4 h-4", color)} />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
                <p
                  className={cn("text-xl font-bold", color)}
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Active pipeline snapshot ──────────────────────────────────── */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
              Active Pipeline
            </h2>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
              {PIPELINE_DATA.length} deals
            </span>
          </div>
          <div className="divide-y divide-border/40">
            {PIPELINE_DATA.map((deal) => (
              <div key={deal.name} className="px-4 py-3 flex items-center gap-4 hover:bg-white/3 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{deal.name}</span>
                    {deal.hot && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/20 font-medium">
                        HOT
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{deal.company}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span className={cn("text-[10px] px-2 py-1 rounded border font-medium", STAGE_COLORS[deal.stage] || "text-muted-foreground bg-white/5 border-border/40")}>
                    {deal.stage}
                  </span>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-foreground">{deal.value}</p>
                    <p className="text-[10px] text-muted-foreground">{deal.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Filters ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8 h-8 text-sm bg-card border-border/60 focus:border-primary/50"
            />
          </div>

          {/* Department tabs */}
          <div className="flex gap-1 flex-wrap">
            {deptOptions.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setActiveDept(value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  activeDept === value
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex gap-1">
            {(["all", "active", "idle", "future"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all",
                  statusFilter === s
                    ? "bg-white/10 text-foreground border border-border"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Agent grid ───────────────────────────────────────────────── */}
        <div>
          <p className="text-xs text-muted-foreground mb-3">
            Showing {filtered.length} of {AGENTS.length} agents
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No agents match your filters</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
