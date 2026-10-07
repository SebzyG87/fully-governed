import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export const StudioOpsSection = ({
  title,
  eyebrow,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  eyebrow?: string;
  icon: LucideIcon;
  children: ReactNode;
  action?: ReactNode;
}) => (
  <section className="rounded-3xl border border-border bg-card/80 p-4 shadow-xl shadow-black/20 sm:p-5">
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          {eyebrow && <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">{eyebrow}</p>}
          <h2 className="font-bebas text-2xl tracking-wider text-foreground sm:text-3xl">{title}</h2>
        </div>
      </div>
      {action}
    </div>
    {children}
  </section>
);

export const StudioOpsBadge = ({ children, tone = "border-border bg-background/60 text-muted-foreground" }: { children: ReactNode; tone?: string }) => (
  <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${tone}`}>
    {children}
  </span>
);

export const DemoDataBadge = () => (
  <StudioOpsBadge tone="border-amber-500/25 bg-amber-500/10 text-amber-200">Demo Data</StudioOpsBadge>
);

export const DemoDataNotice = () => (
  <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-100">
    Demo data is enabled for team walkthroughs. Live Supabase data is used first; labelled demo data only fills empty operational panels until real bookings exist.
  </div>
);

export const StudioOpsEmpty = ({ children }: { children: ReactNode }) => (
  <div className="rounded-2xl border border-dashed border-border bg-background/45 p-5 text-center text-sm leading-relaxed text-muted-foreground">
    {children}
  </div>
);

export const StudioOpsCard = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-border bg-background/45 p-4 ${className}`}>{children}</div>
);
