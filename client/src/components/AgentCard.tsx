// PrimeGrowth AI — Agent Command Center
// AgentCard: compact card for agent grid

import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Agent, DEPARTMENTS } from "@/lib/agents";
import { Cpu, Clock, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

const STATUS_CONFIG = {
  active: {
    label: "Active",
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    ring: "ring-emerald-400/20",
    pulse: true,
  },
  idle: {
    label: "Idle",
    dot: "bg-slate-500",
    text: "text-slate-400",
    ring: "ring-transparent",
    pulse: false,
  },
  error: {
    label: "Error",
    dot: "bg-red-400",
    text: "text-red-400",
    ring: "ring-red-400/20",
    pulse: false,
  },
  future: {
    label: "Future",
    dot: "bg-violet-400/50",
    text: "text-violet-400/60",
    ring: "ring-transparent",
    pulse: false,
  },
};

const MODEL_BADGE = {
  opus: { label: "Opus", class: "bg-violet-400/10 text-violet-400 border-violet-400/20" },
  sonnet: { label: "Sonnet", class: "bg-blue-400/10 text-blue-400 border-blue-400/20" },
};

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const status = STATUS_CONFIG[agent.status];
  const dept = DEPARTMENTS[agent.department];
  const model = MODEL_BADGE[agent.model];

  return (
    <Link href={`/agent/${agent.id}`}>
      <div
        className={cn(
          "group relative rounded-xl border border-border/60 bg-card p-4",
          "hover:border-primary/30 hover:bg-card/80 transition-all duration-200 cursor-pointer",
          agent.status === "active" && "border-emerald-400/20 bg-emerald-400/3",
          agent.status === "future" && "opacity-60"
        )}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {/* Status dot */}
            <span className="relative flex-shrink-0">
              {status.pulse ? (
                <span className="relative flex h-2 w-2">
                  <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", status.dot)} />
                  <span className={cn("relative inline-flex rounded-full h-2 w-2", status.dot)} />
                </span>
              ) : (
                <span className={cn("inline-flex rounded-full h-2 w-2", status.dot)} />
              )}
            </span>
            <span
              className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {agent.displayName}
            </span>
          </div>

          {/* Model badge */}
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded border flex-shrink-0 font-medium", model.class)}>
            {model.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
          {agent.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", dept.bgColor, dept.color)}>
              {dept.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            {agent.tasksCompleted > 0 && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {agent.tasksCompleted}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {agent.lastActivity}
            </span>
          </div>
        </div>

        {/* MCP indicators */}
        {agent.mcpRequired && agent.mcpRequired.length > 0 && (
          <div className="mt-2 flex gap-1 flex-wrap">
            {agent.mcpRequired.map((mcp) => (
              <span key={mcp} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground border border-border/40">
                {mcp}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
