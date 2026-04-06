/**
 * ActivityFeed — real-time stream of bridge events.
 * Shows tool calls, agent output, session starts/ends, approvals.
 *
 * Design: Brutalist SaaS — functional panels, no decoration.
 * Key feature: claude_event result type renders as clean formatted markdown,
 * not raw JSON. Session results are displayed prominently at the top.
 */

import { useRef, useEffect, useState } from "react";
import { useBridge, ActivityEvent } from "@/contexts/BridgeContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
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
  Copy,
  Check,
  FileText,
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

// ─── Extract result text from a claude_event ──────────────────────────────────

function extractResultText(event: ActivityEvent): string | null {
  const e = event.event as Record<string, unknown> | undefined;
  if (!e) return null;

  // type: "result" with subtype: "success"
  if (e.type === "result" && e.subtype === "success") {
    const result = e.result as string | undefined;
    if (result) return result;
  }

  // type: "assistant" with message content
  if (e.type === "assistant") {
    const msg = e.message as Record<string, unknown> | undefined;
    if (msg) {
      const content = msg.content as Array<{type: string; text?: string}> | undefined;
      if (Array.isArray(content)) {
        const texts = content
          .filter(c => c.type === "text" && c.text)
          .map(c => c.text as string);
        if (texts.length > 0) return texts.join("\n");
      }
    }
  }

  return null;
}

// ─── Session Result Panel ─────────────────────────────────────────────────────

function SessionResultPanel({ events }: { events: ActivityEvent[] }) {
  const [copied, setCopied] = useState(false);

  // Find the last result event
  const resultEvent = [...events].find(e => {
    if (e.type !== "claude_event") return false;
    const ev = e.event as Record<string, unknown> | undefined;
    return ev?.type === "result" && ev?.subtype === "success";
  });

  if (!resultEvent) return null;

  const resultText = extractResultText(resultEvent);
  if (!resultText) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-emerald-500/20 bg-emerald-500/10">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400">Agent Result</span>
          <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400/70 bg-transparent">
            {formatDistanceToNow(new Date(resultEvent.ts), { addSuffix: true })}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 px-2 text-xs text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/10"
        >
          {copied ? (
            <><Check className="w-3 h-3 mr-1" />Copied</>
          ) : (
            <><Copy className="w-3 h-3 mr-1" />Copy</>
          )}
        </Button>
      </div>

      {/* Content — rendered as markdown */}
      <ScrollArea className="max-h-[400px]">
        <div className="px-4 py-3 prose prose-invert prose-sm max-w-none
          prose-headings:text-foreground prose-headings:font-semibold prose-headings:font-mono
          prose-h1:text-base prose-h2:text-sm prose-h3:text-xs
          prose-p:text-foreground/80 prose-p:leading-relaxed prose-p:text-xs
          prose-strong:text-foreground prose-strong:font-semibold
          prose-code:text-emerald-300 prose-code:bg-emerald-500/10 prose-code:px-1 prose-code:rounded prose-code:text-[11px]
          prose-pre:bg-background/80 prose-pre:border prose-pre:border-border/30 prose-pre:text-xs
          prose-ul:text-foreground/80 prose-ul:text-xs prose-li:text-xs
          prose-ol:text-foreground/80 prose-ol:text-xs
          [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          <ReactMarkdown>{resultText}</ReactMarkdown>
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Event row ────────────────────────────────────────────────────────────────

function EventRow({ event }: { event: ActivityEvent }) {
  const [expanded, setExpanded] = useState(false);
  const config = EVENT_CONFIG[event.type] || DEFAULT_CONFIG;

  // For claude_event, check if it's a result type — show differently
  const isResult = event.type === "claude_event" && (() => {
    const e = event.event as Record<string, unknown> | undefined;
    return e?.type === "result";
  })();

  const isAssistantText = event.type === "claude_event" && (() => {
    const e = event.event as Record<string, unknown> | undefined;
    return e?.type === "assistant";
  })();

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
      case "claude_event": {
        if (isResult) {
          const e = event.event as Record<string, unknown> | undefined;
          const subtype = e?.subtype as string | undefined;
          return `result: ${subtype || "?"}`;
        }
        if (isAssistantText) {
          const resultText = extractResultText(event);
          if (resultText) return resultText.slice(0, 100);
        }
        return event.type;
      }
      default:
        return event.type;
    }
  };

  const hasDetail = ["tool_pending", "tool_allowed", "tool_denied", "tool_completed", "claude_event"].includes(event.type);

  // Result events get special styling
  const rowColor = isResult
    ? "text-emerald-400"
    : isAssistantText
    ? "text-foreground/70"
    : config.color;

  return (
    <div
      className={cn(
        "px-3 py-1.5 border-b border-border/30 hover:bg-white/[0.02] transition-colors",
        hasDetail && "cursor-pointer",
        isResult && "bg-emerald-500/5 border-emerald-500/20"
      )}
      onClick={() => hasDetail && setExpanded(v => !v)}
    >
      <div className="flex items-start gap-2 min-w-0">
        {/* Icon */}
        <span className={cn("mt-0.5 shrink-0", rowColor)}>
          {isResult ? <CheckCircle2 className="w-3 h-3" /> : config.icon}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn("text-xs font-mono truncate flex-1", rowColor)}>
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
            <div className="mt-1.5">
              {isResult || isAssistantText ? (
                // Render as markdown for result/assistant events
                <div className="text-[11px] text-foreground/70 bg-background/50 rounded p-2 border border-border/30
                  prose prose-invert prose-xs max-w-none
                  [&_h1]:text-xs [&_h1]:font-semibold [&_h1]:text-foreground [&_h1]:mb-1
                  [&_h2]:text-xs [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mb-1
                  [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mb-0.5
                  [&_p]:text-[11px] [&_p]:leading-relaxed [&_p]:mb-1
                  [&_strong]:text-foreground [&_strong]:font-semibold
                  [&_code]:text-emerald-300 [&_code]:bg-emerald-500/10 [&_code]:px-0.5 [&_code]:rounded [&_code]:text-[10px]
                  [&_ul]:text-[11px] [&_li]:text-[11px] [&_ol]:text-[11px]">
                  <ReactMarkdown>{extractResultText(event) || ""}</ReactMarkdown>
                </div>
              ) : (
                // Raw JSON for tool events
                <pre className="text-[10px] text-foreground/60 bg-background/50 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all font-mono border border-border/30">
                  {JSON.stringify(
                    event.type === "claude_event" ? event.event : event.input,
                    null,
                    2
                  ).slice(0, 1000)}
                </pre>
              )}
            </div>
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

  // Check if there's a completed session result to show prominently
  const hasResult = feed.some(e => {
    if (e.type !== "claude_event") return false;
    const ev = e.event as Record<string, unknown> | undefined;
    return ev?.type === "result" && ev?.subtype === "success";
  });

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

      <ScrollArea style={{ maxHeight: `calc(${maxHeight} - 36px)` }}>
        {/* Session result panel — shown at top when a result is available */}
        {hasResult && (
          <div className="p-3 border-b border-border/50">
            <SessionResultPanel events={feed} />
          </div>
        )}

        {/* Feed — newest at top */}
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
