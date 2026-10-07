export const PAYMENT_STATUSES = [
  "unpaid",
  "deposit_paid",
  "paid",
  "balance_due",
  "overtime_due",
  "failed",
  "refunded",
  "disputed",
] as const;

export type PaymentStatus = typeof PAYMENT_STATUSES[number];

export const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; tone: string; description: string }> = {
  unpaid: {
    label: "Unpaid",
    tone: "border-muted bg-muted/20 text-muted-foreground",
    description: "No payment has been recorded yet.",
  },
  deposit_paid: {
    label: "Deposit paid",
    tone: "border-sky-500/25 bg-sky-500/10 text-sky-300",
    description: "Deposit has been paid. Balance may still be due.",
  },
  paid: {
    label: "Paid",
    tone: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    description: "Full amount has been paid.",
  },
  balance_due: {
    label: "Balance due",
    tone: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    description: "Deposit is recorded but the remaining balance is still due.",
  },
  overtime_due: {
    label: "Overtime due",
    tone: "border-orange-500/25 bg-orange-500/10 text-orange-300",
    description: "Overtime has been added and needs approval/payment.",
  },
  failed: {
    label: "Failed",
    tone: "border-red-500/25 bg-red-500/10 text-red-300",
    description: "Payment attempt failed or was declined.",
  },
  refunded: {
    label: "Refunded",
    tone: "border-purple-500/25 bg-purple-500/10 text-purple-300",
    description: "Payment has been refunded.",
  },
  disputed: {
    label: "Disputed",
    tone: "border-red-500/30 bg-red-500/10 text-red-300",
    description: "Payment is disputed and needs admin review.",
  },
};

export const formatGBP = (amount: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);
