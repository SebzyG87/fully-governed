import { PAYMENT_STATUS_META, type PaymentStatus } from "@/lib/paymentStatus";

export const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => {
  const meta = PAYMENT_STATUS_META[status];

  return (
    <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${meta.tone}`}>
      {meta.label}
    </span>
  );
};
