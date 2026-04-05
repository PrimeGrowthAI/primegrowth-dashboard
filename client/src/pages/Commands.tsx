// PrimeGrowth AI — Agent Command Center
// Commands: slash command reference and MCP server status

import DashboardLayout from "@/components/DashboardLayout";
import { SLASH_COMMANDS, AGENTS } from "@/lib/agents";
import { cn } from "@/lib/utils";
import { Terminal, Zap, CheckCircle2, XCircle, Clock, Copy } from "lucide-react";
import { toast } from "sonner";

const MCP_SERVERS = [
  {
    id: "n8n-mcp",
    name: "n8n MCP",
    repo: "czlonkowski/n8n-mcp",
    status: "pending",
    description: "Control n8n workflows directly from Claude Code. Create, execute, and debug automations.",
    agentsUsing: AGENTS.filter((a) => a.mcpRequired?.includes("n8n-mcp")).length,
  },
  {
    id: "ghl-mcp",
    name: "GHL MCP",
    repo: "tenfoldmarc/ghl-mcp",
    status: "pending",
    description: "Full GoHighLevel CRM access. Manage contacts, pipelines, sub-accounts, and workflows.",
    agentsUsing: AGENTS.filter((a) => a.mcpRequired?.includes("ghl-mcp")).length,
  },
  {
    id: "gamma-mcp",
    name: "Gamma MCP",
    repo: "gamma-app/gamma-mcp",
    status: "pending",
    description: "Generate Gamma slide decks from deal files. Produces live Gamma links.",
    agentsUsing: AGENTS.filter((a) => a.mcpRequired?.includes("gamma-mcp")).length,
  },
  {
    id: "voicemode",
    name: "VoiceMode",
    repo: "mbailey/voicemode",
    status: "pending",
    description: "Voice interface for Claude Code. Speak to agents, agents speak back via ElevenLabs.",
    agentsUsing: 0,
  },
  {
    id: "clickup-mcp",
    name: "ClickUp MCP",
    repo: "clickup/mcp-server",
    status: "pending",
    description: "Manage ClickUp workspaces, tasks, and automations for client project management.",
    agentsUsing: AGENTS.filter((a) => a.mcpRequired?.includes("clickup-mcp")).length,
  },
];

const STATUS_CONFIG = {
  active: { label: "Active", icon: CheckCircle2, class: "text-emerald-400" },
  pending: { label: "Not installed", icon: Clock, class: "text-amber-400" },
  error: { label: "Error", icon: XCircle, class: "text-red-400" },
};

const COMMAND_DETAILS: Record<string, { steps: string[]; agents: string[] }> = {
  "/daily-briefing": {
    steps: [
      "Orchestrator loads pipeline from GHL",
      "Sales Pipeline Manager flags overdue follow-ups",
      "Infrastructure Monitor checks n8n + Railway health",
      "Memory Keeper loads yesterday's session state",
      "Outputs: priority list, blocked deals, action items",
    ],
    agents: ["orchestrator", "sales-pipeline-manager", "infrastructure-monitor", "memory-keeper"],
  },
  "/new-deal": {
    steps: [
      "Prompts for client name, company, pain points",
      "Lead Researcher enriches with company data",
      "Creates deal file in /deals/active/",
      "Adds contact to GHL pipeline",
      "Schedules call prep reminder",
    ],
    agents: ["lead-researcher", "ghl-manager", "call-prep-analyst"],
  },
  "/post-call": {
    steps: [
      "Prompts for Fireflies transcript link or paste",
      "Call Transcription Analyst extracts key quotes",
      "Updates deal file with client language",
      "Drafts follow-up email",
      "Flags next action in pipeline",
    ],
    agents: ["call-transcription-analyst", "ghl-manager", "cold-email-architect"],
  },
  "/build-system": {
    steps: [
      "Loads client deal file and requirements",
      "n8n Architect designs workflow architecture",
      "n8n Builder implements and deploys to Railway",
      "GHL Manager configures CRM side",
      "Documentation Engineer writes client SOP",
    ],
    agents: ["n8n-architect", "n8n-builder", "ghl-manager", "documentation-engineer"],
  },
  "/weekly-review": {
    steps: [
      "Financial Analyst pulls revenue metrics",
      "Sales Pipeline Manager reviews conversion rates",
      "Client Success checks health scores",
      "Self-Improvement Loop identifies automation gaps",
      "Outputs: weekly report + next week priorities",
    ],
    agents: ["financial-analyst", "sales-pipeline-manager", "client-success", "self-improvement-loop"],
  },
  "/commit-memory": {
    steps: [
      "Memory Keeper summarizes session",
      "GitHub Archivist commits all changes",
      "Updates shared-knowledge.md with new patterns",
      "Syncs to Hindsight memory system",
    ],
    agents: ["memory-keeper", "github-archivist"],
  },
};

