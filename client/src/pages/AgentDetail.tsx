// PrimeGrowth AI — Agent Command Center
// AgentDetail: full agent profile with description, tags, MCP requirements, and chat interface

import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { AGENTS, DEPARTMENTS } from "@/lib/agents";
import { cn } from "@/lib/utils";
import { ArrowLeft, Send, Cpu, Tag, Zap, Clock, CheckCircle2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Message {
  role: "user" | "agent";
  content: string;
  timestamp: string;
}

const MODEL_BADGE = {
  opus: { label: "Claude Opus", class: "bg-violet-400/10 text-violet-400 border-violet-400/20" },
  sonnet: { label: "Claude Sonnet", class: "bg-blue-400/10 text-blue-400 border-blue-400/20" },
};

const STATUS_CONFIG = {
  active: { label: "Active", class: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  idle: { label: "Idle", class: "text-slate-400 bg-slate-400/10 border-slate-400/20" },
  error: { label: "Error", class: "text-red-400 bg-red-400/10 border-red-400/20" },
  future: { label: "Future State", class: "text-violet-400/60 bg-violet-400/10 border-violet-400/20" },
};

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const agent = AGENTS.find((a) => a.id === id);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!agent) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Agent not found.
        </div>
      </DashboardLayout>
    );
  }

  const dept = DEPARTMENTS[agent.department];
  const model = MODEL_BADGE[agent.model];
  const status = STATUS_CONFIG[agent.status];

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate agent response (UI demo — real calls go through Claude Code)
    setTimeout(() => {
      const agentMsg: Message = {
        role: "agent",
        content: `This is a UI demo. To actually interact with ${agent.displayName}, open Claude Code and type: /agent ${agent.name}\n\nIn production, this panel will connect to the Claude Code API and route your message directly to this agent.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, agentMsg]);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* ── Left: Agent info ──────────────────────────────────────────── */}
        <div className="w-[340px] flex-shrink-0 border-r border-border/60 flex flex-col overflow-y-auto">
          {/* Back */}
          <div className="px-5 py-4 border-b border-border/60">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              All Agents
            </button>
          </div>

          {/* Agent header */}
          <div className="px-5 py-5 border-b border-border/60">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
                <Cpu className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={cn("text-[10px] px-2 py-0.5 rounded border font-medium", model.class)}>
                  {model.label}
                </span>
                <span className={cn("text-[10px] px-2 py-0.5 rounded border font-medium", status.class)}>
                  {status.label}
                </span>
              </div>
            </div>
            <h1
              className="text-lg font-bold text-foreground tracking-tight mb-1"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {agent.displayName}
            </h1>
            <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", dept.bgColor, dept.color)}>
              {dept.label}
            </span>
          </div>

          {/* Description */}
          <div className="px-5 py-4 border-b border-border/60">
            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Role</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">{agent.description}</p>
          </div>

          {/* Stats */}
          <div className="px-5 py-4 border-b border-border/60 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Tasks Done</p>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-sm font-semibold text-foreground">{agent.tasksCompleted}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Last Active</p>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">{agent.lastActivity}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="px-5 py-4 border-b border-border/60">
            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
              <Tag className="w-3 h-3" /> Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {agent.tags.map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-muted-foreground border border-border/40">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* MCP */}
          {agent.mcpRequired && agent.mcpRequired.length > 0 && (
            <div className="px-5 py-4 border-b border-border/60">
              <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                <Zap className="w-3 h-3" /> MCP Required
              </h3>
              <div className="space-y-1">
                {agent.mcpRequired.map((mcp) => (
                  <div key={mcp} className="flex items-center gap-2 text-xs text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {mcp}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How to invoke */}
          <div className="px-5 py-4">
            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Invoke in Claude Code</h3>
            <div className="rounded-lg bg-black/40 border border-border/40 px-3 py-2 font-mono text-xs text-primary">
              /agent {agent.name}
            </div>
          </div>
        </div>

        {/* ── Right: Chat panel ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="px-5 py-4 border-b border-border/60 flex items-center gap-3">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">Chat with {agent.displayName}</p>
              <p className="text-[10px] text-muted-foreground">
                UI demo — real interactions happen in Claude Code
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-16">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Cpu className="w-6 h-6 text-primary/60" />
                </div>
                <p className="text-sm font-medium text-foreground/60 mb-1">{agent.displayName} is ready</p>
                <p className="text-xs max-w-xs">
                  Send a message to see how this agent responds. For production use, invoke via Claude Code.
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "agent" && (
                  <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Cpu className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-xl px-4 py-2.5 text-sm",
                    msg.role === "user"
                      ? "bg-primary/20 text-foreground border border-primary/30"
                      : "bg-card border border-border/60 text-foreground/90"
                  )}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{msg.timestamp}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-border/60">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${agent.displayName}...`}
                className="flex-1 bg-card border-border/60 focus:border-primary/50 text-sm"
                disabled={agent.status === "future"}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || agent.status === "future"}
                size="sm"
                className="bg-primary hover:bg-primary/90 px-3"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {agent.status === "future" && (
              <p className="text-[10px] text-muted-foreground mt-1.5">
                This agent is not yet activated. Set up the required MCP server first.
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
