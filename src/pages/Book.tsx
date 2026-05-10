import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, ChevronLeft, ChevronRight, Clock, Calendar, MessageSquare, Zap, CreditCard, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, isBefore, startOfDay, addDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Tables } from "@/integrations/supabase/types";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// STRIPE_KEY_NEEDED — replace with real publishable key when ready
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

interface PaymentFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

const PaymentForm = ({ amount, onSuccess, onCancel }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError("");
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    if (confirmError) {
      setError(confirmError.message || "Payment failed");
      setProcessing(false);
    } else if (paymentIntent?.status === "succeeded") {
      toast({ title: "Payment confirmed!" });
      onSuccess(paymentIntent.id);
    } else {
      setError("Payment did not complete — please try again.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
        <p className="text-xs text-muted-foreground font-mono">TOTAL TO PAY</p>
        <p className="font-mono text-3xl text-primary font-bold">£{amount}</p>
      </div>
      <PaymentElement />
      {error && <p className="text-destructive text-xs">{error}</p>}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 font-bebas tracking-wider" disabled={processing}>
          CANCEL
        </Button>
        <Button type="submit" className="flex-1 font-bebas text-lg tracking-wider" disabled={processing || !stripe}>
          {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : `PAY £${amount}`}
        </Button>
      </div>
      <p className="text-xs text-center text-muted-foreground font-barlow">Payments processed securely by Stripe.</p>
    </form>
  );
};

type Room = Tables<"rooms">;
type Booking = Tables<"bookings">;

const HOURS = Array.from({ length: 16 }, (_, i) => i + 8);

const CUSTOMER_DURATIONS = [
  { label: "4 Hours", value: 4 },
  { label: "8 Hours", value: 8 },
  { label: "12 Hours", value: 12 },
  { label: "Full Day (16hr)", value: 16 },
];

const ADMIN_DURATIONS = [
  { label: "1 Hour", value: 1 },
  { label: "2 Hours", value: 2 },
  { label: "3 Hours", value: 3 },
  { label: "4 Hours", value: 4 },
  { label: "6 Hours", value: 6 },
  { label: "8 Hours", value: 8 },
  { label: "Full Day (16hr)", value: 16 },
];

const roomColorMap: Record<string, string> = {
  "#D4AF37": "border-room-studio text-room-studio",
  "#C0392B": "border-room-multi text-room-multi",
  "#7B2FBE": "border-room-content text-room-content",
};

const roomBgMap: Record<string, string> = {
  "#D4AF37": "bg-room-studio",
  "#C0392B": "bg-room-multi",
  "#7B2FBE": "bg-room-content",
};

const roomNameMapping: Record<string, string> = {
  "Studio A (The Gold Room)": "Recording Studio",
  "Studio B (The Neon Suite)": "Multi-Use Room",
  "The Creator Hub": "Content Creation Centre",
  "Room 1B — Recording Studio": "Recording Studio",
  "Room 1A — Multi-Use Room": "Multi-Use Room",
  "Room 2 — Content Creation Centre": "Content Creation Centre"
};

interface Engineer {
  id: string;
  name: string;
  speciality: string | null;
}

const calculateSessionPrice = (roomName: string, duration: number, engineer?: string): number | null => {
  const roomLabel = roomName;
  
  if (roomLabel === "Recording Studio") {
    if (duration === 16) return 250;
    if (duration === 4) return 100;
    const rate = !engineer || engineer === "" ? 15 : 30;
    return duration * rate;
  }
  
  if (roomLabel === "Multi-Use Room") {
    if (duration === 16) return 450;
    if (duration === 4) return 200;
    return duration * 60;
  }
  
  if (roomLabel === "Content Creation Centre") {
    const rate = !engineer || engineer === "" ? 40 : 75;
    return duration * rate;
  }
  
  return null;
};

const Book = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [sessionType, setSessionType] = useState("");
  const [numGuests, setNumGuests] = useState(0);
  const [notes, setNotes] = useState("");
  const [beatNeeded, setBeatNeeded] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);
  const [securityRequired, setSecurityRequired] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [selectedEngineer, setSelectedEngineer] = useState("");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteName, setQuoteName] = useState("");
  const [quoteEmail, setQuoteEmail] = useState("");
  const [quoteDetails, setQuoteDetails] = useState("");
  const [monthBookings, setMonthBookings] = useState<Booking[]>([]);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [pendingBookingPrice, setPendingBookingPrice] = useState<number | null>(null);

  const isAdmin = role === "creator_admin";
  const isFamily = role === "family";
  const hasFlexibleBooking = isAdmin || isFamily;
  const durationOptions = hasFlexibleBooking ? ADMIN_DURATIONS : CUSTOMER_DURATIONS;

  // --- localStorage draft persistence ---
  const DRAFT_KEY = "fg_booking_draft";

  const saveDraft = useCallback(() => {
    if (!selectedRoom) return;
    const draft = {
      roomId: selectedRoom.id,
      date: selectedDate?.toISOString() ?? null,
      duration: selectedDuration,
      sessionType,
      numGuests,
      notes,
      selectedEngineer,
      savedAt: Date.now(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [selectedRoom, selectedDate, selectedDuration, sessionType, numGuests, notes, selectedEngineer]);

  // Save draft on field change (debounced via effect)
  useEffect(() => {
    if (selectedRoom && (sessionType || notes || numGuests > 0)) {
      saveDraft();
    }
  }, [sessionType, notes, numGuests, selectedEngineer, selectedDate, selectedDuration, selectedRoom, saveDraft]);

  // Check for draft on mount
  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        const draft = JSON.parse(raw);
        // Only show if less than 24hrs old
        if (Date.now() - draft.savedAt < 86400000 && (draft.sessionType || draft.notes)) {
          setShowDraftBanner(true);
        }
      } catch { }
    }
  }, []);

  const restoreDraft = () => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw);
      const room = rooms.find(r => r.id === draft.roomId);
      if (room) setSelectedRoom(room);
      if (draft.date) setSelectedDate(new Date(draft.date));
      if (draft.duration) setSelectedDuration(draft.duration);
      if (draft.sessionType) setSessionType(draft.sessionType);
      if (draft.numGuests) setNumGuests(draft.numGuests);
      if (draft.notes) setNotes(draft.notes);
      if (draft.selectedEngineer) setSelectedEngineer(draft.selectedEngineer);
    } catch { }
    setShowDraftBanner(false);
  };

  const dismissDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setShowDraftBanner(false);
  };

  useEffect(() => {
    if (selectedDuration === null) {
      setSelectedDuration(hasFlexibleBooking ? 1 : 4);
    }
  }, [hasFlexibleBooking, selectedDuration]);

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { state: { from: "/book" } });
  }, [loading, user, navigate]);

  useEffect(() => {
    supabase.from("rooms").select("*").then(({ data }) => {
      if (data) {
        setRooms(data);
        setSelectedRoom(data[0] ?? null);
      }
    });
    supabase.from("engineers").select("id, name, speciality").eq("availability", "available").then(({ data }) => {
      setEngineers((data as Engineer[]) || []);
    });
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!selectedRoom || !selectedDate) return;
    const dayStart = startOfDay(selectedDate).toISOString();
    const dayEnd = new Date(startOfDay(selectedDate).getTime() + 86400000).toISOString();
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("room_id", selectedRoom.id)
      .eq("status", "confirmed")
      .gte("start_time", dayStart)
      .lt("end_time", dayEnd);
    setBookings(data ?? []);
  }, [selectedRoom, selectedDate]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // Fetch all bookings for the visible month to calculate per-day availability dots
  const fetchMonthBookings = useCallback(async () => {
    if (!selectedRoom) return;
    const monthStart = startOfMonth(currentMonth).toISOString();
    const monthEnd = new Date(endOfMonth(currentMonth).getTime() + 86400000).toISOString();
    const { data } = await supabase
      .from("bookings")
      .select("start_time, end_time")
      .eq("room_id", selectedRoom.id)
      .eq("status", "confirmed")
      .gte("start_time", monthStart)
      .lt("end_time", monthEnd);
    setMonthBookings((data as Booking[]) ?? []);
  }, [selectedRoom, currentMonth]);

  useEffect(() => { fetchMonthBookings(); }, [fetchMonthBookings]);

  useEffect(() => {
    if (!selectedRoom) return;
    const channel = supabase
      .channel(`bookings-${selectedRoom.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `room_id=eq.${selectedRoom.id}` }, () => { fetchBookings(); fetchMonthBookings(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedRoom, fetchBookings, fetchMonthBookings]);

  // Per-day availability: green (all open), amber (partial), red (fully booked)
  const getDayAvailability = useCallback((day: Date): "open" | "partial" | "full" => {
    const dayStart = startOfDay(day);
    const bookedSet = new Set<number>();
    monthBookings.forEach((b) => {
      const bStart = new Date(b.start_time);
      const bEnd = new Date(b.end_time);
      if (bStart < new Date(dayStart.getTime() + 86400000) && bEnd > dayStart) {
        const s = Math.max(bStart.getHours(), 8);
        const e = Math.min(bEnd.getHours() || 24, 24);
        for (let h = s; h < e; h++) bookedSet.add(h);
      }
    });
    if (bookedSet.size === 0) return "open";
    if (bookedSet.size >= 16) return "full";
    return "partial";
  }, [monthBookings]);

  // Next Available Slot finder
  const findNextAvailableSlot = useCallback(async () => {
    if (!selectedRoom) return;
    const dur = selectedDuration ?? (hasFlexibleBooking ? 1 : 4);
    // Search up to 30 days from today
    for (let d = 0; d < 30; d++) {
      const day = addDays(startOfDay(new Date()), d);
      const dayStart = day.toISOString();
      const dayEnd = new Date(day.getTime() + 86400000).toISOString();
      const { data } = await supabase
        .from("bookings")
        .select("start_time, end_time")
        .eq("room_id", selectedRoom.id)
        .eq("status", "confirmed")
        .gte("start_time", dayStart)
        .lt("end_time", dayEnd);
      const dayBooked = new Set<number>();
      (data ?? []).forEach((b: any) => {
        const s = new Date(b.start_time).getHours();
        const e = new Date(b.end_time).getHours();
        for (let h = s; h < e; h++) dayBooked.add(h);
      });
      for (const h of HOURS) {
        if (h + dur > 24) continue;
        let available = true;
        for (let i = 0; i < dur; i++) {
          if (dayBooked.has(h + i)) { available = false; break; }
        }
        if (available) {
          setSelectedDate(day);
          setCurrentMonth(day);
          // We need to wait for bookings to load for the new date, then set hour
          setTimeout(() => setSelectedHour(h), 300);
          toast({ title: `Next slot: ${format(day, "EEE d MMM")} at ${String(h).padStart(2, "0")}:00` });
          return;
        }
      }
    }
    toast({ title: "No availability", description: "No open slots found in the next 30 days.", variant: "destructive" });
  }, [selectedRoom, selectedDuration, hasFlexibleBooking, toast]);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const bookedHours = useMemo(() => {
    const set = new Set<number>();
    bookings.forEach((b) => {
      const s = new Date(b.start_time).getHours();
      const e = new Date(b.end_time).getHours();
      for (let h = s; h < e; h++) set.add(h);
    });
    return set;
  }, [bookings]);

  const duration = selectedDuration ?? (hasFlexibleBooking ? 1 : 4);

  const getSlotStatus = (h: number): "available" | "booked" | "partial" => {
    if (bookedHours.has(h)) return "booked";
    if (h + duration > 24) return "partial";
    for (let i = 0; i < duration; i++) {
      if (bookedHours.has(h + i)) return "partial";
    }
    return "available";
  };

  const allBooked = HOURS.every((h) => getSlotStatus(h) !== "available");

  const saveBooking = async (stripePaymentId?: string) => {
    if (!selectedRoom || !selectedDate || selectedHour === null || !sessionType || !user) return;
    const start = new Date(selectedDate);
    start.setHours(selectedHour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + duration);

    const { error } = await supabase.from("bookings").insert({
      room_id: selectedRoom.id,
      user_id: user.id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      session_type: sessionType,
      num_guests: numGuests,
      beat_needed: beatNeeded,
      is_private: isPrivate,
      security_required: securityRequired,
      notes: [notes, selectedEngineer ? `[Engineer: ${selectedEngineer}]` : ""].filter(Boolean).join(" "),
      stripe_payment_id: stripePaymentId ?? null,
    });

    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Session booked! 🎤" });
      // Award loyalty points: 10 pts per booked hour
      const loyaltyPts = duration * 10;
      await supabase.from("fg_loyalty_points" as any).insert({
        user_id: user.id,
        points: loyaltyPts,
        reason: `Session booked — ${roomNameMapping[selectedRoom.name] || selectedRoom.name} (${duration}hr)`,
        source: "booking",
        reference_id: null,
      });
      // Increment profile loyalty_points total
      const { data: currentProfile } = await supabase.from("profiles").select("loyalty_points").eq("user_id", user.id).single();
      await supabase.from("profiles").update({ loyalty_points: (currentProfile?.loyalty_points || 0) + loyaltyPts }).eq("user_id", user.id);
      setSelectedHour(null);
      setSessionType("");
      setNotes("");
      setSelectedEngineer("");
      setShowPaymentModal(false);
      setPaymentClientSecret(null);
      localStorage.removeItem(DRAFT_KEY);
      setShowDraftBanner(false);
      fetchBookings();
    }
  };

  const handleBook = async () => {
    if (!selectedRoom || !selectedDate || selectedHour === null || !sessionType || !user) return;

    for (let h = selectedHour; h < selectedHour + duration; h++) {
      if (bookedHours.has(h)) {
        toast({ title: "Time conflict", description: "Some hours in this block are already booked.", variant: "destructive" });
        return;
      }
    }

    if (!hasFlexibleBooking && selectedHour + duration > 24) {
      toast({ title: "Invalid time", description: "Session cannot extend past midnight.", variant: "destructive" });
      return;
    }

    const price = calculateSessionPrice(roomNameMapping[selectedRoom.name] || selectedRoom.name, duration, selectedEngineer);

    if (!price || price === 0) {
      await saveBooking();
      return;
    }

    // Initiate Stripe payment
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          amount: price,
          type: "booking",
          roomName: roomNameMapping[selectedRoom.name] || selectedRoom.name,
          bookingDate: selectedDate.toISOString(),
        },
      });

      if (error || data?.error) {
        throw new Error(data?.error || "Could not create payment session");
      }

      setPendingBookingPrice(price);
      setPaymentClientSecret(data.clientSecret);
      setShowPaymentModal(true);
    } catch (err: any) {
      toast({ title: "Payment setup failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Crown className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grain-overlay" />
      <header className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-primary" />
            <span className="font-bebas text-2xl tracking-widest text-foreground">BOOK A SESSION</span>
          </Link>
          <Button variant="outline" size="sm" onClick={() => setShowQuoteModal(true)} className="font-barlow text-xs">
            <MessageSquare className="w-4 h-4 mr-1" /> Request a Quote
          </Button>
        </div>
      </header>

      <div className="container py-8 space-y-6">
        {/* Draft Banner */}
        {showDraftBanner && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/10 border border-primary/30 rounded-lg p-4 flex items-center justify-between">
            <p className="text-sm text-foreground font-barlow">You have an unfinished booking. Continue where you left off?</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={restoreDraft} className="font-bebas tracking-wider">RESTORE</Button>
              <Button size="sm" variant="ghost" onClick={dismissDraft}>Dismiss</Button>
            </div>
          </motion.div>
        )}

        {/* Room Selector */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {rooms.map((room) => {
            const rc = roomColorMap[room.color] ?? "";
            const active = selectedRoom?.id === room.id;
            const displayName = roomNameMapping[room.name] || room.name;
            return (
              <button
                key={room.id}
                onClick={() => { setSelectedRoom(room); setSelectedDate(null); setSelectedHour(null); }}
                className={`flex-shrink-0 px-5 py-3 rounded-lg border-2 transition-all font-bebas text-lg tracking-wider ${active ? `${rc} border-current bg-current/10 shadow-[0_0_15px_rgba(0,0,0,0.2)]` : "bg-card border-border text-white hover:border-interactive hover:text-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))]"}`}
              >
                {displayName.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Duration Selector */}
        {selectedRoom && (
          <div className="bg-card border border-border rounded-lg p-4">
            <Label className="text-muted-foreground text-xs font-mono tracking-wider mb-2 block">SESSION DURATION</Label>
            <div className="flex flex-wrap gap-2">
              {durationOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSelectedDuration(opt.value); setSelectedHour(null); }}
                  className={`px-4 py-2 rounded-md text-sm font-mono transition-all ${selectedDuration === opt.value ? "bg-primary text-black font-bold shadow-[0_0_10px_rgba(212,175,55,0.4)]" : "bg-card border border-border text-white hover:bg-accent hover:text-foreground"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedRoom && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="text-muted-foreground hover:text-interactive transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                <h2 className="text-2xl text-foreground">{format(currentMonth, "MMMM yyyy").toUpperCase()}</h2>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="text-muted-foreground hover:text-interactive transition-colors"><ChevronRight className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <div key={i} className="text-xs text-muted-foreground font-mono py-2">{d}</div>
                ))}
                {Array.from({ length: (days[0].getDay() + 6) % 7 }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {days.map((day) => {
                  const past = isBefore(day, startOfDay(new Date()));
                  const selected = selectedDate && isSameDay(day, selectedDate);
                  const today = isToday(day);
                  const avail = !past ? getDayAvailability(day) : null;
                  return (
                    <button
                      key={day.toISOString()}
                      disabled={past}
                      onClick={() => { setSelectedDate(day); setSelectedHour(null); }}
                      className={`py-1.5 rounded text-sm font-mono transition-all flex flex-col items-center gap-0.5 ${past ? "text-muted-foreground/30 cursor-not-allowed" : selected ? `${roomBgMap[selectedRoom.color] ?? "bg-primary"} text-primary-foreground font-bold` : today ? "ring-1 ring-primary text-foreground" : "text-foreground hover:bg-accent"}`}
                    >
                      {format(day, "d")}
                      {avail && !past && (
                        <span className={`w-1.5 h-1.5 rounded-full ${avail === "open" ? "bg-emerald-500" : avail === "partial" ? "bg-amber-500" : "bg-destructive"}`} />
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Next Available Slot button */}
              <Button variant="outline" size="sm" onClick={findNextAvailableSlot} className="w-full mt-3 font-mono text-xs">
                <Zap className="w-3 h-3 mr-1" /> Next Available Slot
              </Button>
            </motion.div>

            {/* Time Slots + Form */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {selectedDate ? (
                <>
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-xl text-foreground mb-1">{format(selectedDate, "EEEE, d MMMM").toUpperCase()}</h3>
                    <p className="text-xs text-muted-foreground mb-2 font-mono">
                      {isAdmin ? "Admin access — flexible duration" : isFamily ? "Family tier — flexible duration" : `Customer — ${duration}hr blocks`}
                    </p>
                    <div className="flex gap-4 mb-4 text-xs font-mono">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500" />Available</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-destructive/20 border border-destructive" />Booked</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500/20 border border-amber-500" />Partial</span>
                    </div>
                    {allBooked ? (
                      <div className="text-center py-8">
                        <p className="text-destructive font-bebas text-xl tracking-wider">FULLY BOOKED</p>
                        <p className="text-muted-foreground text-sm mt-1">Try another date or room</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {HOURS.map((h) => {
                          const status = getSlotStatus(h);
                          const isSelectedBlock = selectedHour !== null && h >= selectedHour && h < selectedHour + duration;

                          let bgClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20";
                          let scaleClass = "";

                          if (status === "booked") {
                            bgClass = "bg-destructive/20 text-destructive border border-destructive/30 line-through cursor-not-allowed opacity-50";
                          } else if (status === "partial") {
                            bgClass = "bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-not-allowed opacity-75";
                          } else if (isSelectedBlock) {
                            bgClass = `${roomBgMap[selectedRoom!.color] ?? "bg-primary"} text-primary-foreground font-bold ring-2 ring-primary border-transparent`;
                            scaleClass = "scale-105 z-10 shadow-lg";
                          }

                          return (
                            <button
                              key={h}
                              disabled={status !== "available" && !isSelectedBlock}
                              onClick={() => status === "available" && setSelectedHour(h)}
                              className={`py-2 text-sm font-mono transition-all rounded ${bgClass} ${scaleClass}`}
                            >
                              {String(h).padStart(2, "0")}:00
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {selectedHour !== null && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-6 space-y-4">
                      <div className="flex items-center gap-2 text-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-mono text-sm">
                          {String(selectedHour).padStart(2, "0")}:00 — {String(selectedHour + duration).padStart(2, "0")}:00 ({duration}hr{duration > 1 ? "s" : ""})
                        </span>
                      </div>

                      <div>
                        <Label className="text-muted-foreground">Session Type</Label>
                        <select
                          value={sessionType}
                          onChange={(e) => setSessionType(e.target.value)}
                          className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm focus:border-interactive focus:ring-1 focus:ring-interactive focus:outline-none transition-colors"
                        >
                          <option value="">Select type...</option>
                          {(selectedRoom!.session_types ?? []).map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      {engineers.length > 0 && (
                        <div>
                          <Label className="text-muted-foreground">In-House Engineer / Producer</Label>
                          <select
                            value={selectedEngineer}
                            onChange={(e) => setSelectedEngineer(e.target.value)}
                            className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm focus:border-interactive focus:ring-1 focus:ring-interactive focus:outline-none transition-colors"
                          >
                            <option value="">None (self-service)</option>
                            {engineers.map((eng) => (
                              <option key={eng.id} value={eng.name}>{eng.name}{eng.speciality ? ` — ${eng.speciality}` : ""}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">Guests</Label>
                          <Input type="number" min={0} max={20} value={numGuests} onChange={(e) => setNumGuests(Number(e.target.value))} className="mt-1 bg-background" />
                        </div>
                        <div className="flex flex-col gap-2 mt-6">
                          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer group">
                            <input type="checkbox" checked={beatNeeded} onChange={(e) => setBeatNeeded(e.target.checked)} className="accent-interactive" />
                            <span className="group-hover:text-interactive transition-colors">Beat needed</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer group">
                            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="accent-interactive" />
                            <span className="group-hover:text-interactive transition-colors">Private session</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer group">
                            <input type="checkbox" checked={securityRequired} onChange={(e) => setSecurityRequired(e.target.checked)} className="accent-interactive" />
                            <span className="group-hover:text-interactive transition-colors">Security required</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <Label className="text-muted-foreground">Notes</Label>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm resize-none focus:border-interactive focus:ring-1 focus:ring-interactive focus:outline-none transition-colors" placeholder="Any special requests..." />
                      </div>

                      <div className="pt-2 border-t border-border">
                        <div className="flex justify-between items-center bg-secondary/30 p-3 rounded-md border border-primary/20">
                          <span className="font-bebas text-lg tracking-wider text-muted-foreground">TOTAL PRICE</span>
                          <span className="font-mono text-2xl text-primary font-bold">
                            £{calculateSessionPrice(roomNameMapping[selectedRoom.name] || selectedRoom.name, duration, selectedEngineer) || "—"}
                          </span>
                        </div>
                      </div>

                      <Button onClick={handleBook} disabled={submitting || !sessionType} className="w-full font-bebas text-lg tracking-wider h-12">
                        {submitting ? "BOOKING..." : "CONFIRM BOOKING"}
                      </Button>
                    </motion.div>
                  )}
                </>
              ) : selectedRoom && selectedDuration ? (
                <div className="bg-card border border-border rounded-lg p-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Calendar className="w-10 h-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bebas tracking-widest text-foreground">YOU ARE BOOKING:</p>
                    <div className="p-3 bg-background/50 rounded-md border border-border w-full max-w-xs mx-auto">
                      <p className="text-primary font-bebas text-lg tracking-wide">{roomNameMapping[selectedRoom.name]?.toUpperCase() || selectedRoom.name.toUpperCase()}</p>
                      <p className="text-muted-foreground font-barlow text-sm">{selectedDuration} HOUR SESSION</p>
                      <p className="text-foreground font-mono font-bold mt-1 text-base">£{calculateSessionPrice(roomNameMapping[selectedRoom.name] || selectedRoom.name, selectedDuration) || "—"}</p>
                    </div>
                  </div>
                  <p className="text-foreground animate-pulse font-barlow text-lg mt-4">Select a date to continue →</p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Select a room and duration to continue</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>

      {/* POA Quote Modal */}
      <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl text-foreground">REQUEST A QUOTE</DialogTitle>
            <DialogDescription className="text-muted-foreground">For bespoke sessions, events, or POA services — tell us what you need and we'll get back to you.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Your Name</Label>
              <Input value={quoteName} onChange={(e) => setQuoteName(e.target.value)} className="mt-1 bg-background" />
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <Input type="email" value={quoteEmail} onChange={(e) => setQuoteEmail(e.target.value)} className="mt-1 bg-background" />
            </div>
            <div>
              <Label className="text-muted-foreground">What do you need?</Label>
              <textarea value={quoteDetails} onChange={(e) => setQuoteDetails(e.target.value)} rows={4} className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm resize-none focus:border-interactive focus:ring-1 focus:ring-interactive focus:outline-none transition-colors" placeholder="Describe your session, event, or requirements..." />
            </div>
            <Button
              className="w-full font-bebas text-lg tracking-wider h-12"
              onClick={() => {
                toast({ title: "Quote request sent! 📩", description: "We'll get back to you within 24 hours." });
                setShowQuoteModal(false);
                setQuoteName("");
                setQuoteEmail("");
                setQuoteDetails("");
              }}
              disabled={!quoteName || !quoteEmail || !quoteDetails}
            >
              SEND REQUEST
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stripe Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={(open) => { if (!open) { setShowPaymentModal(false); setPaymentClientSecret(null); } }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-bebas text-2xl text-foreground tracking-wider flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> SECURE PAYMENT
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Complete your booking for {selectedRoom && (roomNameMapping[selectedRoom.name] || selectedRoom.name)}.
            </DialogDescription>
          </DialogHeader>
          {paymentClientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: paymentClientSecret,
                appearance: { theme: "night", variables: { colorPrimary: "#D4AF37" } },
              }}
            >
              <PaymentForm
                amount={pendingBookingPrice ?? 0}
                onSuccess={(paymentIntentId) => saveBooking(paymentIntentId)}
                onCancel={() => { setShowPaymentModal(false); setPaymentClientSecret(null); }}
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Book;
