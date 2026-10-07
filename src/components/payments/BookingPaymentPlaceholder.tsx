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
          {paymentType === "full"
            ? "This booking starts within 48 hours, so full payment is required now."
            : "Pay the deposit now to hold the slot. The remaining balance is due 48 hours before the session."}
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
        <p className="font-semibold text-foreground">Strict Booking Policy Active:</p>
        <p>Deposit locks the slot. Full balance must be paid 48 hours before session start, or your slot will be released and payment lost if booked by someone else.</p>
        <p className="text-[11px] opacity-90 mt-1">First reschedule allowed up to 24h before booking. Second is not guaranteed. Cancellations within 24h lose payments.</p>
      </div>
    </div>
    <p className="text-xs text-muted-foreground">
      Deposit and strict rescheduling handling are enforced by the studio management. All rates are subject to room setup blockage rules.
    </p>

    {onCheckout && (
      <Button onClick={onCheckout} disabled={loading} className="w-full font-bebas text-lg tracking-wider">
        {loading ? "Opening Stripe..." : `Pay ${formatGBP(dueNow ?? deposit)} with Stripe`}
      </Button>
    )}
  </div>
);
