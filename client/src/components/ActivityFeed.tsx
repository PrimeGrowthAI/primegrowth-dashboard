/**
 * ActivityFeed — real-time stream of bridge events.
 * Shows tool calls, agent output, session starts/ends, approvals.
 * Compact, terminal-style log with color-coded event types.
 */

import { useRef, useEffect, useState } from "react";
import { useBridge, ActivityEvent } from "@/contexts/BridgeContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Terminal,
  FileEdit,
  CheckCircle2,
  XCircle,
  Play,
  Square,
  Wifi,
  AlertTriangle,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

// ─── Event styling ────────────────────────────────────────────────────────────

const EVENT_CONFIG: Record<string, {
  icon: React.ReactNode;
  color: string;
  label: string;
}> = {
  bridge_connected:  { icon: <Wifi className="w-3 h-3" />,         color: "text-emerald-400", label: "Connected" },
  session_start:     { icon: <Play className="w-3 h-3" />,          color: "text-blue-400",    label: "Session Start" },
  session_end:       { icon: <Square className="w-3 h-3" />,        color: "text-muted-foreground", label: "Session End" },
  session_error:     { icon: <XCircle className="w-3 h-3" />,       color: "text-red-400",     label: "Session Error" },
  tool_pending:      { icon: <Terminal className="w-3 h-3" />,      color: "text-amber-400",   label: "Tool Pending" },
  tool_allowed:      { icon: <CheckCircle2 className="w-3 h-3" />,  color: "text-emerald-400", label: "Allowed" },
  tool_denied:       { icon: <XCircle className="w-3 h-3" />,       color: "text-red-400",     label: "Denied" },
  tool_completed:    { icon: <CheckCircle2 className="w-3 h-3" />,  color: "text-emerald-400/70", label: "Completed" },
  approval_required: { icon: <AlertTriangle className="w-3 h-3" />, color: "text-amber-400",   label: "Approval" },
  claude_text:       { icon: <Terminal className="w-3 h-3" />,      color: "text-foreground/60", label: "Output" },
  claude_event:      { icon: <Terminal className="w-3 h-3" />,      color: "text-foreground/50", label: "Event" },
  claude_stderr:     { icon: <AlertTriangle className="w-3 h-3" />, color: "text-red-400/70",  label: "Stderr" },
  agent_stopped:     { icon: <Square className="w-3 h-3" />,        color: "text-muted-foreground", label: "Stopped" },
};

const DEFAULT_CONFIG = {
  icon: <Terminal className="w-3 h-3" />,
  color: "text-muted-foreground",
  label: "Event",
};

// ─── Event row ────────────────────────────────────────────────────────────────

function EventRow({ event }: { event: ActivityEvent }) {
  const [expanded, setExpanded] = useState(false);
  const config = EVENT_CONFIG[event.type] || DEFAULT_CONFIG;

  const getSummary = () => {
    switch (event.type) {
      case "session_start":
        return `${event.agent ? `@${event.agent}` : "claude"} — ${String(event.prompt || "").slice(0, 80)}`;
      case "session_end":
        return `exit ${event.exitCode ?? "?"}`;
      case "tool_pending":
      case "tool_allowed":
      case "tool_denied":
      case "tool_completed": {
        const tool = event.tool || "?";
        const input = event.input as Record<string, unknown> | undefined;
        if (tool === "Bash" && input?.command) {
          return `${tool}: ${String(input.command).slice(0, 80)}`;
        }
        if ((tool === "Write" || tool === "Edit") && input?.file_path) {
          return `${tool}: ${String(input.file_path)}`;
        }
        return tool;
      }
      case "claude_text":
        return String(event.text || "").slice(0, 120);
      case "claude_stderr":
        return String(event.text || "").slice(0, 120);
      case "approval_required":
        return `${event.tool} — awaiting decision`;
      case "bridge_connected":
        return "Bridge connected";
      default:
        return event.type;
    }
  };

  const hasDetail = ["tool_pending", "tool_allowed", "tool_denied", "tool_completed", "claude_event"].includes(event.type);

  return (
    <div
      className={cn(
        "px-3 py-1.5 border-b border-border/30 hover:bg-white/[0.02] transition-colors",
        hasDetail && "cursor-pointer"
      )}
      onClick={() => hasDetail && setExpanded(v => !v)}
    >
      <div className="flex items-start gap-2 min-w-0">
        {/* Icon */}
        <span className={cn("mt-0.5 shrink-0", config.color)}>
          {config.icon}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn("text-xs font-mono truncate flex-1", config.color)}>
              {getSummary()}
            </span>
            <span className="text-[10px] text-muted-foreground/50 shrink-0 tabular-nums">
              {formatDistanceToNow(new Date(event.ts), { addSuffix: true })}
            </span>
            {hasDetail && (
              <ChevronDown
                className={cn(
                  "w-3 h-3 text-muted-foreground/50 shrink-0 transition-transform",
                  expanded && "rotate-180"
                )}
              />
            )}
          </div>

          {/* Session ID */}
          {event.sessionId && (
            <span className="text-[10px] text-muted-foreground/40 font-mono">
              {String(event.sessionId).slice(0, 8)}
            </span>
          )}

          {/* Expanded detail */}
          {expanded && (
            <pre className="mt-1.5 text-[10px] text-foreground/60 bg-background/50 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all font-mono border border-border/30">
              {JSON.stringify(
                event.type === "claude_event" ? event.event : event.input,
                null,
                2
              ).slice(0, 1000)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ActivityFeed({ maxHeight = "400px" }: { maxHeight?: string }) {
  const { feed, clearFeed } = useBridge();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [feed, autoScroll]);

  if (feed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/50 gap-2">
        <Terminal className="w-8 h-8" />
        <p className="text-xs">No activity yet. Run an agent to see live output here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ maxHeight }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/50">
        <span className="text-xs text-muted-foreground">
          {feed.length} events
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(v => !v)}
            className={cn(
              "text-[10px] px-2 py-0.5 rounded border transition-colors",
              autoScroll
                ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                : "border-border text-muted-foreground"
            )}
          >
            Auto-scroll {autoScroll ? "on" : "off"}
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={clearFeed}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Feed */}
      <ScrollArea style={{ maxHeight: `calc(${maxHeight} - 36px)` }}>
        <div className="flex flex-col-reverse">
          {feed.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </div>
        <div ref={bottomRef} />
      </ScrollArea>
    </div>
  );
}
