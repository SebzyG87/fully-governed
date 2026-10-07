import { CreditCard, ReceiptText } from "lucide-react";
import { formatGBP, type PaymentStatus } from "@/lib/paymentStatus";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

export const PaymentSummaryCard = ({
  title = "Payment summary",
  packageName,
  bookingReference = "Pending",
  total,
  deposit,
  balance,
  status,
  audience = "client",
  onInspect,
}: {
  title?: string;
  packageName: string;
  bookingReference?: string;
  total: number;
  deposit: number;
  balance: number;
  status: PaymentStatus;
  audience?: "client" | "admin" | "producer";
  onInspect?: () => void;
}) => (
  <div className="rounded-2xl border border-border bg-background/45 p-4">
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          {audience === "client" ? <ReceiptText className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">{title}</p>
          <h3 className="font-bebas text-2xl tracking-wide text-foreground">{packageName}</h3>
          <p className="text-xs text-muted-foreground">Reference: {bookingReference}</p>
        </div>
      </div>
      <PaymentStatusBadge status={status} />
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-border bg-card/70 p-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Total</p>
        <p className="font-mono text-xl text-foreground">{formatGBP(total)}</p>
      </div>
      <div className="rounded-xl border border-border bg-card/70 p-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Deposit</p>
        <p className="font-mono text-xl text-primary">{formatGBP(deposit)}</p>
      </div>
      <div className="rounded-xl border border-border bg-card/70 p-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Balance</p>
        <p className="font-mono text-xl text-foreground">{formatGBP(balance)}</p>
      </div>
    </div>
    {audience !== "client" && (
      <div className="mt-3 rounded-xl border border-dashed border-border bg-card/50 p-3 text-xs text-muted-foreground">
        Provider record: payment processor pending · Session ID: {bookingReference} · Internal payment notes stay visible to admins only.
      </div>
    )}
    {onInspect && (
      <button
        type="button"
        onClick={onInspect}
        className="mt-3 w-full rounded-xl border border-border bg-card/70 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        Inspect payment, reminders and audit trail
      </button>
    )}
  </div>
);
