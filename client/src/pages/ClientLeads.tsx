// PrimeGrowth AI — Client Demo: Leads & Pipeline View
// Designed for screenshots, reels, and Meta ads

import DashboardLayout from "@/components/DashboardLayout";
import { cn } from "@/lib/utils";
import { Phone, MessageSquare, Star, ArrowRight, Clock, DollarSign, TrendingUp, Zap } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string;
  source: string;
  stage: "Nouveau" | "Contacté" | "Soumission envoyée" | "Gagné" | "Perdu";
  value: string;
  type: string;
  city: string;
  receivedAt: string;
  nextAction: string;
  hot: boolean;
  autoHandled: boolean;
  note: string;
}

const LEADS: Lead[] = [
  {
    id: "l1",
    name: "Pascal Fontaine",
    phone: "514-882-4421",
    source: "Google Ads",
    stage: "Nouveau",
    value: "~$2,800",
    type: "Salle de bain complète",
    city: "Laval",
    receivedAt: "Aujourd'hui 8:14",
    nextAction: "Réponse automatique envoyée — en attente de confirmation",
    hot: true,
    autoHandled: true,
    note: "Demande reçue via formulaire. Réponse auto envoyée en 90 secondes.",
  },
  {
    id: "l2",
    name: "Isabelle Côté",
    phone: "450-771-3302",
    source: "Référence",
    stage: "Contacté",
    value: "~$4,100",
    type: "Plancher cuisine + couloir",
    city: "Brossard",
    receivedAt: "Hier 17:30",
    nextAction: "Appel de qualification prévu demain 10h",
    hot: true,
    autoHandled: false,
    note: "Référée par Tremblay. Budget confirmé. Prête à aller vite.",
  },
  {
    id: "l3",
    name: "Robert Simard",
    phone: "514-553-9910",
    source: "Instagram",
    stage: "Soumission envoyée",
    value: "$3,450",
    type: "Entrée + escalier",
    city: "Montréal",
    receivedAt: "Lun 20 avr.",
    nextAction: "Relance automatique prévue dans 2 jours",
    hot: false,
    autoHandled: true,
    note: "Soumission envoyée. Système de relance activé automatiquement.",
  },
  {
    id: "l4",
    name: "Marie-Ève Dion",
    phone: "438-224-7761",
    source: "Google Ads",
    stage: "Gagné",
    value: "$2,200",
    type: "Salle de bain principale",
    city: "Longueuil",
    receivedAt: "Ven 18 avr.",
    nextAction: "Planifier chantier — début mai",
    hot: false,
    autoHandled: true,
    note: "Dépôt reçu. Chantier confirmé pour début mai.",
  },
  {
    id: "l5",
    name: "Éric Beauchamp",
    phone: "514-339-4482",
    source: "Facebook",
    stage: "Contacté",
    value: "~$5,800",
    type: "Sous-sol complet",
    city: "Saint-Laurent",
    receivedAt: "Jeu 17 avr.",
    nextAction: "Visite de mesure prévue ven 25 avr.",
    hot: false,
    autoHandled: false,
    note: "Grand projet. Visite de mesure confirmée.",
  },
];

