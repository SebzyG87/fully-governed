import { AlertTriangle, Clock3 } from "lucide-react";
import type { LiveSession } from "@/lib/mockStudioOps";
import { StudioOpsBadge, StudioOpsCard } from "./StudioOpsPrimitives";
import { PaymentStatusBadge } from "@/components/payments/PaymentStatusBadge";

const TIMER_TONES: Record<LiveSession["timerState"], string> = {
  not_started: "border-border bg-muted/20 text-muted-foreground",
  starting_soon: "border-sky-500/25 bg-sky-500/10 text-sky-300",
  in_progress: "border-primary/30 bg-primary/10 text-primary",
  ending_soon: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  overtime: "border-red-500/30 bg-red-500/10 text-red-300",
  completed: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
};

const TIMER_LABELS: Record<LiveSession["timerState"], string> = {
  not_started: "Not started",
  starting_soon: "Starting soon",
  in_progress: "In progress",
  ending_soon: "Ending soon",
  overtime: "Overtime",
  completed: "Completed",
};

export const SessionTimerCard = ({ session, compact = false, onInspect }: { session: LiveSession; compact?: boolean; onInspect?: (session: LiveSession) => void }) => (
  <StudioOpsCard className="space-y-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{session.roomName}</p>
        <h3 className="font-bebas text-2xl tracking-wide text-foreground">{session.artistName}</h3>
        <p className="text-xs text-muted-foreground">{session.startTime}-{session.endTime} · {session.packageName}</p>
      </div>
      <StudioOpsBadge tone={TIMER_TONES[session.timerState]}>{TIMER_LABELS[session.timerState]}</StudioOpsBadge>
    </div>
    <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
      <div className="flex items-center gap-2 text-primary">
        <Clock3 className="h-5 w-5" />
        <p className="font-mono text-2xl">{session.timeRemaining}</p>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Your booked session time has started. If you are not present, the session time is still running and your deposit/payment is being used.
      </p>
    </div>
    {!compact && (
      <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        <p>Producer: <span className="text-foreground">{session.producer}</span></p>
        <div className="flex items-center gap-2">Payment: <PaymentStatusBadge status={session.overtimeRisk ? "overtime_due" : "deposit_paid"} /></div>
        <p>Deposit: <span className="text-foreground">{session.depositStatus}</span></p>
        <p>Next action: <span className="text-foreground">{session.nextAction}</span></p>
      </div>
    )}
    {(session.overtimeRisk || session.noShowWarning) && (
      <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-100">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        {session.overtimeRisk ? "Overtime risk: confirm extension payment before continuing." : "No-show risk: session time still runs from booked start."}
      </div>
    )}
    {onInspect && (
      <button
        type="button"
        onClick={() => onInspect(session)}
        className="w-full rounded-xl border border-border bg-card/70 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        Inspect session, tasks, payment and history
      </button>
    )}
  </StudioOpsCard>
);
