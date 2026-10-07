import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, ChevronLeft, ChevronRight, Clock, Calendar, MessageSquare, Zap, CreditCard, AlertTriangle } from "lucide-react";
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
import { DEFAULT_BUFFER_MINUTES, getBufferedEndTime, getPlannedRoomBufferMinutes } from "@/lib/bookingBuffers";
import { BLOCKING_BOOKING_STATUSES } from "@/lib/bookingLifecycle";
import { getBookingPaymentRequirement } from "@/lib/bookingPolicy";
import { BookingPaymentPlaceholder } from "@/components/payments/BookingPaymentPlaceholder";
import { getPackagePricing, STUDIO_PACKAGE_PRICING } from "@/lib/mockPackages";
import { getRoomSupportRequirement } from "@/lib/studioOpsConfig";
import { getBookingPrice } from "@/lib/bookingPricing";

type Room = Tables<"rooms">;
type Booking = Tables<"bookings">;

const HOURS = Array.from({ length: 16 }, (_, i) => i + 8);

const CUSTOMER_DURATIONS = [
  { label: "2 Hours", value: 2 },
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

const getRoomPhoto = (displayName: string) => {
  if (displayName.toLowerCase().includes("recording")) return "/images/rooms/360/recording-room-01.jpeg";
  if (displayName.toLowerCase().includes("multi-use")) return "/images/rooms/360/multi-use-room-01.jpeg";
  return null;
};

const getRoomTour = (displayName: string) => displayName.toLowerCase().includes("multi-use") ? "multi-use" : "recording";

interface Engineer {
  id: string;
  name: string;
  speciality: string | null;
}

const Book = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  // Booking customisations
  const [bookingOption, setBookingOption] = useState<string>("room_only");
  const [selectedProducer, setSelectedProducer] = useState<string>("");
  const [selectedSetup, setSelectedSetup] = useState<string>("Freestyle Layout");

  useEffect(() => {
    const prodParam = searchParams.get("producer");
    if (prodParam) {
      setBookingOption("room_producer");
      setSelectedProducer(prodParam);
    }
  }, [searchParams]);

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
  const [monthBookings, setMonthBookings] = useState<Booking[]>([]);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBookingPrice, setPendingBookingPrice] = useState<number | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [roomBuffer, setRoomBuffer] = useState<number>(DEFAULT_BUFFER_MINUTES);

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
  }, [selectedRoom, sessionType, notes, numGuests, selectedEngineer, selectedDate, selectedDuration, saveDraft]);

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
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
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
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
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

  // Fetch the per-room buffer from fg_room_buffers via the public RPC helper.
  useEffect(() => {
    if (!selectedRoom) return;
    const plannedFallback = getPlannedRoomBufferMinutes(roomNameMapping[selectedRoom.name] || selectedRoom.name);
    setRoomBuffer(plannedFallback);
    supabase
      .rpc("fg_get_room_buffer", { _room_id: selectedRoom.id })
      .then(
        ({ data }) => { if (typeof data === "number") setRoomBuffer(data); },
        () => setRoomBuffer(plannedFallback),
      );
  }, [selectedRoom]);

  useEffect(() => {
    supabase.from("rooms").select("*").then(({ data }) => {
      if (data) {
        setRooms(data);
        setSelectedRoom(data[0] ?? null);
      }
    }, () => {
      setRooms([]);
      setSelectedRoom(null);
    });
    supabase.from("engineers").select("id, name, speciality").eq("availability", "available").then(({ data }) => {
      setEngineers((data as Engineer[]) || []);
    }, () => setEngineers([]));
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!selectedRoom || !selectedDate) return;
    const dayStart = startOfDay(selectedDate).toISOString();
    const dayEnd = new Date(startOfDay(selectedDate).getTime() + 86400000).toISOString();
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("room_id", selectedRoom.id)
      .in("status", BLOCKING_BOOKING_STATUSES)
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
      .select("start_time, end_time, status")
      .eq("room_id", selectedRoom.id)
      .in("status", BLOCKING_BOOKING_STATUSES)
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
      const bEnd = getBufferedEndTime(b.end_time, roomBuffer);
      if (bStart < new Date(dayStart.getTime() + 86400000) && bEnd > dayStart) {
        const s = Math.max(bStart.getHours(), 8);
        const e = Math.min(bEnd.getHours() || 24, 24);
        for (let h = s; h < e; h++) bookedSet.add(h);
      }
    });
    if (bookedSet.size === 0) return "open";
    if (bookedSet.size >= 16) return "full";
    return "partial";
  }, [monthBookings, roomBuffer]);

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
        .in("status", BLOCKING_BOOKING_STATUSES)
        .gte("start_time", dayStart)
        .lt("end_time", dayEnd);
      const dayBooked = new Set<number>();
      (data ?? []).forEach((b) => {
        const s = new Date(b.start_time).getHours();
        const e = getBufferedEndTime(b.end_time, roomBuffer).getHours();
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
  }, [selectedRoom, selectedDuration, hasFlexibleBooking, roomBuffer, toast]);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const bookedHours = useMemo(() => {
    const set = new Set<number>();
    bookings.forEach((b) => {
      const s = new Date(b.start_time).getHours();
      const e = getBufferedEndTime(b.end_time, roomBuffer).getHours();
      for (let h = s; h < e; h++) set.add(h);
    });
    return set;
  }, [bookings, roomBuffer]);

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

  const getSelectedSlot = () => {
    if (!selectedDate || selectedHour === null) return null;
    const start = new Date(selectedDate);
    start.setHours(selectedHour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + duration);
    return { start, end };
  };

  const getPaymentPlan = (total: number, start: Date) => {
    const paymentType = getBookingPaymentRequirement(start.toISOString());
    const deposit = Math.min(total, selectedPackagePricing.depositAmount || Math.ceil(total * 0.5));
    const dueNow = paymentType === "full" ? total : deposit;
    return {
      paymentType,
      deposit,
      balance: Math.max(total - dueNow, 0),
      dueNow,
    };
  };

  const checkBookingRiskBlock = async () => {
    if (!user) return false;

    const { data, error } = await supabase
      .from("fg_ban_registry" as any)
      .select("risk_status, review_status, reason")
      .eq("linked_user_id", user.id)
      .eq("risk_status", "red")
      .limit(1);

    if (error) return false;

    const activeBlock = (data as any[] | null)?.find((row) => row.review_status !== "cleared");
    if (!activeBlock) return false;

    toast({
      title: "Booking requires management review",
      description: activeBlock.reason || "This account is currently blocked from self-service bookings.",
      variant: "destructive",
    });
    return true;
  };

  const createBooking = async ({
    status = "confirmed",
    paymentStatus = "unpaid",
    total,
    deposit,
    balance,
  }: {
    status?: string;
    paymentStatus?: string;
    total?: number | null;
    deposit?: number | null;
    balance?: number | null;
  }) => {
    if (!selectedRoom || !sessionType || !user) return null;
    const slot = getSelectedSlot();
    if (!slot) return null;

    const { data, error } = await supabase.from("bookings").insert({
      room_id: selectedRoom.id,
      user_id: user.id,
      start_time: slot.start.toISOString(),
      end_time: slot.end.toISOString(),
      session_type: sessionType,
      num_guests: numGuests,
      beat_needed: beatNeeded,
      is_private: isPrivate,
      security_required: securityRequired,
      status,
      payment_status: paymentStatus,
      total_amount: total ?? null,
      deposit_amount: deposit ?? null,
      outstanding_balance: balance ?? null,
      package_purchased: selectedPackagePricing.packageName,
      notes: [
        notes,
        selectedEngineer ? `[Engineer: ${selectedEngineer}]` : "",
        bookingOption !== "room_only" && selectedProducer ? `[Producer requested: ${selectedProducer}]` : "",
        selectedSetup ? `[Room Setup: ${selectedSetup}]` : "",
        supportRequirement ? `[Support room: ${supportRequirement.supportRoom}; ${supportRequirement.supportType}; status: ${supportRequirement.status}]` : "",
      ].filter(Boolean).join(" "),
    }).select("id").single();

    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
      return null;
    } else {
      return data?.id ?? null;
    }
  };

  const resetBookingForm = () => {
    setSelectedHour(null);
    setSessionType("");
    setNotes("");
    setSelectedEngineer("");
    setBookingOption("room_only");
    setSelectedProducer("");
    setSelectedSetup("Freestyle Layout");
    setShowPaymentModal(false);
    setPendingBookingPrice(null);
    localStorage.removeItem(DRAFT_KEY);
    setShowDraftBanner(false);
    fetchBookings();
  };

  const startStripeCheckout = async () => {
    if (!selectedRoom || !user || !pendingBookingPrice) return;
    const slot = getSelectedSlot();
    if (!slot) return;
    const plan = getPaymentPlan(pendingBookingPrice, slot.start);

    setCheckoutLoading(true);
    const bookingId = await createBooking({
      status: "pending_payment",
      paymentStatus: "unpaid",
      total: pendingBookingPrice,
      deposit: plan.deposit,
      balance: plan.balance,
    });

    if (!bookingId) {
      setCheckoutLoading(false);
      return;
    }

    const { data, error } = await supabase.functions.invoke("booking-checkout", {
      body: {
        booking_id: bookingId,
        payment_type: plan.paymentType,
        amount_pence: Math.round(plan.dueNow * 100),
        line_item_name: `${roomNameMapping[selectedRoom.name] || selectedRoom.name} - ${duration} hour booking`,
        customer_email: user.email,
      },
    });

    if (error || !data?.checkout_url) {
      const { error: releaseError } = await supabase
        .from("bookings")
        .update({ status: "cancelled", payment_status: "failed" })
        .eq("id", bookingId);

      toast({
        title: "Stripe checkout unavailable",
        description: releaseError
          ? "Checkout failed and the slot could not be released. Please contact the studio."
          : error?.message || data?.error || "Payment provider is not configured yet.",
        variant: "destructive",
      });
      setCheckoutLoading(false);
      return;
    }

    window.location.href = data.checkout_url;
  };

  const handleBook = async () => {
    if (!selectedRoom || !selectedDate || selectedHour === null || !sessionType || !user) return;

    if (await checkBookingRiskBlock()) return;

    for (let h = selectedHour; h < selectedHour + duration; h++) {
      if (bookedHours.has(h)) {
        toast({ title: "Time conflict", description: "Some hours in this block are already booked.", variant: "destructive" });
        return;
      }
    }

    // Server-side buffer-aware availability check before INSERT
    const start = new Date(selectedDate);
    start.setHours(selectedHour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + duration);

    const { data: slotAvailable, error: availError } = await supabase.rpc(
      "fg_check_room_availability",
      { _room_id: selectedRoom.id, _start_time: start.toISOString(), _end_time: end.toISOString() }
    );
    if (availError || !slotAvailable) {
      toast({
        title: "Room unavailable",
        description: `This slot is within the ${roomBuffer}-minute buffer of another booking. Please choose a different time.`,
        variant: "destructive",
      });
      await fetchBookings();
      return;
    }

    if (!hasFlexibleBooking && selectedHour + duration > 24) {
      toast({ title: "Invalid time", description: "Session cannot extend past midnight.", variant: "destructive" });
      return;
    }

    const price = getBookingPrice(
      roomNameMapping[selectedRoom.name] || selectedRoom.name,
      duration,
      Boolean(selectedEngineer),
      sessionType,
    );

    if (price === null) {
      setShowQuoteModal(true);
      return;
    }

    setPendingBookingPrice(price);
    setShowPaymentModal(true);
  };

  const selectedPackagePricing = useMemo(() => {
    const roomName = selectedRoom ? roomNameMapping[selectedRoom.name] || selectedRoom.name : "";
    const lowerSession = sessionType.toLowerCase();
    if (lowerSession.includes("podcast")) return getPackagePricing("podcast-session");
    if (lowerSession.includes("content") || roomName.includes("Content")) return getPackagePricing("content-room");
    if (selectedEngineer) return getPackagePricing("recording-producer");
    if (roomName.includes("Recording")) return getPackagePricing("studio-dry-hire");
    return STUDIO_PACKAGE_PRICING[0];
  }, [selectedRoom, selectedEngineer, sessionType]);

  const currentSessionPrice = selectedRoom
    ? getBookingPrice(roomNameMapping[selectedRoom.name] || selectedRoom.name, duration, Boolean(selectedEngineer), sessionType)
    : null;
  const selectedSlot = getSelectedSlot();
  const currentPaymentPlan = currentSessionPrice && selectedSlot
    ? getPaymentPlan(currentSessionPrice, selectedSlot.start)
    : null;

  const selectedRoomDisplayName = selectedRoom ? roomNameMapping[selectedRoom.name] || selectedRoom.name : "";
  const supportRequirement = useMemo(
    () => getRoomSupportRequirement(selectedRoomDisplayName, sessionType),
    [selectedRoomDisplayName, sessionType]
  );

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
        <div className="grid grid-cols-1 gap-4 pb-2 sm:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => {
            const rc = roomColorMap[room.color] ?? "";
            const active = selectedRoom?.id === room.id;
            const displayName = roomNameMapping[room.name] || room.name;
            const photo = getRoomPhoto(displayName);
            return (
              <div key={room.id} className={`overflow-hidden border-2 transition-colors ${active ? `${rc} border-current bg-current/10` : "border-border bg-card"}`}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => { setSelectedRoom(room); setSelectedDate(null); setSelectedHour(null); }}
                  className="block w-full text-left"
                >
                  {photo && <img src={photo} alt={`${displayName} room`} className="aspect-[2/1] w-full object-cover" />}
                  <span className="block px-4 py-3 font-bebas text-lg tracking-wider text-foreground">{displayName.toUpperCase()}</span>
                </button>
                {photo && <Link to={`/360-tour?room=${getRoomTour(displayName)}`} className="block border-t border-border px-4 py-2 font-mono text-xs text-primary hover:bg-primary/10">OPEN INTERACTIVE 360° TOUR</Link>}
              </div>
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
                      <div className="rounded-md border border-border bg-background/50 p-3 text-xs text-muted-foreground">
                        Room buffer: <span className="text-primary">{roomBuffer} minutes</span>
                        {supportRequirement && (
                          <span className="mt-2 block text-amber-100">
                            Linked support required: {supportRequirement.supportRoom} · {supportRequirement.supportType} · {supportRequirement.status}
                          </span>
                        )}
                      </div>


                      {/* Booking Mode Options */}
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs font-mono uppercase tracking-wider">Booking Type</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: "room_only", label: "Book Room Only", sub: "Self-service space hire" },
                            { value: "room_producer", label: "Book Room + Producer", sub: "Session support engineer" },
                            { value: "producer_only", label: "Book Producer Only", sub: "Creative services (no room)" },
                            { value: "service_only", label: "Book Service Only", sub: "Digital content planning" }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setBookingOption(opt.value);
                                if (opt.value === "room_only") setSelectedProducer("");
                              }}
                              className={`p-2.5 rounded-lg border text-xs font-mono transition-all text-left flex flex-col justify-between h-[4.5rem] ${bookingOption === opt.value ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background/30 text-muted-foreground hover:border-muted-foreground"}`}
                            >
                              <span className="font-bold text-foreground">{opt.label}</span>
                              <span className="text-[10px] text-muted-foreground leading-tight">{opt.sub}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Producer Selector */}
                      {bookingOption !== "room_only" && (
                        <div className="space-y-2 border-l-2 border-primary/40 pl-4 py-1">
                          <Label className="text-muted-foreground text-xs font-mono uppercase tracking-wider">Select Specialist</Label>
                          <div className="grid gap-2">
                            {[
                              { slug: "mono-luke", name: "Mono Luke", role: "Producer & Creative", rate: "Request a quote", availability: "Availability confirmed on request", services: "Vocal Recording, Mixing, Mastering, 3D, Design" },
                              { slug: "seb-green", name: "Seb Green", role: "Systems & Content", rate: "POA", availability: "By Appointment Only", services: "Digital Systems, Operations, Content Strategy" }
                            ].map((prod) => (
                              <button
                                key={prod.slug}
                                type="button"
                                onClick={() => setSelectedProducer(prod.slug)}
                                className={`p-3 rounded-lg border text-xs transition-all text-left flex flex-col gap-1 w-full ${selectedProducer === prod.slug ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background/30 text-muted-foreground hover:border-muted-foreground"}`}
                              >
                                <div className="flex justify-between items-center w-full">
                                  <span className="font-bold text-foreground">{prod.name}</span>
                                  <span className="font-mono text-primary text-[10px] uppercase tracking-wider">{prod.role}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">Services: {prod.services}</p>
                                <div className="flex justify-between items-center text-[10px] opacity-80 mt-1 font-mono">
                                  <span>Rate: {prod.rate}</span>
                                  <span>Avail: {prod.availability}</span>
                                </div>
                                <div className="w-full text-right mt-1">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${selectedProducer === prod.slug ? "bg-primary text-black" : "bg-card border border-border text-muted-foreground"}`}>
                                    {selectedProducer === prod.slug ? "Requested ✓" : "Request this Producer"}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Room Setup Selector */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-muted-foreground text-xs font-mono uppercase tracking-wider">Room Setup Layout</Label>
                          <span className="text-[10px] font-mono text-emerald-400">30m Setup + 30m Breakdown Free</span>
                        </div>
                        <select
                          value={selectedSetup}
                          onChange={(e) => setSelectedSetup(e.target.value)}
                          className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm focus:border-interactive focus:ring-1 focus:ring-interactive focus:outline-none transition-colors"
                        >
                          <option value="Freestyle Layout">Freestyle Layout</option>
                          <option value="Gaming Layout">Gaming Layout</option>
                          <option value="Interview Layout">Interview Layout</option>
                          <option value="Podcast Layout">Podcast Layout</option>
                          <option value="Boiler Room Layout">Boiler Room Layout</option>
                          <option value="Events Layout">Events Layout</option>
                          <option value="Photoshoot Layout">Photoshoot Layout</option>
                          <option value="Green Screen Layout">Green Screen Layout</option>
                          <option value="Content Creation White Screen Layout">Content Creation White Screen Layout</option>
                          <option value="Social Setting / Bar Interview">Social Setting / Bar Interview</option>
                          <option value="Pool Table / Games Night">Pool Table / Games Night</option>
                        </select>
                        <p className="text-[10px] text-muted-foreground leading-normal">
                          Setup blocks the room for 30 minutes before and after the session. This blocks general availability, but is not charged to your slot.
                        </p>
                      </div>

                      {/* Updated policies summary */}
                      <div className="rounded-xl border border-border bg-card/40 p-4 space-y-2 text-xs">
                        <h4 className="font-bebas text-sm tracking-wide text-foreground flex items-center gap-1.5 uppercase">
                          <AlertTriangle className="w-3.5 h-3.5 text-primary" /> Booking & Cancellation Policy
                        </h4>
                        <ul className="space-y-1.5 text-muted-foreground font-barlow leading-relaxed">
                          <li>• <strong className="text-foreground">48+ hours:</strong> Full credit.</li>
                          <li>• <strong className="text-foreground">24–48 hours:</strong> 50% charge.</li>
                          <li>• <strong className="text-foreground">Less than 24 hours:</strong> 100% charge. Contact the studio about cancellation or credit handling; your signed booking terms control.</li>
                          <li>• <strong className="text-foreground">Liability:</strong> Producers are financially liable for any damage caused by staff or clients they bring.</li>
                        </ul>
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
                            £{currentSessionPrice || "—"}
                          </span>
                        </div>
                      </div>

                      {currentSessionPrice && currentPaymentPlan ? (
                        <BookingPaymentPlaceholder
                          packageInfo={selectedPackagePricing}
                          total={currentSessionPrice}
                          deposit={currentPaymentPlan.deposit}
                          balance={currentPaymentPlan.balance}
                          dueNow={currentPaymentPlan.dueNow}
                          paymentType={currentPaymentPlan.paymentType}
                        />
                      ) : null}

                      <Button onClick={handleBook} disabled={submitting || !sessionType} className="w-full font-bebas text-lg tracking-wider h-12">
                        {submitting ? "BOOKING..." : "CONTINUE TO PAYMENT SETUP"}
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
                      <p className="text-foreground font-mono font-bold mt-1 text-base">{getBookingPrice(roomNameMapping[selectedRoom.name] || selectedRoom.name, selectedDuration, false, sessionType) === null ? "Request a quote" : `£${getBookingPrice(roomNameMapping[selectedRoom.name] || selectedRoom.name, selectedDuration, false, sessionType)}`}</p>
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
              onClick={async () => {
                const { error } = await supabase.from("quote_requests").insert({
                  name: quoteName,
                  email: quoteEmail,
                  service: selectedRoomDisplayName || "Studio booking",
                  description: quoteDetails,
                });
                if (error) {
                  toast({ title: "Quote request failed", description: "Please try again or contact the studio.", variant: "destructive" });
                  return;
                }
                toast({ title: "Quote request sent", description: "We'll get back to you within 24 hours." });
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

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-bebas text-2xl text-foreground tracking-wider flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> SECURE YOUR BOOKING
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Your booking slot will be created as pending payment, then Stripe will open to collect the amount due now.
            </DialogDescription>
          </DialogHeader>
          {pendingBookingPrice && selectedSlot ? (
            <BookingPaymentPlaceholder
              packageInfo={selectedPackagePricing}
              total={pendingBookingPrice}
              deposit={getPaymentPlan(pendingBookingPrice, selectedSlot.start).deposit}
              balance={getPaymentPlan(pendingBookingPrice, selectedSlot.start).balance}
              dueNow={getPaymentPlan(pendingBookingPrice, selectedSlot.start).dueNow}
              paymentType={getPaymentPlan(pendingBookingPrice, selectedSlot.start).paymentType}
              loading={checkoutLoading}
              onCheckout={startStripeCheckout}
            />
          ) : null}
          <p className="text-center text-xs text-muted-foreground">
            Card details are handled by Stripe. Fully Governed never stores card numbers.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Book;
