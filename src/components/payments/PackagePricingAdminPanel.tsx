import { PackageCheck, ShieldCheck } from "lucide-react";
import { STUDIO_PACKAGE_PRICING } from "@/lib/mockPackages";
import { formatGBP } from "@/lib/paymentStatus";
import { StudioOpsBadge, StudioOpsCard, StudioOpsSection } from "@/components/studio-ops/StudioOpsPrimitives";

export const PackagePricingAdminPanel = ({ onInspect }: { onInspect?: (packageId: string) => void }) => (
  <StudioOpsSection title="Package + Pricing Management" eyebrow="Payment ready" icon={PackageCheck}>
    <div className="grid gap-3 xl:grid-cols-2">
      {STUDIO_PACKAGE_PRICING.map((pkg) => (
        <button key={pkg.id} type="button" onClick={() => onInspect?.(pkg.id)} className="text-left">
        <StudioOpsCard className="space-y-4 transition-colors hover:border-primary/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{pkg.category}</p>
              <h3 className="font-bebas text-2xl tracking-wide text-foreground">{pkg.packageName}</h3>
              <p className="text-sm text-muted-foreground">{pkg.description}</p>
            </div>
            <StudioOpsBadge tone={pkg.verificationRequired ? "border-amber-500/25 bg-amber-500/10 text-amber-300" : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"}>
              {pkg.verificationRequired ? "ID check" : "standard"}
            </StudioOpsBadge>
          </div>
          <div className="grid gap-2 sm:grid-cols-4">
            <div className="rounded-xl bg-card/70 p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Duration</p>
              <p className="font-mono text-sm text-foreground">{pkg.durationMinutes}m</p>
            </div>
            <div className="rounded-xl bg-card/70 p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Full</p>
              <p className="font-mono text-sm text-foreground">{formatGBP(pkg.fullPrice)}</p>
            </div>
            <div className="rounded-xl bg-card/70 p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Deposit</p>
              <p className="font-mono text-sm text-primary">{formatGBP(pkg.depositAmount)}</p>
            </div>
            <div className="rounded-xl bg-card/70 p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Overtime</p>
              <p className="font-mono text-sm text-foreground">{formatGBP(pkg.overtimeRate)}/hr</p>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-emerald-300">Included</p>
              <p className="text-xs text-muted-foreground">{pkg.includedServices.join(", ")}</p>
            </div>
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-red-300">Excluded</p>
              <p className="text-xs text-muted-foreground">{pkg.excludedServices.join(", ")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card/70 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Buffer: {pkg.bufferMinutes} minutes · Extras: {pkg.optionalExtras.join(", ") || "None"}
          </div>
        </StudioOpsCard>
        </button>
      ))}
    </div>
  </StudioOpsSection>
);
