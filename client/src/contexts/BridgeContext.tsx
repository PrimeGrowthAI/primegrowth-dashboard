/**
 * BridgeContext — manages WebSocket connection to the local bridge server.
 *
 * Design philosophy: Brutalist SaaS — raw, functional, no decoration.
 * This context is the nervous system of the live dashboard.
 *
 * Features:
 *   - Auto-connects when bridge URL + token are set
 *   - Reconnects with exponential backoff (max 30s)
 *   - Maintains activity feed (last 200 events)
 *   - Manages pending approval queue
 *   - Exposes runAgent() to trigger Claude Code sessions
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BridgeStatus = "disconnected" | "connecting" | "connected" | "error";

export interface ActivityEvent {
  id: string;
  ts: string;
  type: string;
  sessionId?: string;
  agent?: string;
  tool?: string;
  input?: Record<string, unknown>;
  text?: string;
  exitCode?: number;
  error?: string;
  auto?: boolean;
  reason?: string;
  [key: string]: unknown;
}

export interface PendingApproval {
  approvalId: string;
  sessionId: string;
  tool: string;
  input: Record<string, unknown>;
  timeoutMs: number;
  receivedAt: number;
}

export interface ActiveSession {
  sessionId: string;
  agent?: string;
  prompt: string;
  startedAt: string;
}

interface BridgeConfig {
  url: string;   // e.g. "http://127.0.0.1:7432" or "https://your-tunnel.trycloudflare.com"
  token: string;
}

interface BridgeContextValue {
  status: BridgeStatus;
  config: BridgeConfig | null;
  setConfig: (config: BridgeConfig) => void;
  clearConfig: () => void;
  feed: ActivityEvent[];
  clearFeed: () => void;
  pendingApprovals: PendingApproval[];
  activeSessions: ActiveSession[];
  runAgent: (params: {
    prompt: string;
    agent?: string;
    allowedTools?: string[];
  }) => Promise<{ sessionId: string }>;
  stopSession: (sessionId: string) => Promise<void>;
  approve: (approvalId: string, decision: "allow" | "deny") => void;
  bridgeHealth: BridgeHealth | null;
}

interface BridgeHealth {
  status: string;
  version: string;
  sessions: number;
  clients: number;
  pendingApprovals: number;
  uptime: number;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const STORAGE_KEY_URL = "pg_bridge_url";
const STORAGE_KEY_TOKEN = "pg_bridge_token";

// ─── Context ──────────────────────────────────────────────────────────────────

const BridgeContext = createContext<BridgeContextValue | null>(null);

export function BridgeProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<BridgeStatus>("disconnected");
  const [config, setConfigState] = useState<BridgeConfig | null>(() => {
    const url = localStorage.getItem(STORAGE_KEY_URL);
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (url && token) return { url, token };
    return null;
  });
  const [feed, setFeed] = useState<ActivityEvent[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [bridgeHealth, setBridgeHealth] = useState<BridgeHealth | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef(1000);
  const mountedRef = useRef(true);

  // ── Config management ──────────────────────────────────────────────────────

  const setConfig = useCallback((newConfig: BridgeConfig) => {
    localStorage.setItem(STORAGE_KEY_URL, newConfig.url);
    localStorage.setItem(STORAGE_KEY_TOKEN, newConfig.token);
    setConfigState(newConfig);
  }, []);

  const clearConfig = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    setConfigState(null);
    wsRef.current?.close();
  }, []);

  // ── Feed management ────────────────────────────────────────────────────────

  const addToFeed = useCallback((event: Omit<ActivityEvent, "id">) => {
    const entry: ActivityEvent = {
      ts: new Date().toISOString(),
      type: 'unknown',
      ...event,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    setFeed(prev => [entry, ...prev].slice(0, 200));
    return entry;
  }, []);

  const clearFeed = useCallback(() => setFeed([]), []);

  // ── WebSocket connection ───────────────────────────────────────────────────

  const connect = useCallback(() => {
    if (!config || !mountedRef.current) return;

    const wsUrl = config.url
      .replace(/^http:/, "ws:")
      .replace(/^https:/, "wss:")
      + `?token=${encodeURIComponent(config.token)}`;

    setStatus("connecting");
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      reconnectDelayRef.current = 1000;
      setStatus("connected");
      addToFeed({ type: "bridge_connected", ts: new Date().toISOString() });
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const msg = JSON.parse(event.data);
        handleMessage(msg);
      } catch (_) {}
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setStatus("disconnected");
      wsRef.current = null;
      scheduleReconnect();
    };

    ws.onerror = () => {
      if (!mountedRef.current) return;
      setStatus("error");
    };
  }, [config]); // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleReconnect = useCallback(() => {
    if (!mountedRef.current || !config) return;
    const delay = Math.min(reconnectDelayRef.current, 30000);
    reconnectDelayRef.current = Math.min(delay * 2, 30000);
    reconnectTimerRef.current = setTimeout(() => {
      if (mountedRef.current) connect();
    }, delay);
  }, [config, connect]);

  // ── Message handler ────────────────────────────────────────────────────────

  const handleMessage = useCallback((msg: Record<string, unknown>) => {
    const type = msg.type as string;

    // Always add to feed
    addToFeed(msg as Omit<ActivityEvent, "id">);

    switch (type) {
      case "connected":
        // Sync initial state from bridge
        if (Array.isArray(msg.activeSessions)) {
          setActiveSessions((msg.activeSessions as Array<{sessionId: string; agent?: string; prompt: string; startedAt?: string}>).map(s => ({
            sessionId: s.sessionId,
            agent: s.agent,
            prompt: s.prompt,
            startedAt: s.startedAt || new Date().toISOString(),
          })));
        }
        break;

      case "session_start":
        setActiveSessions(prev => [
          ...prev,
          {
            sessionId: msg.sessionId as string,
            agent: msg.agent as string | undefined,
            prompt: msg.prompt as string,
            startedAt: msg.ts as string,
          },
        ]);
        break;

      case "session_end":
      case "session_error":
        setActiveSessions(prev =>
          prev.filter(s => s.sessionId !== msg.sessionId)
        );
        break;

      case "approval_required":
        setPendingApprovals(prev => [
          ...prev,
          {
            approvalId: msg.approvalId as string,
            sessionId: msg.sessionId as string,
            tool: msg.tool as string,
            input: (msg.input || {}) as Record<string, unknown>,
            timeoutMs: (msg.timeoutMs as number) || 30000,
            receivedAt: Date.now(),
          },
        ]);
        break;

      case "tool_allowed":
      case "tool_denied":
        if (msg.approvalId) {
          setPendingApprovals(prev =>
            prev.filter(a => a.approvalId !== msg.approvalId)
          );
        }
        break;
    }
  }, [addToFeed]);

  // ── Connect/disconnect on config change ───────────────────────────────────

  useEffect(() => {
    if (config) {
      connect();
    } else {
      wsRef.current?.close();
      setStatus("disconnected");
    }

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, [config]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Health polling ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!config) return;

    const poll = async () => {
      try {
        const res = await fetch(`${config.url}/health`);
        if (res.ok) {
          const data = await res.json();
          setBridgeHealth(data);
        }
      } catch (_) {
        setBridgeHealth(null);
      }
    };

    poll();
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, [config]);

  // ── Cleanup ────────────────────────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, []);

  // ── API methods ────────────────────────────────────────────────────────────

  const runAgent = useCallback(async (params: {
    prompt: string;
    agent?: string;
    allowedTools?: string[];
  }): Promise<{ sessionId: string }> => {
    if (!config) throw new Error("Bridge not configured");

    const res = await fetch(`${config.url}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.token}`,
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || "Failed to start agent");
    }

    return res.json();
  }, [config]);

  const stopSession = useCallback(async (sessionId: string) => {
    if (!config) return;

    await fetch(`${config.url}/stop/${sessionId}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${config.token}` },
    });
  }, [config]);

  const approve = useCallback((approvalId: string, decision: "allow" | "deny") => {
    // Send via WebSocket for lower latency
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "approve", approvalId, decision }));
    } else if (config) {
      // Fallback to HTTP
      fetch(`${config.url}/approve/${approvalId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.token}`,
        },
        body: JSON.stringify({ decision }),
      }).catch(() => {});
    }

    // Optimistically remove from pending
    setPendingApprovals(prev => prev.filter(a => a.approvalId !== approvalId));
  }, [config]);

  return (
    <BridgeContext.Provider value={{
      status,
      config,
      setConfig,
      clearConfig,
      feed,
      clearFeed,
      pendingApprovals,
      activeSessions,
      runAgent,
      stopSession,
      approve,
      bridgeHealth,
    }}>
      {children}
    </BridgeContext.Provider>
  );
}

export function useBridge() {
  const ctx = useContext(BridgeContext);
  if (!ctx) throw new Error("useBridge must be used within BridgeProvider");
  return ctx;
}
