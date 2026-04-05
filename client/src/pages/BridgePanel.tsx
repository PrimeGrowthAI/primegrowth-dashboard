/**
 * BridgePanel — full-page view for the local bridge.
 * Combines: connection setup, agent runner, approval queue, activity feed.
 *
 * Design: Brutalist SaaS — functional panels, no decoration.
 * Layout: 3-column on wide screens, stacked on mobile.
 */

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useBridge } from "@/contexts/BridgeContext";
import BridgeSetup from "@/components/BridgeSetup";
import ApprovalQueue from "@/components/ApprovalQueue";
import ActivityFeed from "@/components/ActivityFeed";
import AgentRunner from "@/components/AgentRunner";
import BridgeStatusBar from "@/components/BridgeStatusBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wifi,
  WifiOff,
  Settings,
  Activity,
  Zap,
  Shield,
  Clock,
  Server,
} from "lucide-react";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  icon,
  color = "text-foreground",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <span className="w-4 h-4">{icon}</span>
        <span className="text-xs">{label}</span>
      </div>
      <p className={cn("text-xl font-bold tabular-nums", color)}>{value}</p>
    </div>
  );
}

export default function BridgePanel() {
  const { status, config, clearConfig, activeSessions, pendingApprovals, bridgeHealth, feed } = useBridge();
  const [setupOpen, setSetupOpen] = useState(!config);

  const isConnected = status === "connected";

  return (
    <DashboardLayout>
      <div className="px-6 py-6 space-y-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-bold text-foreground tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Local Bridge
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Run Claude Code agents directly from this dashboard
            </p>
          </div>
          <div className="flex items-center gap-2">
            <BridgeStatusBar onClick={() => setSetupOpen(true)} />
            {config && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSetupOpen(true)}
                className="h-7 text-xs border-border"
              >
                <Settings className="w-3.5 h-3.5 mr-1.5" />
                Configure
              </Button>
            )}
          </div>
        </div>

        {/* ── Connection banner ───────────────────────────────────────────── */}
        {!config && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center space-y-3">
            <WifiOff className="w-10 h-10 text-muted-foreground/50 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-foreground">Bridge not configured</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start the bridge server on your Mac, then connect it here.
              </p>
            </div>
            <Button
              onClick={() => setSetupOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Wifi className="w-4 h-4 mr-2" />
              Connect Bridge
            </Button>
          </div>
        )}

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        {config && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Status"
              value={status === "connected" ? "Live" : status === "connecting" ? "..." : "Offline"}
              icon={<Wifi className="w-4 h-4" />}
              color={isConnected ? "text-emerald-400" : "text-muted-foreground"}
            />
            <StatCard
              label="Active Sessions"
              value={activeSessions.length}
              icon={<Activity className="w-4 h-4" />}
              color={activeSessions.length > 0 ? "text-blue-400" : "text-foreground"}
            />
            <StatCard
              label="Pending Approvals"
              value={pendingApprovals.length}
              icon={<Shield className="w-4 h-4" />}
              color={pendingApprovals.length > 0 ? "text-amber-400" : "text-foreground"}
            />
            <StatCard
              label="Uptime"
              value={bridgeHealth ? `${Math.floor(bridgeHealth.uptime / 60)}m` : "—"}
              icon={<Clock className="w-4 h-4" />}
            />
          </div>
        )}

        {/* ── Main panels ─────────────────────────────────────────────────── */}
        {config && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Left: Agent Runner + Approvals */}
            <div className="lg:col-span-1 space-y-4">

              {/* Approval queue — shown prominently when there are pending approvals */}
              {pendingApprovals.length > 0 && (
                <div className="rounded-lg border border-amber-500/30 bg-card p-4">
                  <ApprovalQueue />
                </div>
              )}

              {/* Agent runner */}
              <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Run Agent
                  </h2>
                </div>
                <AgentRunner />
              </div>

              {/* Bridge info */}
              <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Bridge Info
                  </h2>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">URL</span>
                    <span className="font-mono text-foreground/80 truncate max-w-[160px]">
                      {config.url}
                    </span>
                  </div>
                  {bridgeHealth && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Version</span>
                        <span className="font-mono text-foreground/80">{bridgeHealth.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Clients</span>
                        <span className="font-mono text-foreground/80">{bridgeHealth.clients}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Auth</span>
                    <span className="text-emerald-400">Bearer token ✓</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearConfig}
                  className="w-full h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-2"
                >
                  Disconnect
                </Button>
              </div>
            </div>

            {/* Right: Activity feed */}
            <div className="lg:col-span-2 rounded-lg border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Live Activity Feed
                </h2>
                {feed.length > 0 && (
                  <Badge variant="outline" className="ml-auto text-xs border-border text-muted-foreground">
                    {feed.length}
                  </Badge>
                )}
              </div>
              <ActivityFeed maxHeight="600px" />
            </div>
          </div>
        )}
      </div>

      {/* Setup modal */}
      <BridgeSetup open={setupOpen} onClose={() => setSetupOpen(false)} />
    </DashboardLayout>
  );
}