const STAGE_CONFIG: Record<Lead["stage"], { color: string; dot: string }> = {
  "Nouveau": { color: "text-sky-400 bg-sky-400/10 border-sky-400/20", dot: "bg-sky-400" },
  "Contacté": { color: "text-blue-400 bg-blue-400/10 border-blue-400/20", dot: "bg-blue-400" },
  "Soumission envoyée": { color: "text-amber-400 bg-amber-400/10 border-amber-400/20", dot: "bg-amber-400" },
  "Gagné": { color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", dot: "bg-emerald-400" },
  "Perdu": { color: "text-red-400 bg-red-400/10 border-red-400/20", dot: "bg-red-400" },
};

const SOURCE_CONFIG: Record<string, string> = {
  "Google Ads": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "Référence": "text-violet-400 bg-violet-400/10 border-violet-400/20",
  "Instagram": "text-pink-400 bg-pink-400/10 border-pink-400/20",
  "Facebook": "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
};

export default function ClientLeads() {
  const newLeads = LEADS.filter((l) => l.stage === "Nouveau" || l.stage === "Contacté").length;
  const wonLeads = LEADS.filter((l) => l.stage === "Gagné").length;
  const autoHandled = LEADS.filter((l) => l.autoHandled).length;
  const pipelineValue = 18350;

  return (
    <DashboardLayout>
      <div className="px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              Pipeline de Leads
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Synchronisé avec GoHighLevel — réponses automatiques activées
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-violet-400 bg-violet-400/10 border border-violet-400/20 px-3 py-1.5 rounded-full">
            <Zap className="w-3 h-3" />
            Automatisation active
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Nouveaux leads (7j)", value: newLeads + 3, sub: "3 via Google Ads", color: "text-sky-400", bg: "bg-sky-400/10" },
            { label: "Pipeline total", value: `$${pipelineValue.toLocaleString()}`, sub: "5 opportunités actives", color: "text-emerald-400", bg: "bg-emerald-400/10" },
            { label: "Gérés auto (IA)", value: `${autoHandled}/${LEADS.length}`, sub: "Réponse < 2 min", color: "text-violet-400", bg: "bg-violet-400/10" },
            { label: "Taux de conversion", value: "38%", sub: "vs 22% avant système", color: "text-amber-400", bg: "bg-amber-400/10" },
          ].map(({ label, value, sub, color, bg }) => (
            <div key={label} className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
              <p className={cn("text-xl font-bold", color)} style={{ fontFamily: "'Syne', sans-serif" }}>{value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Stage funnel */}
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
            Entonnoir de conversion
          </h3>
          <div className="flex items-end gap-2">
            {[
              { stage: "Nouveau", count: 3, pct: 100, color: "bg-sky-400/70" },
              { stage: "Contacté", count: 2, pct: 67, color: "bg-blue-400/70" },
              { stage: "Soumission", count: 1, pct: 33, color: "bg-amber-400/70" },
              { stage: "Gagné", count: 1, pct: 33, color: "bg-emerald-400/70" },
            ].map(({ stage, count, pct, color }) => (
              <div key={stage} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-foreground">{count}</span>
                <div className="w-full rounded-t-md" style={{ height: `${pct * 0.8}px` }}>
                  <div className={cn("w-full h-full rounded-t-md", color)} />
                </div>
                <span className="text-[10px] text-muted-foreground text-center leading-tight">{stage}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lead cards */}
        <div className="space-y-3">
          {LEADS.map((lead) => {
            const stageCfg = STAGE_CONFIG[lead.stage];
            return (
              <div
                key={lead.id}
                className={cn(
                  "rounded-xl border bg-card p-4 transition-all",
                  lead.hot ? "border-amber-400/30 shadow-[0_0_20px_rgba(251,191,36,0.07)]" : "border-border/60"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                    {lead.name.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground">{lead.name}</span>
                      {lead.hot && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/20 font-medium flex items-center gap-1">
                          <Star className="w-2 h-2" /> CHAUD
                        </span>
                      )}
                      {lead.autoHandled && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-400/15 text-violet-400 border border-violet-400/20 font-medium flex items-center gap-1">
                          <Zap className="w-2 h-2" /> AUTO
                        </span>
                      )}
                      <span className={cn("text-[10px] px-2 py-0.5 rounded border font-medium", stageCfg.color)}>
                        {lead.stage}
                      </span>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded border font-medium", SOURCE_CONFIG[lead.source] || "text-slate-400 bg-slate-400/10 border-slate-400/20")}>
                        {lead.source}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">{lead.type} — {lead.city}</span>
                      <span className="text-xs font-semibold text-emerald-400">{lead.value}</span>
                    </div>

                    <p className="text-xs text-muted-foreground/70 mt-1.5 leading-relaxed">{lead.note}</p>

                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground">
                      <ArrowRight className="w-3 h-3 text-primary/60" />
                      <span>{lead.nextAction}</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 space-y-2">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground justify-end">
                      <Clock className="w-3 h-3" />
                      {lead.receivedAt}
                    </div>
                    <div className="flex gap-1.5 justify-end">
                      <button className="w-7 h-7 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center hover:bg-emerald-400/20 transition-colors">
                        <Phone className="w-3 h-3 text-emerald-400" />
                      </button>
                      <button className="w-7 h-7 rounded-lg bg-blue-400/10 border border-blue-400/20 flex items-center justify-center hover:bg-blue-400/20 transition-colors">
                        <MessageSquare className="w-3 h-3 text-blue-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </DashboardLayout>
  );
}
