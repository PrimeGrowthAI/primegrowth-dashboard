/**
 * ApprovalQueue — shows pending tool-use approvals as urgent cards.
 * Each card has a countdown timer and Allow/Deny buttons.
 * Auto-denies on timeout (handled by bridge, but we show countdown here).
 */

import { useEffect, useState } from "react";
import { useBridge, PendingApproval } from "@/contexts/BridgeContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Terminal, FileEdit, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const TOOL_ICONS: Record<string, React.ReactNode> = {
  Bash: <Terminal className="w-4 h-4" />,
  Write: <FileEdit className="w-4 h-4" />,
  Edit: <FileEdit className="w-4 h-4" />,
  MultiEdit: <FileEdit className="w-4 h-4" />,
};

const TOOL_COLORS: Record<string, string> = {
  Bash: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  Write: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  Edit: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  MultiEdit: "text-blue-400 bg-blue-400/10 border-blue-400/30",
};

function ApprovalCard({ approval }: { approval: PendingApproval }) {
  const { approve } = useBridge();
  const [secondsLeft, setSecondsLeft] = useState(
    Math.ceil((approval.timeoutMs - (Date.now() - approval.receivedAt)) / 1000)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.ceil(
        (approval.timeoutMs - (Date.now() - approval.receivedAt)) / 1000
      );
      setSecondsLeft(Math.max(0, remaining));
    }, 500);
    return () => clearInterval(interval);
  }, [approval.timeoutMs, approval.receivedAt]);

  const urgency = secondsLeft < 10 ? "critical" : secondsLeft < 20 ? "warning" : "normal";

  // Format the tool input for display
  const getInputDisplay = () => {
    if (approval.tool === "Bash" && approval.input?.command) {
      return String(approval.input.command).slice(0, 200);
    }
    if ((approval.tool === "Write" || approval.tool === "Edit") && approval.input?.file_path) {
      return String(approval.input.file_path);
    }
    return JSON.stringify(approval.input, null, 2).slice(0, 300);
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-4 space-y-3 transition-all",
        urgency === "critical"
          ? "border-red-500/50 bg-red-500/5 animate-pulse"
          : urgency === "warning"
          ? "border-amber-500/40 bg-amber-500/5"
          : "border-border bg-card"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle
            className={cn(
              "w-4 h-4",
              urgency === "critical" ? "text-red-400" : "text-amber-400"
            )}
          />
          <span className="text-sm font-semibold text-foreground">
            Approval Required
          </span>
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-mono",
              TOOL_COLORS[approval.tool] || "text-muted-foreground border-border"
            )}
          >
            {TOOL_ICONS[approval.tool] || null}
            <span className="ml-1">{approval.tool}</span>
          </Badge>
        </div>
        <span
          className={cn(
            "text-xs font-mono tabular-nums",
            urgency === "critical" ? "text-red-400" : "text-muted-foreground"
          )}
        >
          {secondsLeft}s
        </span>
      </div>

      {/* Session context */}
      <p className="text-xs text-muted-foreground font-mono truncate">
        Session: {approval.sessionId.slice(0, 8)}...
      </p>

      {/* Command/input preview */}
      <pre className="text-xs text-foreground/80 bg-background/50 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all font-mono border border-border/50">
        {getInputDisplay()}
      </pre>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => approve(approval.approvalId, "allow")}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white h-8 text-xs"
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
          Allow
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => approve(approval.approvalId, "deny")}
          className="flex-1 border-red-500/40 text-red-400 hover:bg-red-500/10 h-8 text-xs"
        >
          <XCircle className="w-3.5 h-3.5 mr-1.5" />
          Deny
        </Button>
      </div>
    </div>
  );
}

export default function ApprovalQueue() {
  const { pendingApprovals } = useBridge();

  if (pendingApprovals.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-foreground">
          Pending Approvals
          <span className="ml-2 text-xs font-normal text-amber-400">
            ({pendingApprovals.length})
          </span>
        </h3>
      </div>
      {pendingApprovals.map((approval) => (
        <ApprovalCard key={approval.approvalId} approval={approval} />
      ))}
    </div>
  );
}
