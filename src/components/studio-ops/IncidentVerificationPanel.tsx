import { AlertOctagon, ShieldCheck } from "lucide-react";
import type { IncidentRecord, VerificationRecord } from "@/lib/mockStudioOps";
import { VERIFICATION_STATUS_META } from "@/lib/verification";
import { DemoDataBadge, StudioOpsBadge, StudioOpsCard, StudioOpsSection } from "./StudioOpsPrimitives";

const INCIDENT_TONES: Record<IncidentRecord["severity"], string> = {
  low: "border-border bg-muted/20 text-muted-foreground",
  medium: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  high: "border-orange-500/25 bg-orange-500/10 text-orange-300",
  critical: "border-red-500/25 bg-red-500/10 text-red-300",
};

const VERIFICATION_TONES: Record<VerificationRecord["clientStatus"], string> = {
  not_required: "border-border bg-muted/20 text-muted-foreground",
  required: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  pending: "border-sky-500/25 bg-sky-500/10 text-sky-300",
  verified: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  rejected: "border-red-500/25 bg-red-500/10 text-red-300",
};

export const IncidentPanel = ({
  incidents,
  isDemoData = false,
  onInspect,
}: {
  incidents: IncidentRecord[];
  isDemoData?: boolean;
  onInspect?: (incident: IncidentRecord) => void;
}) => (
  <StudioOpsSection title="Incident Log" eyebrow="Trust and safety" icon={AlertOctagon} action={isDemoData ? <DemoDataBadge /> : undefined}>
    <div className="space-y-3">
      {incidents.map((incident) => (
        <button key={incident.id} type="button" onClick={() => onInspect?.(incident)} className="w-full text-left">
        <StudioOpsCard className="transition-colors hover:border-primary/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-bebas text-xl tracking-wide text-foreground">{incident.type.replace("_", " ")}</h3>
              <p className="text-xs text-muted-foreground">{incident.linkedSession} · {incident.timestamp}</p>
            </div>
            <StudioOpsBadge tone={INCIDENT_TONES[incident.severity]}>{incident.severity}</StudioOpsBadge>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Reported by {incident.reportedBy}</p>
          <p className="mt-2 rounded-xl bg-card/70 p-3 text-sm text-muted-foreground">{incident.notes}</p>
        </StudioOpsCard>
        </button>
      ))}
    </div>
  </StudioOpsSection>
);

export const VerificationPanel = ({
  records,
  isDemoData = false,
  onInspect,
}: {
  records: VerificationRecord[];
  isDemoData?: boolean;
  onInspect?: (record: VerificationRecord) => void;
}) => (
  <StudioOpsSection title="Verification Status" eyebrow="Client safety" icon={ShieldCheck} action={isDemoData ? <DemoDataBadge /> : undefined}>
    <div className="space-y-3">
      {records.map((record) => (
        <button key={record.id} type="button" onClick={() => onInspect?.(record)} className="w-full text-left">
        <StudioOpsCard className="transition-colors hover:border-primary/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-bebas text-xl tracking-wide text-foreground">{record.clientName}</h3>
              <p className="text-xs text-muted-foreground">{record.warning}</p>
            </div>
            <StudioOpsBadge tone={VERIFICATION_TONES[record.clientStatus]}>{VERIFICATION_STATUS_META[record.clientStatus].label}</StudioOpsBadge>
          </div>
          <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
            <p>Client: <span className="text-foreground">{VERIFICATION_STATUS_META[record.clientStatus].label}</span></p>
            <p>Guest: <span className="text-foreground">{VERIFICATION_STATUS_META[record.guestStatus].label}</span></p>
            <p>Admin: <span className="text-foreground">{VERIFICATION_STATUS_META[record.adminApproval].label}</span></p>
          </div>
        </StudioOpsCard>
        </button>
      ))}
    </div>
  </StudioOpsSection>
);
