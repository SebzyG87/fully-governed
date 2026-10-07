import { ListTodo, Route } from "lucide-react";
import type { StudioTask, TimelineEvent } from "@/lib/mockStudioOps";
import { DemoDataBadge, StudioOpsBadge, StudioOpsCard, StudioOpsSection } from "./StudioOpsPrimitives";

const TASK_TONES: Record<StudioTask["status"], string> = {
  to_do: "border-border bg-muted/20 text-muted-foreground",
  in_progress: "border-primary/25 bg-primary/10 text-primary",
  blocked: "border-red-500/25 bg-red-500/10 text-red-300",
  complete: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
};

const PRIORITY_TONES: Record<StudioTask["priority"], string> = {
  low: "text-muted-foreground",
  medium: "text-sky-300",
  high: "text-amber-300",
  urgent: "text-red-300",
};

export const TaskPanel = ({ tasks, isDemoData = false, onInspect }: { tasks: StudioTask[]; isDemoData?: boolean; onInspect?: (task: StudioTask) => void }) => (
  <StudioOpsSection title="Tasks" eyebrow="Operational queue" icon={ListTodo} action={isDemoData ? <DemoDataBadge /> : undefined}>
    <div className="space-y-3">
      {tasks.map((task) => (
        <button key={task.id} type="button" onClick={() => onInspect?.(task)} className="w-full text-left">
        <StudioOpsCard className="transition-colors hover:border-primary/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-bebas text-xl tracking-wide text-foreground">{task.title}</h3>
              <p className="text-xs text-muted-foreground">{task.linkedSession} · due {task.dueTime}</p>
            </div>
            <StudioOpsBadge tone={TASK_TONES[task.status]}>{task.status.replace("_", " ")}</StudioOpsBadge>
          </div>
          <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
            <p>Assigned: <span className="text-foreground">{task.assignedTo}</span></p>
            <p>Role: <span className="text-foreground">{task.assignedRole}</span></p>
            <p>Priority: <span className={PRIORITY_TONES[task.priority]}>{task.priority}</span></p>
          </div>
          <p className="mt-3 rounded-xl bg-card/70 p-3 text-xs text-muted-foreground">{task.notes}</p>
        </StudioOpsCard>
        </button>
      ))}
    </div>
  </StudioOpsSection>
);

export const TimelinePanel = ({ events, isDemoData = false }: { events: TimelineEvent[]; isDemoData?: boolean }) => (
  <StudioOpsSection title="Session Timeline" eyebrow="Flow" icon={Route} action={isDemoData ? <DemoDataBadge /> : undefined}>
    <div className="space-y-1">
      {events.map((event, index) => (
        <div key={event.id} className="grid grid-cols-[24px_1fr] gap-3">
          <div className="flex flex-col items-center">
            <span className={`mt-1 h-3 w-3 rounded-full ${event.status === "complete" ? "bg-emerald-400" : event.status === "current" ? "bg-primary" : "bg-muted"}`} />
            {index < events.length - 1 && <span className="h-full min-h-8 w-px bg-border" />}
          </div>
          <div className="pb-4">
            <p className="text-sm text-foreground">{event.label}</p>
            <p className="text-xs text-muted-foreground">{event.time} · {event.status}</p>
          </div>
        </div>
      ))}
    </div>
  </StudioOpsSection>
);
