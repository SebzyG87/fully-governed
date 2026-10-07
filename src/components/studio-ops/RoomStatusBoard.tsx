import { DoorOpen, Timer } from "lucide-react";
import { ROOM_STATUS_LABELS, ROOM_STATUS_TONES, type StudioRoomStatus } from "@/lib/mockStudioOps";
import { DemoDataBadge, StudioOpsBadge, StudioOpsCard, StudioOpsSection } from "./StudioOpsPrimitives";

export const RoomStatusBoard = ({ rooms, isDemoData = false, onInspect }: { rooms: StudioRoomStatus[]; isDemoData?: boolean; onInspect?: (room: StudioRoomStatus) => void }) => (
  <StudioOpsSection title="Live Room Status" eyebrow="Rooms" icon={DoorOpen} action={isDemoData ? <DemoDataBadge /> : undefined}>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {rooms.map((room) => (
        <button key={room.id} type="button" onClick={() => onInspect?.(room)} className="text-left">
        <StudioOpsCard className="space-y-4 transition-colors hover:border-primary/40">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bebas text-2xl tracking-wide text-foreground">{room.roomName}</h3>
              <p className="text-xs text-muted-foreground">{room.currentSession || room.currentClient || "No active session"}</p>
            </div>
            <StudioOpsBadge tone={ROOM_STATUS_TONES[room.status]}>{ROOM_STATUS_LABELS[room.status]}</StudioOpsBadge>
          </div>
          <div className="grid gap-2 text-xs text-muted-foreground">
            <p>Client/session: <span className="text-foreground">{room.currentClient || "None"}</span></p>
            <p>Producer: <span className="text-foreground">{room.assignedProducer || "Not assigned"}</span></p>
            <p>Next: <span className="text-foreground">{room.nextBooking || "No booking queued"}</span></p>
            <p>Cleaning: <span className="text-foreground">{room.cleaningStatus || "No cleaning note"}</span></p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card/70 p-3 text-sm text-muted-foreground">
            <Timer className="h-4 w-4 text-primary" />
            {room.timeRemaining || "Time unavailable"}
          </div>
        </StudioOpsCard>
        </button>
      ))}
    </div>
  </StudioOpsSection>
);
