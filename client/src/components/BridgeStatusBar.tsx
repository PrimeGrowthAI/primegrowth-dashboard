/**
 * BridgeStatusBar — compact status indicator for the top nav.
 * Shows connection status, active sessions count, and pending approvals.
 * Clicking opens the bridge panel.
 */

import { useBridge } from "@/contexts/BridgeContext";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff, Loader2, AlertTriangle } from "lucide-react";

interface BridgeStatusBarProps {
  onClick?: () => void;
}

export default function BridgeStatusBar({ onClick }: BridgeStatusBarProps) {
  const { status, activeSessions, pendingApprovals, bridgeHealth } = useBridge();

  const statusConfig = {
    connected: {
      icon: <Wifi className="w-3.5 h-3.5" />,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10 border-emerald-400/20",
      label: "Bridge",
    },
    connecting: {
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
      color: "text-amber-400",
      bg: "bg-amber-400/10 border-amber-400/20",
      label: "Connecting",
    },
    disconnected: {
      icon: <WifiOff className="w-3.5 h-3.5" />,
      color: "text-muted-foreground",
      bg: "bg-muted/20 border-border",
      label: "Bridge",
    },
    error: {
      icon: <WifiOff className="w-3.5 h-3.5" />,
      color: "text-red-400",
      bg: "bg-red-400/10 border-red-400/20",
      label: "Error",
    },
  };

  const cfg = statusConfig[status];

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-all hover:opacity-80",
        cfg.bg,
        cfg.color
      )}
    >
      {cfg.icon}
      <span>{cfg.label}</span>

      {/* Active sessions indicator */}
      {status === "connected" && activeSessions.length > 0 && (
        <span className="flex items-center gap-1 ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300">{activeSessions.length}</span>
        </span>
      )}

      {/* Pending approvals badge */}
      {pendingApprovals.length > 0 && (
        <span className="flex items-center gap-1 ml-1 text-amber-400">
          <AlertTriangle className="w-3 h-3" />
          <span>{pendingApprovals.length}</span>
        </span>
      )}
    </button>
  );
}
