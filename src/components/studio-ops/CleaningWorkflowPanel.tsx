import { useState } from "react";
import { ClipboardCheck, Flag } from "lucide-react";
import type { CleaningJob } from "@/lib/mockStudioOps";
import { DemoDataBadge, StudioOpsBadge, StudioOpsCard, StudioOpsSection } from "./StudioOpsPrimitives";
import { Button } from "@/components/ui/button";

const PRIORITY_TONES: Record<CleaningJob["priority"], string> = {
  low: "border-border bg-muted/20 text-muted-foreground",
  medium: "border-sky-500/25 bg-sky-500/10 text-sky-300",
  high: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  urgent: "border-red-500/25 bg-red-500/10 text-red-300",
};

export const CleaningWorkflowPanel = ({ jobs, isDemoData = false, onInspect }: { jobs: CleaningJob[]; isDemoData?: boolean; onInspect?: (job: CleaningJob) => void }) => {
  const [readyRooms, setReadyRooms] = useState<string[]>([]);

  return (
    <StudioOpsSection title="Cleaning Workflow" eyebrow="Turnaround" icon={ClipboardCheck} action={isDemoData ? <DemoDataBadge /> : undefined}>
      <div className="grid gap-3 xl:grid-cols-2">
        {jobs.map((job) => {
          const ready = readyRooms.includes(job.id);
          return (
          <StudioOpsCard key={job.id} className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-bebas text-2xl tracking-wide text-foreground">{job.roomName}</h3>
              <p className="text-xs text-muted-foreground">Ended {job.sessionEnded} · clean {job.cleaningWindow} · {job.assignedTo || "Unassigned"}</p>
            </div>
            <StudioOpsBadge tone={ready ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : PRIORITY_TONES[job.priority]}>{ready ? "ready" : job.priority}</StudioOpsBadge>
          </div>
          <div className="grid gap-2">
            {job.checklist.map((item) => (
              <label key={item} className="flex items-center gap-3 rounded-xl border border-border bg-card/70 p-3 text-sm text-muted-foreground">
                <input type="checkbox" className="h-4 w-4 accent-primary" />
                {item}
              </label>
            ))}
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-100">
            <Flag className="mb-2 h-4 w-4 text-amber-300" />
            {job.issueNotes}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button className="font-bebas tracking-wider" onClick={() => setReadyRooms((rooms) => rooms.includes(job.id) ? rooms : [...rooms, job.id])}>
              {ready ? "Room Ready Logged" : "Mark Room Ready"}
            </Button>
            <Button variant="outline" className="font-bebas tracking-wider" onClick={() => onInspect?.(job)}>
              Inspect Workflow
            </Button>
          </div>
        </StudioOpsCard>
          );
        })}
      </div>
    </StudioOpsSection>
  );
};
