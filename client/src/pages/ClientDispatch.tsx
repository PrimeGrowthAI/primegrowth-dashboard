// PrimeGrowth AI — Client Demo: Dispatch & Schedule View
// Designed for screenshots, reels, and Meta ads

import DashboardLayout from "@/components/DashboardLayout";
import { cn } from "@/lib/utils";
import { MapPin, Users, CheckCircle2, AlertTriangle, Clock, Calendar, MessageSquare, ChevronRight } from "lucide-react";

interface Job {
  id: string;
  name: string;
  address: string;
  city: string;
  crew: string;
  crewCount: number;
  startDate: string;
  startTime: string;
  status: "active" | "upcoming" | "completed";
  siteReadiness: "ready" | "pending" | "blocked";
  type: string;
  surface: string;
  value: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

const JOBS: Job[] = [
  {
    id: "j1",
    name: "Résidence Tremblay",
    address: "4821 Rue des Érables",
    city: "Laval",
    crew: "Équipe A — Marco + Yannick",
    crewCount: 2,
    startDate: "Aujourd'hui",
    startTime: "7:30",
    status: "active",
    siteReadiness: "ready",
    type: "Plancher de céramique",
    surface: "185 pi²",
    value: "$3,200",
    lastMessage: "Marco: On est sur le chantier, site propre ✅",
    lastMessageTime: "7:42",
  },
  {
    id: "j2",
    name: "Condo Beaumont",
    address: "1102 Boul. de Maisonneuve O.",
    city: "Montréal",
    crew: "Équipe B — Kevin + Sébastien",
    crewCount: 2,
    startDate: "Demain",
    startTime: "8:00",
    status: "upcoming",
    siteReadiness: "ready",
    type: "Salle de bain complète",
    surface: "72 pi²",
    value: "$2,850",
    lastMessage: "GC confirmé: site prêt pour demain matin",
    lastMessageTime: "Hier 16:30",
  },
  {
    id: "j3",
    name: "Bureau Côte-Vertu",
    address: "3500 Boul. Côte-Vertu",
    city: "Saint-Laurent",
    crew: "Équipe A — Marco + Yannick",
    crewCount: 2,
    startDate: "Jeu 24 avr.",
    startTime: "7:00",
    status: "upcoming",
    siteReadiness: "blocked",
    type: "Plancher commercial",
    surface: "420 pi²",
    value: "$6,100",
    lastMessage: "⚠️ GC: béton pas encore sec — reporter d'une journée",
    lastMessageTime: "Hier 14:15",
  },
  {
    id: "j4",
    name: "Résidence Gagnon",
    address: "892 Rue Principale",
    city: "Brossard",
    crew: "Équipe B — Kevin + Sébastien",
    crewCount: 2,
    startDate: "Ven 25 avr.",
    startTime: "8:00",
    status: "upcoming",
    siteReadiness: "pending",
    type: "Cuisine + entrée",
    surface: "130 pi²",
    value: "$2,400",
    lastMessage: "Confirmation de site en attente (envoyée il y a 2h)",
    lastMessageTime: "Aujourd'hui 9:00",
  },
];

const READINESS_CONFIG = {
  ready: {
    label: "Site Prêt",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/25",
    dot: "bg-emerald-400",
    icon: CheckCircle2,
  },
  pending: {
    label: "En attente",
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/25",
    dot: "bg-amber-400",
    icon: Clock,
  },
  blocked: {
    label: "Bloqué",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/25",
    dot: "bg-red-400",
    icon: AlertTriangle,
  },
};

const STATUS_CONFIG = {
  active: { label: "En cours", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  upcoming: { label: "À venir", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  completed: { label: "Terminé", color: "text-slate-400 bg-slate-400/10 border-slate-400/20" },
};

export default function ClientDispatch() {
  const activeJobs = JOBS.filter((j) => j.status === "active");
  const upcomingJobs = JOBS.filter((j) => j.status === "upcoming");
  const blockedJobs = JOBS.filter((j) => j.siteReadiness === "blocked");
  const totalValue = JOBS.reduce((s, j) => s + parseInt(j.value.replace(/[^0-9]/g, "")), 0);

  return (
    <DashboardLayout>
      <div className="px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              Dispatch du Matin
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Mardi 22 avril 2026 — 4 chantiers actifs cette semaine
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Valeur en cours</p>
            <p className="text-xl font-bold text-emerald-400" style={{ fontFamily: "'Syne', sans-serif" }}>
              ${totalValue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Actifs aujourd'hui", value: activeJobs.length, color: "text-emerald-400", bg: "bg-emerald-400/10" },
            { label: "À venir", value: upcomingJobs.length, color: "text-blue-400", bg: "bg-blue-400/10" },
            { label: "Sites bloqués", value: blockedJobs.length, color: "text-red-400", bg: "bg-red-400/10" },
            { label: "Équipes déployées", value: 2, color: "text-violet-400", bg: "bg-violet-400/10" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="rounded-xl border border-border/60 bg-card p-4 flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", bg)}>
                <span className={cn("text-lg font-bold", color)} style={{ fontFamily: "'Syne', sans-serif" }}>{value}</span>
              </div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Job cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {JOBS.map((job) => {
            const readiness = READINESS_CONFIG[job.siteReadiness];
            const ReadinessIcon = readiness.icon;
            const statusCfg = STATUS_CONFIG[job.status];

            return (
              <div
                key={job.id}
                className={cn(
                  "rounded-xl border bg-card overflow-hidden transition-all",
                  job.siteReadiness === "blocked"
                    ? "border-red-400/30 shadow-[0_0_20px_rgba(248,113,113,0.08)]"
                    : job.siteReadiness === "ready" && job.status === "active"
                    ? "border-emerald-400/30 shadow-[0_0_20px_rgba(52,211,153,0.08)]"
                    : "border-border/60"
                )}
              >
                {/* Card top bar */}
                <div className={cn("h-1 w-full", readiness.dot)} />

                <div className="p-4 space-y-3">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
                          {job.name}
                        </h3>
                        <span className={cn("text-[10px] px-2 py-0.5 rounded border font-medium", statusCfg.color)}>
                          {statusCfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{job.address}, {job.city}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-foreground">{job.value}</p>
                      <p className="text-[10px] text-muted-foreground">{job.type}</p>
                    </div>
                  </div>

                  {/* Details row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-white/3 border border-border/40 px-3 py-2">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Équipe</p>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">{job.crewCount} techs</span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-white/3 border border-border/40 px-3 py-2">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Début</p>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">{job.startDate}</span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-white/3 border border-border/40 px-3 py-2">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Surface</p>
                      <span className="text-xs font-medium text-foreground">{job.surface}</span>
                    </div>
                  </div>

                  {/* Site readiness */}
                  <div className={cn("rounded-lg border px-3 py-2 flex items-center justify-between", readiness.bg)}>
                    <div className="flex items-center gap-2">
                      <ReadinessIcon className={cn("w-3.5 h-3.5", readiness.color)} />
                      <span className={cn("text-xs font-semibold", readiness.color)}>{readiness.label}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Vérification automatique</span>
                  </div>

                  {/* Last Slack message */}
                  {job.lastMessage && (
                    <div className="flex items-start gap-2 pt-1 border-t border-border/40">
                      <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground/80 leading-relaxed truncate">{job.lastMessage}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">{job.lastMessageTime}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Crew overview */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border/60">
            <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
              Équipes déployées
            </h2>
          </div>
          <div className="divide-y divide-border/40">
            {[
              { name: "Équipe A", members: "Marco Ricci + Yannick Bouchard", job: "Résidence Tremblay", status: "Sur le chantier", hours: "3h 20min", color: "bg-emerald-400" },
              { name: "Équipe B", members: "Kevin Lapointe + Sébastien Morin", job: "Condo Beaumont (demain)", status: "En transit", hours: "—", color: "bg-blue-400" },
            ].map((crew) => (
              <div key={crew.name} className="px-4 py-3 flex items-center gap-4">
                <div className={cn("w-2 h-2 rounded-full flex-shrink-0", crew.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{crew.name}</span>
                    <span className="text-xs text-muted-foreground">— {crew.members}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{crew.job}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium text-foreground">{crew.status}</p>
                  <p className="text-[10px] text-muted-foreground">{crew.hours} aujourd'hui</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
