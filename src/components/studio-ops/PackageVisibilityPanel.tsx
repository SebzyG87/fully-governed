import { PackageCheck, ShieldAlert } from "lucide-react";
import { getSessionPackage, SESSION_EXTRAS } from "@/lib/sessionPackages";
import { StudioOpsBadge, StudioOpsCard, StudioOpsSection } from "./StudioOpsPrimitives";
import { PaymentSummaryCard } from "@/components/payments/PaymentSummaryCard";
import { getPackagePricing } from "@/lib/mockPackages";

export const PackageVisibilityPanel = ({ packageId = "recording-with-producer", audience = "producer" }: { packageId?: string; audience?: "producer" | "client" }) => {
  const pkg = getSessionPackage(packageId);
  const pricing = getPackagePricing(packageId === "recording-with-producer" ? "recording-producer" : undefined);

  return (
    <StudioOpsSection
      title={audience === "producer" ? "Package Visibility" : "Your Package"}
      eyebrow={audience === "producer" ? "Boundaries" : "Session details"}
      icon={PackageCheck}
    >
      <div className="space-y-4">
        <StudioOpsCard>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-bebas text-3xl tracking-wide text-foreground">{pkg.name}</h3>
              <p className="max-w-2xl text-sm text-muted-foreground">{pkg.description}</p>
            </div>
            <StudioOpsBadge tone="border-primary/25 bg-primary/10 text-primary">{audience}</StudioOpsBadge>
          </div>
        </StudioOpsCard>
        <div className="grid gap-3 lg:grid-cols-2">
          <StudioOpsCard className="border-emerald-500/20 bg-emerald-500/5">
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.22em] text-emerald-300">Included</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              {pkg.includedServices.map((item) => <p key={item}>• {item}</p>)}
            </div>
          </StudioOpsCard>
          <StudioOpsCard className="border-destructive/20 bg-destructive/5">
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.22em] text-destructive">Not included</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              {pkg.excludedServices.map((item) => <p key={item}>• {item}</p>)}
            </div>
          </StudioOpsCard>
        </div>
        <StudioOpsCard className="border-amber-500/25 bg-amber-500/10">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <div className="text-sm text-amber-100">
              <p className="font-semibold">Approval needed for extras or overtime</p>
              <p className="mt-1 text-amber-100/75">{pkg.overtimeRule}</p>
            </div>
          </div>
        </StudioOpsCard>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {SESSION_EXTRAS.map((extra) => (
            <div key={extra.id} className="rounded-xl border border-border bg-background/45 p-3">
              <p className="text-sm text-foreground">{extra.name}</p>
              <p className="text-xs text-muted-foreground">{extra.priceLabel}</p>
              {extra.requiresApproval && <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-primary">Approval required</p>}
            </div>
          ))}
        </div>
        {audience === "client" && (
          <>
            <PaymentSummaryCard
              packageName={pricing.packageName}
              total={pricing.fullPrice}
              deposit={pricing.depositAmount}
              balance={pricing.fullPrice - pricing.depositAmount}
              status="balance_due"
              audience="client"
            />
            <p className="rounded-xl border border-border bg-background/45 p-3 text-sm text-muted-foreground">
              To request extras, contact the studio before or during the session. Extra services may require approval and payment before work starts.
            </p>
          </>
        )}
      </div>
    </StudioOpsSection>
  );
};
