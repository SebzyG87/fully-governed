import { MailCheck } from "lucide-react";
import { EMAIL_WORKFLOW_TEMPLATES } from "@/lib/emailWorkflows";
import { StudioOpsBadge, StudioOpsCard, StudioOpsSection } from "./StudioOpsPrimitives";

const AUDIENCE_TONES = {
  client: "border-sky-500/25 bg-sky-500/10 text-sky-300",
  admin: "border-primary/25 bg-primary/10 text-primary",
  producer: "border-purple-500/25 bg-purple-500/10 text-purple-300",
  cleaner: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
};

export const EmailWorkflowPreview = () => (
  <StudioOpsSection title="Email Workflow Preview" eyebrow="Integration ready" icon={MailCheck}>
    <div className="grid gap-3 lg:grid-cols-2">
      {EMAIL_WORKFLOW_TEMPLATES.map((template) => (
        <StudioOpsCard key={template.key}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-bebas text-xl tracking-wide text-foreground">{template.subject}</h3>
              <p className="text-xs text-muted-foreground">{template.purpose}</p>
            </div>
            <StudioOpsBadge tone={AUDIENCE_TONES[template.audience]}>{template.audience}</StudioOpsBadge>
          </div>
          <div className="mt-3 space-y-2 text-xs text-muted-foreground">
            <p>Trigger: <span className="text-foreground">{template.trigger}</span></p>
            <p>Status: <span className="text-primary">Provider not connected yet</span></p>
            <p className="rounded-xl bg-card/70 p-3">{template.bodyNote}</p>
          </div>
        </StudioOpsCard>
      ))}
    </div>
  </StudioOpsSection>
);
