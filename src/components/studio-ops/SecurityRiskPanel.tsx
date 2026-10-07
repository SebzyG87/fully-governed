import { useState, useEffect } from "react";
import { ShieldAlert, AlertOctagon, UserX, AlertTriangle, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { StudioOpsCard, StudioOpsSection, StudioOpsBadge, StudioOpsEmpty } from "./StudioOpsPrimitives";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface RiskRegistry {
  id: string;
  name: string;
  type: "client" | "participant" | "group";
  status: "green" | "amber" | "red";
  notes: string;
  actions: string;
}

interface IncidentReport {
  id: string;
  reporter: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  details: string;
  date: string;
}

export const SecurityRiskPanel = ({ staffRole }: { staffRole: string }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [registry, setRegistry] = useState<RiskRegistry[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [isLiveData, setIsLiveData] = useState(false);

  // Form states
  const [showAddRisk, setShowAddRisk] = useState(false);
  const [riskName, setRiskName] = useState("");
  const [riskType, setRiskType] = useState<"client" | "participant" | "group">("client");
  const [riskStatus, setRiskStatus] = useState<"green" | "amber" | "red">("amber");
  const [riskNotes, setRiskNotes] = useState("");
  const [riskActions, setRiskActions] = useState("");

  const [showAddIncident, setShowAddIncident] = useState(false);
  const [incidentType, setIncidentType] = useState("");
  const [incidentSeverity, setIncidentSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [incidentDetails, setIncidentDetails] = useState("");

  const defaultRisks: RiskRegistry[] = [
    { id: "r1", name: "Marcus Sterling (North Side)", type: "client", status: "amber", notes: "Do not schedule on the same day as South Side collective members. Avoid overlap sessions.", actions: "Enforce 1-hour room buffer gaps" },
    { id: "r2", name: "Jayden K. (South Side Collective)", type: "group", status: "amber", notes: "Keep scheduled sessions segregated from Marcus Sterling's crews.", actions: "Coordinate schedule blockages" },
    { id: "r3", name: "Tyrone Vance", type: "client", status: "red", notes: "Banned due to equipment damage and aggressive behavior during session on May 12.", actions: "BANNED - Do not accept bookings or allow entry" },
    { id: "r4", name: "Kane H. Crew", type: "participant", status: "red", notes: "Gang-related verbal altercation in public lounge. High risk group mixing issues.", actions: "BANNED - Block booking access and participants" }
  ];

  const defaultIncidents: IncidentReport[] = [
    { id: "in-1", reporter: "Mono Luke", type: "Equip Damage", severity: "high", details: "Tyrone Vance cracked a vocal isolation panel after session over-run argument.", date: "May 12, 2026" },
    { id: "in-2", reporter: "Cleaner Team", type: "Clean Conflict", severity: "medium", details: "Lounge was littered with forbidden items. Booking reference FG-0291.", date: "May 28, 2026" }
  ];

  useEffect(() => {
    Promise.all([
      supabase.from("fg_ban_registry" as any).select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("fg_incidents" as any).select("*").order("created_at", { ascending: false }).limit(100),
    ]).then(([riskResult, incidentResult]) => {
      const liveRisks = !riskResult.error && riskResult.data;
      const liveIncidents = !incidentResult.error && incidentResult.data;
      if (liveRisks) {
        setRegistry((riskResult.data as any[]).map((risk) => ({
          id: risk.id,
          name: risk.person_name,
          type: risk.person_type === "group" ? "group" : risk.person_type === "guest" ? "participant" : "client",
          status: risk.risk_status,
          notes: risk.reason,
          actions: risk.required_action || risk.ban_status,
        })));
      }
      if (liveIncidents) {
        setIncidents((incidentResult.data as any[]).map((incident) => ({
          id: incident.id,
          reporter: "Staff",
          type: incident.incident_type,
          severity: incident.severity,
          details: incident.notes || "No details supplied",
          date: new Date(incident.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
        })));
      }
      if (liveRisks || liveIncidents) {
        setIsLiveData(true);
        return;
      }

    const savedRisks = localStorage.getItem("fg_risk_registry");
    if (savedRisks) {
      try { setRegistry(JSON.parse(savedRisks)); } catch { setRegistry(defaultRisks); }
    } else {
      setRegistry(defaultRisks);
      localStorage.setItem("fg_risk_registry", JSON.stringify(defaultRisks));
    }

    const savedIncidents = localStorage.getItem("fg_incident_reports");
    if (savedIncidents) {
      try { setIncidents(JSON.parse(savedIncidents)); } catch { setIncidents(defaultIncidents); }
    } else {
      setIncidents(defaultIncidents);
      localStorage.setItem("fg_incident_reports", JSON.stringify(defaultIncidents));
    }
    });
  }, []);

  const saveRisks = (updated: RiskRegistry[]) => {
    setRegistry(updated);
    if (!isLiveData) localStorage.setItem("fg_risk_registry", JSON.stringify(updated));
  };

  const saveIncidents = (updated: IncidentReport[]) => {
    setIncidents(updated);
    if (!isLiveData) localStorage.setItem("fg_incident_reports", JSON.stringify(updated));
  };

  const handleAddRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riskName.trim()) return;

    const newRisk: RiskRegistry = {
      id: Math.random().toString(36).substring(2, 9),
      name: riskName.trim(),
      type: riskType,
      status: riskStatus,
      notes: riskNotes.trim() || "No notes",
      actions: riskActions.trim() || "Monitor entry"
    };

    if (isLiveData) {
      const { data, error } = await supabase
        .from("fg_ban_registry" as any)
        .insert({
          person_name: newRisk.name,
          person_type: newRisk.type === "participant" ? "guest" : newRisk.type,
          risk_status: newRisk.status,
          ban_status: newRisk.status === "red" ? "banned" : "watch",
          review_status: "pending_review",
          reason: newRisk.notes,
          required_action: newRisk.actions,
          created_by: user?.id ?? null,
          audit_trail: [{ at: new Date().toISOString(), action: "risk_created", actor: user?.id ?? "unknown" }],
        })
        .select("id")
        .single();
      if (error) {
        toast({ title: "Risk flag could not be saved", description: error.message, variant: "destructive" });
        return;
      }
      newRisk.id = data.id;
    }

    const updated = [newRisk, ...registry];
    saveRisks(updated);
    setRiskName("");
    setRiskNotes("");
    setRiskActions("");
    setShowAddRisk(false);
    toast({ title: "Access flag registered", description: `${newRisk.name} added to security tracking.` });
  };

  const handleAddIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentType.trim() || !incidentDetails.trim()) return;

    const newIncident: IncidentReport = {
      id: Math.random().toString(36).substring(2, 9),
      reporter: "Staff Member",
      type: incidentType.trim(),
      severity: incidentSeverity,
      details: incidentDetails.trim(),
      date: new Date().toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})
    };

    if (isLiveData) {
      const { data, error } = await supabase
        .from("fg_incidents" as any)
        .insert({
          incident_type: "other",
          severity: newIncident.severity,
          notes: `${newIncident.type}: ${newIncident.details}`,
          reported_by: user?.id ?? null,
        })
        .select("id")
        .single();
      if (error) {
        toast({ title: "Incident could not be saved", description: error.message, variant: "destructive" });
        return;
      }
      newIncident.id = data.id;
    }

    const updated = [newIncident, ...incidents];
    saveIncidents(updated);
    setIncidentType("");
    setIncidentDetails("");
    setShowAddIncident(false);
    toast({ title: "Incident Report Filed", description: "Security dispatch and admin have been notified." });
  };

  const getRiskColor = (status: RiskRegistry["status"]) => {
    if (status === "green") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    if (status === "amber") return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    return "border-red-500/30 bg-red-500/10 text-red-300";
  };

  const getSeverityBadge = (sev: IncidentReport["severity"]) => {
    if (sev === "low") return "border-border text-muted-foreground";
    if (sev === "medium") return "border-sky-500/30 text-sky-300 bg-sky-500/10";
    if (sev === "high") return "border-amber-500/30 text-amber-300 bg-amber-500/10";
    return "border-red-500/30 text-red-300 bg-red-500/10 font-bold";
  };

  if (staffRole !== "super_admin" && staffRole !== "studio_manager") {
    return null;
  }

  return (
    <StudioOpsSection title="Security & Access Risk Matrix" eyebrow="Risk management" icon={ShieldAlert}>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Risk Registry / Banned Lists */}
        <StudioOpsCard className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bebas text-lg tracking-wide text-foreground">Access Risk & Ban List</h4>
              <p className="text-[10px] text-muted-foreground font-mono">PROBLEM CLIENTS & GROUP SEGREGATION FLAGS · {isLiveData ? "LIVE" : "LOCAL FALLBACK"}</p>
            </div>
            <Button size="sm" onClick={() => setShowAddRisk(!showAddRisk)} className="font-bebas text-xs tracking-wider bg-red-950/20 text-red-300 hover:bg-red-950/40 border border-red-500/30 h-7 px-2">
              <Plus className="w-3.5 h-3.5 mr-1" /> Flag Client
            </Button>
          </div>

          {showAddRisk && (
            <form onSubmit={handleAddRisk} className="rounded-xl border border-red-500/25 bg-red-950/10 p-3.5 space-y-3 text-xs font-barlow">
              <h5 className="font-bebas text-base tracking-wide text-red-200 uppercase">Register Risk Flag</h5>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="risk-name">Name / Group</Label>
                  <Input id="risk-name" value={riskName} onChange={(e) => setRiskName(e.target.value)} required className="h-7 text-xs bg-background" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="risk-type">Type</Label>
                  <select id="risk-type" value={riskType} onChange={(e) => setRiskType(e.target.value as any)} className="w-full h-7 rounded border border-border bg-background px-2 text-xs">
                    <option value="client">Client</option>
                    <option value="participant">Participant</option>
                    <option value="group">Group / Crew</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="risk-status">Risk Classification</Label>
                  <select id="risk-status" value={riskStatus} onChange={(e) => setRiskStatus(e.target.value as any)} className="w-full h-7 rounded border border-border bg-background px-2 text-xs">
                    <option value="amber">Amber (Avoid mix)</option>
                    <option value="red">Red (BANNED)</option>
                    <option value="green">Green (Safe)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="risk-actions">Required Action</Label>
                  <Input id="risk-actions" value={riskActions} onChange={(e) => setRiskActions(e.target.value)} placeholder="e.g. Block booking, require ID" className="h-7 text-xs bg-background" />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="risk-notes">Security & Segregation Notes</Label>
                <Input id="risk-notes" value={riskNotes} onChange={(e) => setRiskNotes(e.target.value)} placeholder="e.g. Do not schedule together with group B" className="h-7 text-xs bg-background" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddRisk(false)} className="h-7 text-xs">Cancel</Button>
                <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bebas tracking-wider h-7 px-2 text-xs">Save Flag</Button>
              </div>
            </form>
          )}

          <div className="space-y-2.5 max-h-[16rem] overflow-y-auto pr-1 text-xs">
            {registry.map((risk) => (
              <div key={risk.id} className={`rounded-xl border p-3 flex justify-between gap-3 ${getRiskColor(risk.status)}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span className="font-semibold text-foreground font-barlow">{risk.name}</span>
                    <span className="text-[9px] font-mono opacity-80">({risk.type})</span>
                  </div>
                  <p className="text-[11px] leading-relaxed font-barlow opacity-90">{risk.notes}</p>
                  <p className="text-[10px] font-mono opacity-85 mt-1">Action: {risk.actions}</p>
                </div>
                <div className="shrink-0 flex items-center">
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                    {risk.status === "red" ? "BANNED" : "FLAGGED"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </StudioOpsCard>

        {/* Incidents Board */}
        <StudioOpsCard className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bebas text-lg tracking-wide text-foreground">Incident Reports Log</h4>
              <p className="text-[10px] text-muted-foreground font-mono">STAFF INCIDENT AUDITS & INTERVENTIONS</p>
            </div>
            <Button size="sm" onClick={() => setShowAddIncident(!showAddIncident)} className="font-bebas text-xs tracking-wider bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20 h-7 px-2">
              <Plus className="w-3.5 h-3.5 mr-1" /> File Incident
            </Button>
          </div>

          {showAddIncident && (
            <form onSubmit={handleAddIncident} className="rounded-xl border border-border bg-card p-3.5 space-y-3 text-xs font-barlow">
              <h5 className="font-bebas text-base tracking-wide text-foreground uppercase">File Security Incident</h5>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="inc-type">Incident Category</Label>
                  <Input id="inc-type" value={incidentType} onChange={(e) => setIncidentType(e.target.value)} required placeholder="e.g. Damage, Altercation" className="h-7 text-xs bg-background" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="inc-severity">Severity Level</Label>
                  <select id="inc-severity" value={incidentSeverity} onChange={(e) => setIncidentSeverity(e.target.value as any)} className="w-full h-7 rounded border border-border bg-background px-2 text-xs">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="inc-details">Details / Observations</Label>
                <Input id="inc-details" value={incidentDetails} onChange={(e) => setIncidentDetails(e.target.value)} required placeholder="Explain exactly what happened..." className="h-7 text-xs bg-background" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddIncident(false)} className="h-7 text-xs">Cancel</Button>
                <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bebas tracking-wider h-7 px-2 text-xs">File Report</Button>
              </div>
            </form>
          )}


          <div className="space-y-2.5 max-h-[16rem] overflow-y-auto pr-1 text-xs">
            {incidents.map((inc) => (
              <div key={inc.id} className="rounded-xl border border-border bg-card/60 p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5 text-primary" />
                    <span className="font-semibold text-foreground">{inc.type}</span>
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground">{inc.date}</span>
                </div>
                <p className="text-[11px] leading-relaxed font-barlow text-muted-foreground">{inc.details}</p>
                <div className="flex justify-between items-center text-[9px] font-mono pt-1">
                  <span>Reported by: {inc.reporter}</span>
                  <StudioOpsBadge tone={getSeverityBadge(inc.severity)}>
                    {inc.severity}
                  </StudioOpsBadge>
                </div>
              </div>
            ))}
          </div>
        </StudioOpsCard>
      </div>
    </StudioOpsSection>
  );
};
