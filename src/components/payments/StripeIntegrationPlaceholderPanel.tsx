import { CreditCard } from "lucide-react";
import { STRIPE_INTEGRATION_PLAN } from "@/lib/stripeIntegrationPlan";
import { StudioOpsCard, StudioOpsSection } from "@/components/studio-ops/StudioOpsPrimitives";

export const StripeIntegrationPlaceholderPanel = () => (
  <StudioOpsSection title="Stripe Integration Plan" eyebrow="No live keys" icon={CreditCard}>
    <div className="grid gap-4 xl:grid-cols-3">
      <StudioOpsCard>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Required env vars</p>
        <div className="space-y-1 text-xs text-muted-foreground">
          {STRIPE_INTEGRATION_PLAN.requiredEnvVars.map((item) => <p key={item}>• {item}</p>)}
        </div>
      </StudioOpsCard>
      <StudioOpsCard>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Payment flows</p>
        <div className="space-y-1 text-xs text-muted-foreground">
          {STRIPE_INTEGRATION_PLAN.flows.map((item) => <p key={item}>• {item}</p>)}
        </div>
      </StudioOpsCard>
      <StudioOpsCard>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Test checklist</p>
        <div className="space-y-1 text-xs text-muted-foreground">
          {STRIPE_INTEGRATION_PLAN.testModeChecklist.map((item) => <p key={item}>• {item}</p>)}
        </div>
      </StudioOpsCard>
    </div>
    <p className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-100">
      No Stripe keys are stored here and no live payments can be triggered from this placeholder.
    </p>
  </StudioOpsSection>
);
