// PrimeGrowth AI — Agent Command Center
// Pipeline: full deal pipeline view with stage tracking

import DashboardLayout from "@/components/DashboardLayout";
import { cn } from "@/lib/utils";
import { TrendingUp, Calendar, DollarSign, User, ArrowRight, Clock } from "lucide-react";

interface Deal {
  id: string;
  name: string;
  company: string;
  stage: string;
  stageOrder: number;
  value: string;
  nextAction: string;
  nextDate: string;
  notes: string;
  hot: boolean;
  agentAssigned: string;
}

const DEALS: Deal[] = [
  {
    id: "mathis",
    name: "Mathis Charrois",
    company: "Céramique DMC",
    stage: "Proposal Call",
    stageOrder: 3,
    value: "$3,600",
    nextAction: "Proposal call — present 3-tier offer",
    nextDate: "Apr 7",
    notes: "Tile subcontractor. Pain: quoting takes 3h per job. ICP fit: high.",
    hot: true,
    agentAssigned: "proposal-architect",
  },
  {
    id: "maxime",
    name: "Maxime Labreque",
    company: "Surface Bros",
    stage: "Proposal Call",
    stageOrder: 3,
    value: "$4,800",
    nextAction: "Proposal call — ROI-focused close",
    nextDate: "Apr 8",
    notes: "Flooring contractor. Pain: follow-up leakage. Warm from referral.",
    hot: true,
    agentAssigned: "deal-closer",
  },
  {
    id: "julien",
    name: "Julien Duchesne",
    company: "Coffrage Beaver",
    stage: "Discovery",
    stageOrder: 2,
    value: "~$5,200",
    nextAction: "Send discovery questions, book call",
    nextDate: "TBD",
    notes: "Concrete forming. Larger operation. Needs full audit first.",
    hot: false,
    agentAssigned: "call-prep-analyst",
  },
  {
    id: "herr",
    name: "Team Herr",
    company: "Real Estate",
    stage: "Active Deal",
    stageOrder: 4,
    value: "$6,000",
    nextAction: "Deliver n8n workflow milestone 2",
    nextDate: "Apr 10",
    notes: "Real estate automation. Active build. On track.",
    hot: false,
    agentAssigned: "n8n-builder",
  },
];

const STAGES = [
  { name: "Prospecting", order: 1, color: "border-slate-400/30 bg-slate-400/5" },
  { name: "Discovery", order: 2, color: "border-blue-400/30 bg-blue-400/5" },
  { name: "Proposal Call", order: 3, color: "border-amber-400/30 bg-amber-400/5" },
  { name: "Active Deal", order: 4, color: "border-emerald-400/30 bg-emerald-400/5" },
  { name: "Closed Won", order: 5, color: "border-violet-400/30 bg-violet-400/5" },
];

const STAGE_BADGE: Record<string, string> = {
  "Prospecting": "text-slate-400 bg-slate-400/10 border-slate-400/20",
  "Discovery": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "Proposal Call": "text-amber-400 bg-amber-400/10 border-amber-400/20",
  "Active Deal": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  "Closed Won": "text-violet-400 bg-violet-400/10 border-violet-400/20",
};

export default function Pipeline() {
  const totalValue = DEALS.reduce((sum, d) => {
    const num = parseFloat(d.value.replace(/[^0-9.]/g, ""));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  return (
    <DashboardLayout>
      <div className="px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-bold text-foreground tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Sales Pipeline
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {DEALS.length} active deals — ${totalValue.toLocaleString()} pipeline value
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border/60 bg-card p-4">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Pipeline Value</p>
            <p className="text-xl font-bold text-amber-400" style={{ fontFamily: "'Syne', sans-serif" }}>
              ${totalValue.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-4">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Hot Deals</p>
            <p className="text-xl font-bold text-red-400" style={{ fontFamily: "'Syne', sans-serif" }}>
              {DEALS.filter((d) => d.hot).length}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-4">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Next 7 Days</p>
            <p className="text-xl font-bold text-emerald-400" style={{ fontFamily: "'Syne', sans-serif" }}>
              {DEALS.filter((d) => d.nextDate !== "TBD" && d.nextDate !== "Ongoing").length}
            </p>
          </div>
        </div>

        {/* Kanban-style stage view */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-3 min-w-max">
            {STAGES.map((stage) => {
              const stageDeals = DEALS.filter((d) => d.stageOrder === stage.order);
              return (
                <div
                  key={stage.name}
                  className={cn(
                    "w-[280px] rounded-xl border p-3 flex flex-col gap-2",
                    stage.color
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground/80">{stage.name}</span>
                    <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
                      {stageDeals.length}
                    </span>
                  </div>
                  {stageDeals.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground/40 text-xs">
                      Empty
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="rounded-lg border border-border/60 bg-card p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-foreground">{deal.name}</p>
                              {deal.hot && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/20 font-medium">
                                  HOT
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground">{deal.company}</p>
                          </div>
                          <span className="text-sm font-bold text-emerald-400 flex-shrink-0">
                            {deal.value}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                          {deal.notes}
                        </p>
                        <div className="pt-1 border-t border-border/40">
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <ArrowRight className="w-3 h-3 text-primary" />
                            <span className="text-foreground/70">{deal.nextAction}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {deal.nextDate}
                            </div>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/80 border border-primary/20">
                              {deal.agentAssigned}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Deal list */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border/60">
            <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
              All Deals
            </h2>
          </div>
          <div className="divide-y divide-border/40">
            {DEALS.sort((a, b) => b.stageOrder - a.stageOrder).map((deal) => (
              <div key={deal.id} className="px-4 py-4 hover:bg-white/3 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-foreground">{deal.name}</span>
                      <span className="text-xs text-muted-foreground">— {deal.company}</span>
                      {deal.hot && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/20 font-medium">
                          HOT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{deal.notes}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded border font-medium", STAGE_BADGE[deal.stage])}>
                        {deal.stage}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" /> {deal.nextAction}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {deal.nextDate}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-emerald-400">{deal.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{deal.agentAssigned}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
