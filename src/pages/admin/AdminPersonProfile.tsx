import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Activity, CreditCard, ListChecks, Tags, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_OPERATIONAL_PROFILES } from "@/lib/mockStudioOps";
import { StudioOpsBadge, StudioOpsCard, StudioOpsEmpty, StudioOpsSection } from "@/components/studio-ops/StudioOpsPrimitives";

const AdminPersonProfile = () => {
  const { personId } = useParams();
  const profile = MOCK_OPERATIONAL_PROFILES.find((item) => item.id === personId);

  if (!profile) {
    return (
      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link to="/dashboard/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Back to operations</Link>
        </Button>
        <StudioOpsEmpty>Operational profile not found.</StudioOpsEmpty>
      </div>
    );
  }

  return (
    <div className="relative z-10 space-y-6 p-4 sm:p-6 lg:p-8">
      <Button asChild variant="ghost" className="font-bebas tracking-wider">
        <Link to="/dashboard/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Operations</Link>
      </Button>

      <section className="rounded-3xl border border-border bg-card/80 p-5 shadow-xl shadow-black/20">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">{profile.role} profile</p>
        <h1 className="font-bebas text-5xl tracking-wider text-foreground">{profile.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{profile.contact} · {profile.status}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.tags.map((tag) => <StudioOpsBadge key={tag}>{tag}</StudioOpsBadge>)}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <StudioOpsSection title="Sessions + Attendance" eyebrow="History" icon={Users}>
          <div className="grid gap-3">
            <StudioOpsCard>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Sessions</p>
              <p className="mt-2 text-sm text-foreground">{profile.sessions.join(", ")}</p>
            </StudioOpsCard>
            {profile.attendance.map((item) => (
              <StudioOpsCard key={item}><p className="text-sm text-muted-foreground">{item}</p></StudioOpsCard>
            ))}
          </div>
        </StudioOpsSection>

        <StudioOpsSection title="Payments + Metadata" eyebrow="Finance" icon={CreditCard}>
          <div className="grid gap-3">
            {profile.paymentHistory.length ? profile.paymentHistory.map((item) => (
              <StudioOpsCard key={item}><p className="text-sm text-muted-foreground">{item}</p></StudioOpsCard>
            )) : <StudioOpsEmpty>No payment records linked to this profile.</StudioOpsEmpty>}
            {Object.entries(profile.metadata).map(([label, value]) => (
              <StudioOpsCard key={label}>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                <p className="mt-1 text-sm text-foreground">{value}</p>
              </StudioOpsCard>
            ))}
          </div>
        </StudioOpsSection>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <StudioOpsSection title="Notes + Tags" eyebrow="Admin memory" icon={Tags}>
          <div className="space-y-3">
            {profile.notes.map((note) => (
              <StudioOpsCard key={note}><p className="text-sm text-muted-foreground">{note}</p></StudioOpsCard>
            ))}
          </div>
        </StudioOpsSection>

        <StudioOpsSection title="Tasks" eyebrow="Operational queue" icon={ListChecks}>
          <div className="space-y-3">
            {profile.tasks.map((task) => (
              <label key={task} className="flex items-center gap-3 rounded-2xl border border-border bg-background/45 p-4 text-sm text-muted-foreground">
                <input type="checkbox" className="h-4 w-4 accent-primary" />
                {task}
              </label>
            ))}
          </div>
        </StudioOpsSection>
      </div>

      <StudioOpsSection title="Audit History" eyebrow="Trace" icon={Activity}>
        <div className="space-y-3">
          {profile.history.map((event) => (
            <StudioOpsCard key={event.id}>
              <p className="text-sm text-foreground">{event.action}</p>
              <p className="text-xs text-muted-foreground">{event.actor} · {event.timestamp}</p>
              <p className="mt-2 text-sm text-muted-foreground">{event.detail}</p>
            </StudioOpsCard>
          ))}
        </div>
      </StudioOpsSection>
    </div>
  );
};

export default AdminPersonProfile;