export default function Commands() {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <DashboardLayout>
      <div className="px-6 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1
            className="text-2xl font-bold text-foreground tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Slash Commands & MCP Servers
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Reference for all Claude Code slash commands and MCP server setup
          </p>
        </div>

        {/* Slash Commands */}
        <div>
          <h2
            className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            <Terminal className="w-4 h-4 text-primary" />
            Slash Commands ({SLASH_COMMANDS.length})
          </h2>
          <div className="space-y-3">
            {SLASH_COMMANDS.map((cmd) => {
              const details = COMMAND_DETAILS[cmd.command];
              return (
                <div
                  key={cmd.command}
                  className="rounded-xl border border-border/60 bg-card overflow-hidden"
                >
                  <div className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <code
                        className="text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20"
                      >
                        {cmd.command}
                      </code>
                      <span className="text-sm text-muted-foreground">{cmd.description}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(cmd.command)}
                      className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {details && (
                    <div className="px-4 pb-3 border-t border-border/40 pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Steps</p>
                        <ol className="space-y-1">
                          {details.steps.map((step, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex gap-2">
                              <span className="text-primary/60 flex-shrink-0">{i + 1}.</span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Agents Involved</p>
                        <div className="flex flex-wrap gap-1.5">
                          {details.agents.map((agentId) => (
                            <span
                              key={agentId}
                              className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary/80 border border-primary/20 font-mono"
                            >
                              {agentId}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* MCP Servers */}
        <div>
          <h2
            className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            MCP Servers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MCP_SERVERS.map((server) => {
              const status = STATUS_CONFIG[server.status as keyof typeof STATUS_CONFIG];
              const StatusIcon = status.icon;
              return (
                <div
                  key={server.id}
                  className="rounded-xl border border-border/60 bg-card p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {server.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono">{server.repo}</p>
                    </div>
                    <div className={cn("flex items-center gap-1.5 text-[10px] font-medium", status.class)}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{server.description}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-border/40">
                    <span className="text-[10px] text-muted-foreground">
                      {server.agentsUsing} agent{server.agentsUsing !== 1 ? "s" : ""} require this
                    </span>
                    <button
                      onClick={() => handleCopy(`npx @modelcontextprotocol/install ${server.repo}`)}
                      className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      Copy install
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Setup instructions */}
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-5">
          <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            <Terminal className="w-4 h-4" />
            Quick Setup: Claude Code + Agents
          </h3>
          <div className="space-y-2">
            {[
              "npm install -g @anthropic-ai/claude-code",
              "cd ~/primegrowth-system && bash docs/claude-code-setup/install-agents.sh",
              "claude  # opens Claude Code in current directory",
              "/daily-briefing  # run your first briefing",
            ].map((cmd, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[10px] text-amber-400/60 w-4 flex-shrink-0">{i + 1}.</span>
                <div className="flex-1 flex items-center justify-between gap-2 bg-black/30 rounded-lg px-3 py-1.5 border border-border/40">
                  <code className="text-xs text-foreground/80 font-mono">{cmd}</code>
                  <button
                    onClick={() => handleCopy(cmd)}
                    className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
