/**
 * AgentRunner — panel for running agents directly from the dashboard.
 * Lets you select an agent, type a prompt, and fire it via the bridge.
 * Shows active sessions with stop buttons.
 */

import { useState } from "react";
import { useBridge } from "@/contexts/BridgeContext";
import { AGENTS } from "@/lib/agents";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Loader2, Zap, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Tool presets for different agent types
const TOOL_PRESETS: Record<string, string[]> = {
  "read-only": ["Read", "Bash(git status *)", "Bash(git log *)", "Bash(git diff *)"],
  "standard": ["Read", "Bash", "Write", "Edit"],
  "full": ["Read", "Write", "Edit", "MultiEdit", "Bash"],
};

export default function AgentRunner() {
  const { status, runAgent, stopSession, activeSessions } = useBridge();
  const [selectedAgent, setSelectedAgent] = useState<string>("dispatcher");
  const [prompt, setPrompt] = useState("");
  const [toolPreset, setToolPreset] = useState<keyof typeof TOOL_PRESETS>("read-only");
  const [running, setRunning] = useState(false);

  const isConnected = status === "connected";

  const handleRun = async () => {
    if (!prompt.trim() || !isConnected) return;

    setRunning(true);
    try {
      const { sessionId } = await runAgent({
        prompt: prompt.trim(),
        agent: selectedAgent,
        allowedTools: TOOL_PRESETS[toolPreset],
      });
      toast.success(`Agent started`, {
        description: `Session ${sessionId.slice(0, 8)} — ${selectedAgent}`,
      });
      setPrompt("");
    } catch (err) {
      toast.error("Failed to start agent", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setRunning(false);
    }
  };

  const handleStop = async (sessionId: string) => {
    try {
      await stopSession(sessionId);
      toast.info("Session stopped");
    } catch (_) {
      toast.error("Failed to stop session");
    }
  };

  return (
    <div className="space-y-4">
      {/* Active sessions */}
      {activeSessions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Active Sessions ({activeSessions.length})
          </p>
          {activeSessions.map((session) => (
            <div
              key={session.sessionId}
              className="flex items-center gap-2 p-2 rounded-md border border-emerald-500/20 bg-emerald-500/5"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-emerald-300 truncate">
                  {session.agent ? `@${session.agent}` : "claude"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {session.prompt?.slice(0, 60)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
                onClick={() => handleStop(session.sessionId)}
              >
                <Square className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Not connected notice */}
      {!isConnected && (
        <div className="flex items-center gap-2 p-3 rounded-md border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Bridge not connected. Configure it above to run agents.</span>
        </div>
      )}

      {/* Agent selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Agent
        </label>
        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
          <SelectTrigger className="bg-background border-border text-sm h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border max-h-64">
            {AGENTS.map((agent) => (
              <SelectItem key={agent.id} value={agent.id} className="text-sm">
                <span className="font-mono text-xs text-muted-foreground mr-2">
                  @{agent.id}
                </span>
                {agent.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tool permissions */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Tool Permissions
        </label>
        <div className="flex gap-2">
          {(Object.keys(TOOL_PRESETS) as Array<keyof typeof TOOL_PRESETS>).map((preset) => (
            <button
              key={preset}
              onClick={() => setToolPreset(preset)}
              className={cn(
                "text-xs px-2.5 py-1 rounded border transition-colors capitalize",
                toolPreset === preset
                  ? preset === "full"
                    ? "border-red-500/40 text-red-400 bg-red-500/10"
                    : preset === "standard"
                    ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                    : "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                  : "border-border text-muted-foreground hover:border-border/80"
              )}
            >
              {preset}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">
          {toolPreset === "read-only" && "Safe: read files and git commands only"}
          {toolPreset === "standard" && "Standard: read + write files + bash commands (requires approval)"}
          {toolPreset === "full" && "Full access: all tools (use with caution)"}
        </p>
      </div>

      {/* Prompt */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Prompt
        </label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What should the agent do? e.g. 'Prep call notes for Maxime Labreque at Surface Bros, proposal call April 8'"
          className="bg-background border-border text-sm resize-none min-h-[80px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleRun();
            }
          }}
        />
        <p className="text-[10px] text-muted-foreground">
          ⌘+Enter to run
        </p>
      </div>

      {/* Run button */}
      <Button
        onClick={handleRun}
        disabled={!prompt.trim() || !isConnected || running}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-9"
      >
        {running ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Starting...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 mr-2" />
            Run Agent
          </>
        )}
      </Button>
    </div>
  );
}
