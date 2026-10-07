import { Radio } from "lucide-react";
import type { LiveSession } from "@/lib/mockStudioOps";
import { DemoDataBadge, StudioOpsSection } from "./StudioOpsPrimitives";
import { SessionTimerCard } from "./SessionTimerCard";

export const LiveSessionBoard = ({ sessions, isDemoData = false, onInspect }: { sessions: LiveSession[]; isDemoData?: boolean; onInspect?: (session: LiveSession) => void }) => (
  <StudioOpsSection title="Live Session Board" eyebrow="Now" icon={Radio} action={isDemoData ? <DemoDataBadge /> : undefined}>
    <div className="grid gap-3 xl:grid-cols-2">
      {sessions.map((session) => (
        <SessionTimerCard key={session.id} session={session} onInspect={onInspect} />
      ))}
    </div>
  </StudioOpsSection>
);
