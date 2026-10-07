import { AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatGBP } from "@/lib/paymentStatus";
import type { StudioPackagePricing } from "@/lib/mockPackages";

export const BookingPaymentPlaceholder = ({
  packageInfo,
  total,
  deposit,
  balance,
  dueNow,
  paymentType = "deposit",
  loading = false,
  onCheckout,
}: {
  packageInfo: StudioPackagePricing;
  total: number;
  deposit: number;
  balance: number;
  dueNow?: number;
  paymentType?: "deposit" | "full" | "balance";
  loading?: boolean;
  onCheckout?: () => void;
}) => (
  <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-background/60 text-primary">
        <Lock className="h-5 w-5" />
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">Payment step</p>
        <h3 className="font-bebas text-2xl tracking-wide text-foreground">{packageInfo.packageName}</h3>
        <p className="text-sm text-muted-foreground">
          {paymentType === "full" ? "Review the payment amount and booking terms before continuing." : "Review the deposit and booking terms before continuing."}
        </p>
      </div>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-border bg-card/70 p-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Due now</p>
        <p className="font-mono text-xl text-primary">{formatGBP(dueNow ?? deposit)}</p>
      </div>
      <div className="rounded-xl border border-border bg-card/70 p-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Balance later</p>
        <p className="font-mono text-xl text-foreground">{formatGBP(balance)}</p>
      </div>
      <div className="rounded-xl border border-border bg-card/70 p-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Total</p>
        <p className="font-mono text-xl text-foreground">{formatGBP(total)}</p>
      </div>
    </div>
    <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-100">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
      <div className="space-y-1">
        <p className="font-semibold text-foreground">Cancellation schedule</p>
        <p>48 hours or more: full credit. 24–48 hours: 50% charge. Less than 24 hours: 100% charge.</p>
        <p className="text-[11px] opacity-90 mt-1">Your signed booking agreement controls. Contact the studio about cancellation or credit handling.</p>
      </div>
    </div>
    <p className="text-xs text-muted-foreground">
      The booking minimum is 2 hours; a 4-hour block is preferred. Please confirm any setup requirements with the studio.
    </p>

    {onCheckout && (
      <Button onClick={onCheckout} disabled={loading} className="w-full font-bebas text-lg tracking-wider">
        {loading ? "Opening Stripe..." : `Pay ${formatGBP(dueNow ?? deposit)} with Stripe`}
      </Button>
    )}
  </div>
);
