import { Switch, Route } from "wouter";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { BridgeProvider } from "@/contexts/BridgeContext";
import Dashboard from "@/pages/Dashboard";
import AgentDetail from "@/pages/AgentDetail";
import Pipeline from "@/pages/Pipeline";
import Commands from "@/pages/Commands";
import BridgePanel from "@/pages/BridgePanel";
import ClientDispatch from "@/pages/ClientDispatch";
import ClientMargins from "@/pages/ClientMargins";
import ClientLeads from "@/pages/ClientLeads";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="primegrowth-theme">
      <BridgeProvider>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/agent/:id" component={AgentDetail} />
          <Route path="/pipeline" component={Pipeline} />
          <Route path="/bridge" component={BridgePanel} />
          <Route path="/commands" component={Commands} />
          {/* Client-facing demo screens */}
          <Route path="/demo/dispatch" component={ClientDispatch} />
          <Route path="/demo/marges" component={ClientMargins} />
          <Route path="/demo/leads" component={ClientLeads} />
        </Switch>
        <Toaster richColors position="bottom-right" />
      </BridgeProvider>
    </ThemeProvider>
  );
}
