/**
 * BridgeSetup — modal for configuring the local bridge connection.
 * Shown when no bridge config is stored, or when user clicks "Configure Bridge".
 */

import { useState } from "react";
import { useBridge } from "@/contexts/BridgeContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wifi, WifiOff, Loader2, Shield, ExternalLink } from "lucide-react";

interface BridgeSetupProps {
  open: boolean;
  onClose: () => void;
}

export default function BridgeSetup({ open, onClose }: BridgeSetupProps) {
  const { setConfig, status } = useBridge();
  const [url, setUrl] = useState("http://127.0.0.1:7432");
  const [token, setToken] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "error" | null>(null);
  const [testError, setTestError] = useState("");

  const testConnection = async () => {
    if (!url || !token) return;
    setTesting(true);
    setTestResult(null);
    setTestError("");

    try {
      const res = await fetch(`${url}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        setTestResult("ok");
      } else {
        setTestResult("error");
        setTestError(`HTTP ${res.status}`);
      }
    } catch (err) {
      setTestResult("error");
      setTestError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (!url || !token) return;
    setConfig({ url: url.replace(/\/$/, ""), token });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
            <Shield className="w-5 h-5 text-emerald-400" />
            Connect Local Bridge
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Connect to the bridge server running on your Mac to run agents from this dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Bridge URL */}
          <div className="space-y-1.5">
            <Label htmlFor="bridge-url" className="text-sm text-foreground">
              Bridge URL
            </Label>
            <Input
              id="bridge-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://127.0.0.1:7432"
              className="font-mono text-sm bg-background border-border"
            />
            <p className="text-xs text-muted-foreground">
              Local: <code className="text-emerald-400">http://127.0.0.1:7432</code> — or your Cloudflare tunnel URL for remote access.
            </p>
          </div>

          {/* Auth token */}
          <div className="space-y-1.5">
            <Label htmlFor="bridge-token" className="text-sm text-foreground">
              Auth Token
            </Label>
            <Input
              id="bridge-token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Your BRIDGE_TOKEN from .env"
              className="font-mono text-sm bg-background border-border"
            />
            <p className="text-xs text-muted-foreground">
              The <code className="text-amber-400">BRIDGE_TOKEN</code> value from your bridge <code>.env</code> file.
            </p>
          </div>

          {/* Test result */}
          {testResult === "ok" && (
            <Alert className="border-emerald-500/30 bg-emerald-500/10">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <AlertDescription className="text-emerald-300 text-sm">
                Bridge reachable. Click Save to connect.
              </AlertDescription>
            </Alert>
          )}
          {testResult === "error" && (
            <Alert className="border-red-500/30 bg-red-500/10">
              <WifiOff className="w-4 h-4 text-red-400" />
              <AlertDescription className="text-red-300 text-sm">
                Cannot reach bridge: {testError}. Make sure the bridge server is running on your Mac.
              </AlertDescription>
            </Alert>
          )}

          {/* Security note */}
          <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300 space-y-1">
            <p className="font-semibold">Security notes:</p>
            <ul className="space-y-0.5 text-amber-300/80 list-disc list-inside">
              <li>Bridge binds to 127.0.0.1 only — not exposed on your network</li>
              <li>All requests require Bearer token authentication</li>
              <li>Destructive actions require your approval before execution</li>
              <li>For remote access, use a Cloudflare tunnel (see setup guide)</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              onClick={testConnection}
              disabled={!url || !token || testing}
              className="flex-1 border-border"
            >
              {testing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Wifi className="w-4 h-4 mr-2" />
              )}
              Test Connection
            </Button>
            <Button
              onClick={handleSave}
              disabled={!url || !token}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Save & Connect
            </Button>
          </div>

          <a
            href="https://github.com/PrimeGrowthAI/primegrowth-system/blob/main/docs/claude-code-setup/bridge-setup-guide.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Bridge setup guide
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
