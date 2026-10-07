import { Bot, PhoneCall } from "lucide-react";
import { STUDIO_CONTACT_CONFIG } from "@/lib/studioOpsConfig";
import { StudioOpsBadge, StudioOpsCard, StudioOpsSection } from "./StudioOpsPrimitives";

export const AIAdminPanel = () => {
  const items = [
    ["Building phone number", STUDIO_CONTACT_CONFIG.phoneNumber || STUDIO_CONTACT_CONFIG.buildingPhoneLabel],
    ["AI call answering provider", STUDIO_CONTACT_CONFIG.aiPhoneProvider],
    ["Call logs", STUDIO_CONTACT_CONFIG.callLogsEnabled ? "Enabled" : "Not enabled"],
    ["AI summaries", STUDIO_CONTACT_CONFIG.aiSummariesEnabled ? "Enabled" : "Not enabled"],
    ["Missed calls", "Waiting for phone provider"],
    ["Booking enquiries", "Integration-ready queue"],
    ["Follow-up tasks", "Ready for automation workflow"],
    ["Lead status", "Will connect to CRM/booking enquiries"],
  ];

  return (
    <StudioOpsSection
      title="AI Admin + Phone System"
      eyebrow="Not live yet"
      icon={Bot}
      action={<StudioOpsBadge tone="border-amber-500/25 bg-amber-500/10 text-amber-300">Integration ready</StudioOpsBadge>}
    >
      <div className="mb-4 rounded-2xl border border-border bg-background/45 p-4 text-sm text-muted-foreground">
        This panel does not answer calls yet. It defines the future phone, call summary, missed-call recovery, and booking enquiry workflow without pretending it is live.
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map(([label, value]) => (
          <StudioOpsCard key={label} className="flex items-start gap-3">
            <PhoneCall className="mt-1 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
              <p className="text-sm text-foreground">{value}</p>
            </div>
          </StudioOpsCard>
        ))}
      </div>
    </StudioOpsSection>
  );
};
