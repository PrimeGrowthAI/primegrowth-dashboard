// PrimeGrowth AI — Client Demo: Margins & Finances View
// Designed for screenshots, reels, and Meta ads

import DashboardLayout from "@/components/DashboardLayout";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { TrendingUp, DollarSign, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const JOBS = [
  { name: "Résidence Tremblay", type: "Céramique", quote: 3200, labour: 640, materials: 480, margin: 65, status: "active", invoiceStatus: "À facturer" },
  { name: "Condo Beaumont", type: "Salle de bain", quote: 2850, labour: 570, materials: 390, margin: 66, status: "active", invoiceStatus: "À facturer" },
  { name: "Bureau Côte-Vertu", type: "Commercial", quote: 6100, labour: 1100, materials: 820, margin: 69, status: "upcoming", invoiceStatus: "—" },
  { name: "Résidence Gagnon", type: "Cuisine", quote: 2400, labour: 480, materials: 310, margin: 67, status: "upcoming", invoiceStatus: "—" },
  { name: "Clinique Laval", type: "Plancher", quote: 4800, labour: 960, materials: 620, margin: 67, status: "completed", invoiceStatus: "Payée ✓" },
  { name: "Résidence Fortin", type: "Sous-sol", quote: 3600, labour: 720, materials: 490, margin: 66, status: "completed", invoiceStatus: "Envoyée" },
  { name: "Condo Griffintown", type: "Céramique", quote: 5200, labour: 1040, materials: 710, margin: 66, status: "completed", invoiceStatus: "Payée ✓" },
];

const MONTHLY_DATA = [
  { month: "Nov", revenue: 18400, costs: 6200, margin: 66 },
  { month: "Déc", revenue: 14200, costs: 5100, margin: 64 },
  { month: "Jan", revenue: 21000, costs: 7100, margin: 66 },
  { month: "Fév", revenue: 19800, costs: 6600, margin: 67 },
  { month: "Mar", revenue: 26400, costs: 8700, margin: 67 },
  { month: "Avr", revenue: 24350, costs: 8020, margin: 67 },
];

const INVOICE_CONFIG: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  "Payée ✓": { color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 },
  "Envoyée": { color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: Clock },
  "À facturer": { color: "text-amber-400 bg-amber-400/10 border-amber-400/20", icon: AlertCircle },
  "—": { color: "text-slate-400/60 bg-slate-400/5 border-slate-400/10", icon: Clock },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border/60 rounded-lg px-3 py-2 text-xs shadow-xl">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: ${p.value?.toLocaleString()}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ClientMargins() {
  const completedJobs = JOBS.filter((j) => j.status === "completed");
  const activeJobs = JOBS.filter((j) => j.status === "active" || j.status === "upcoming");
  const totalRevenue = JOBS.reduce((s, j) => s + j.quote, 0);
  const totalCosts = JOBS.reduce((s, j) => s + j.labour + j.materials, 0);
  const avgMargin = Math.round(JOBS.reduce((s, j) => s + j.margin, 0) / JOBS.length);
  const pendingInvoices = JOBS.filter((j) => j.invoiceStatus === "À facturer" || j.invoiceStatus === "Envoyée").reduce((s, j) => s + j.quote, 0);

  return (
    <DashboardLayout>
      <div className="px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              Marges & Finances
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Mis à jour automatiquement — QuickBooks + QuickBooks Time
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Sync en temps réel
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Revenus (30j)", value: `$${(24350).toLocaleString()}`, sub: "+8% vs mois dernier", color: "text-emerald-400", bg: "bg-emerald-400/10", icon: DollarSign },
            { label: "Marge moyenne", value: `${avgMargin}%`, sub: "Tous chantiers actifs", color: "text-violet-400", bg: "bg-violet-400/10", icon: TrendingUp },
            { label: "À encaisser", value: `$${pendingInvoices.toLocaleString()}`, sub: "2 factures en attente", color: "text-amber-400", bg: "bg-amber-400/10", icon: FileText },
            { label: "Chantiers actifs", value: activeJobs.length, sub: "Cette semaine", color: "text-blue-400", bg: "bg-blue-400/10", icon: CheckCircle2 },
          ].map(({ label, value, sub, color, bg, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", bg)}>
                  <Icon className={cn("w-3.5 h-3.5", color)} />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
              </div>
              <p className={cn("text-xl font-bold", color)} style={{ fontFamily: "'Syne', sans-serif" }}>{value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Revenue vs Costs bar chart */}
          <div className="rounded-xl border border-border/60 bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
              Revenus vs Coûts (6 mois)
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={MONTHLY_DATA} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenus" fill="rgba(52,211,153,0.7)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="costs" name="Coûts" fill="rgba(99,102,241,0.5)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Margin trend line chart */}
          <div className="rounded-xl border border-border/60 bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
              Évolution de la marge (%)
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={MONTHLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 72]} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="margin" name="Marge" stroke="#a78bfa" strokeWidth={2} dot={{ fill: "#a78bfa", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Job margin table */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
              Détail par chantier
            </h2>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{JOBS.length} chantiers</span>
          </div>
          <div className="divide-y divide-border/40">
            {JOBS.map((job) => {
              const totalCost = job.labour + job.materials;
              const invoiceCfg = INVOICE_CONFIG[job.invoiceStatus];
              const InvoiceIcon = invoiceCfg.icon;
              return (
                <div key={job.name} className="px-4 py-3 flex items-center gap-4 hover:bg-white/3 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{job.name}</span>
                      <span className="text-[10px] text-muted-foreground">{job.type}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-muted-foreground">Main-d'œuvre: <span className="text-foreground/70">${job.labour.toLocaleString()}</span></span>
                      <span className="text-[11px] text-muted-foreground">Matériaux: <span className="text-foreground/70">${job.materials.toLocaleString()}</span></span>
                    </div>
                  </div>

                  {/* Margin bar */}
                  <div className="w-28 flex-shrink-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground">Marge</span>
                      <span className="text-xs font-bold text-violet-400">{job.margin}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400"
                        style={{ width: `${job.margin}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 w-20">
                    <p className="text-sm font-bold text-foreground">${job.quote.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">Coût: ${totalCost.toLocaleString()}</p>
                  </div>

                  <span className={cn("text-[10px] px-2 py-1 rounded border font-medium flex items-center gap-1 flex-shrink-0", invoiceCfg.color)}>
                    <InvoiceIcon className="w-2.5 h-2.5" />
                    {job.invoiceStatus}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
