import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, isBefore, addHours, startOfDay } from "date-fns";
import { AlertTriangle, Pencil } from "lucide-react";

interface EditBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: {
    id: string;
    start_time: string;
    end_time: string;
    session_type: string;
    num_guests: number | null;
    notes: string | null;
    is_private: boolean | null;
    beat_needed: boolean | null;
    room_id: string;
    amendment_count?: number;
    rooms?: { name: string; color: string } | null;
  };
  isAdmin?: boolean;
  onUpdated: () => void;
}

const EditBookingModal = ({ open, onOpenChange, booking, isAdmin = false, onUpdated }: EditBookingModalProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const startDate = new Date(booking.start_time);
  const endDate = new Date(booking.end_time);
  const durationHrs = (endDate.getTime() - startDate.getTime()) / 3600000;

  const [date, setDate] = useState(format(startDate, "yyyy-MM-dd"));
  const [startHour, setStartHour] = useState(startDate.getHours());
  const [duration, setDuration] = useState(durationHrs);
  const [sessionType, setSessionType] = useState(booking.session_type);
  const [guests, setGuests] = useState(booking.num_guests ?? 0);
  const [notes, setNotes] = useState(booking.notes ?? "");
  const [isPrivate, setIsPrivate] = useState(booking.is_private ?? true);

  const amendmentCount = (booking as any).amendment_count ?? 0;
  const remaining = 2 - amendmentCount;
  const tooSoon = isBefore(startDate, addHours(new Date(), 24));
  const canEdit = isAdmin || (!tooSoon && remaining > 0);

  const handleSave = async () => {
    if (!canEdit) return;
    setSaving(true);

    const newStart = new Date(date);
    newStart.setHours(startHour, 0, 0, 0);
    const newEnd = new Date(newStart);
    newEnd.setHours(newStart.getHours() + duration);

    const updateData: Record<string, any> = {
      start_time: newStart.toISOString(),
      end_time: newEnd.toISOString(),
      session_type: sessionType,
      num_guests: guests,
      notes,
      is_private: isPrivate,
    };

    if (!isAdmin) {
      updateData.amendment_count = amendmentCount + 1;
    }

    const { error } = await supabase.from("bookings").update(updateData).eq("id", booking.id);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Booking updated ✅", description: `${isAdmin ? "" : `${remaining - 1} amendment(s) remaining`}` });
      onUpdated();
      onOpenChange(false);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-foreground flex items-center gap-2">
            <Pencil className="w-5 h-5 text-primary" /> EDIT BOOKING
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {booking.rooms?.name?.toUpperCase()} — Room cannot be changed. Cancel & rebook to switch rooms.
          </DialogDescription>
        </DialogHeader>

        {!canEdit && !isAdmin ? (
          <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              {tooSoon ? (
                <p className="text-sm text-foreground">This session is less than 24 hours away. Please contact us directly to make changes.</p>
              ) : (
                <p className="text-sm text-foreground">You've used both amendments for this booking. Please contact us for further changes.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {!isAdmin && (
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <span className="px-2 py-0.5 rounded bg-primary/20 text-primary">{remaining} amendment{remaining !== 1 ? "s" : ""} remaining</span>
              </div>
            )}

            <div>
              <Label className="text-muted-foreground">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 bg-background" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-muted-foreground">Start Hour</Label>
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(Number(e.target.value))}
                  className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm focus:border-interactive focus:ring-1 focus:ring-interactive focus:outline-none"
                >
                  {Array.from({ length: 16 }, (_, i) => i + 8).map((h) => (
                    <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-muted-foreground">Duration (hrs)</Label>
                <Input type="number" min={1} max={16} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="mt-1 bg-background" />
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground">Session Type</Label>
              <Input value={sessionType} onChange={(e) => setSessionType(e.target.value)} className="mt-1 bg-background" />
            </div>

            <div>
              <Label className="text-muted-foreground">Guests</Label>
              <Input type="number" min={0} max={20} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="mt-1 bg-background" />
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="accent-interactive" />
              Private session
            </label>

            <div>
              <Label className="text-muted-foreground">Notes</Label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm resize-none focus:border-interactive focus:ring-1 focus:ring-interactive focus:outline-none" />
            </div>

            <Button onClick={handleSave} disabled={saving || !sessionType} className="w-full font-bebas text-lg tracking-wider h-12">
              {saving ? "SAVING..." : "SAVE CHANGES"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditBookingModal;
