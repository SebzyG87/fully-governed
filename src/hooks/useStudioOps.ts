import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type BookingRow = Tables<"bookings">;
type CleaningTask = Tables<"fg_cleaning_tasks">;
type Assignment = Tables<"fg_booking_assignments">;
type Incident = Tables<"fg_incidents">;
type Verification = Tables<"fg_client_verifications">;
type EmailQueueItem = Tables<"fg_email_queue">;
type LifecycleEvent = Tables<"fg_booking_lifecycle_events">;
type SessionNote = Tables<"fg_session_notes">;

// ── Today's bookings (admin / manager view) ────────────────────────────────
export function useTodaysBookings() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const { data, error: err } = await supabase
      .from("bookings")
      .select("*, rooms(id, name, slug, color)")
      .gte("start_time", todayStart.toISOString())
      .lte("start_time", todayEnd.toISOString())
      .not("status", "in", '("cancelled","cleaned")')
      .order("start_time", { ascending: true });

    if (err) setError(err.message);
    else setBookings((data as BookingRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { bookings, loading, error, refetch: fetch };
}

// ── Client's own bookings ──────────────────────────────────────────────────
export function useClientBookings(userId: string | undefined) {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const { data, error: err } = await supabase
      .from("bookings")
      .select("*, rooms(id, name, slug, color)")
      .eq("user_id", userId)
      .order("start_time", { ascending: false });

    if (err) setError(err.message);
    else setBookings((data as BookingRow[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { bookings, loading, error, refetch: fetch };
}

// ── Producer: assigned sessions ────────────────────────────────────────────
export function useProducerAssignments(userId: string | undefined) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const { data, error: err } = await supabase
      .from("fg_booking_assignments")
      .select("*, bookings(*, rooms(id, name, slug, color))")
      .eq("staff_user_id", userId)
      .eq("assignment_role", "session_producer")
      .not("assignment_status", "eq", "declined")
      .order("created_at", { ascending: false });

    if (err) setError(err.message);
    else setAssignments((data as Assignment[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { assignments, loading, error, refetch: fetch };
}

// ── Cleaning tasks ─────────────────────────────────────────────────────────
export function useCleaningTasks(assignedCleanerId?: string) {
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("fg_cleaning_tasks")
      .select("*, rooms(id, name, slug, color), bookings(id, start_time, end_time, session_type)")
      .order("created_at", { ascending: false });

    if (assignedCleanerId) {
      query = query.eq("assigned_cleaner_id", assignedCleanerId);
    }

    const { data, error: err } = await query;
    if (err) setError(err.message);
    else setTasks((data as CleaningTask[]) ?? []);
    setLoading(false);
  }, [assignedCleanerId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { tasks, loading, error, refetch: fetch };
}

// ── Update cleaning task ────────────────────────────────────────────────────
export async function updateCleaningTask(
  taskId: string,
  updates: Partial<CleaningTask>
) {
  const { error } = await supabase
    .from("fg_cleaning_tasks")
    .update(updates)
    .eq("id", taskId);
  return error;
}

// ── Incidents ──────────────────────────────────────────────────────────────
export function useIncidents(bookingId?: string) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("fg_incidents")
      .select("*")
      .order("created_at", { ascending: false });

    if (bookingId) query = query.eq("booking_id", bookingId);

    const { data, error: err } = await query;
    if (err) setError(err.message);
    else setIncidents((data as Incident[]) ?? []);
    setLoading(false);
  }, [bookingId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { incidents, loading, error, refetch: fetch };
}

// ── Log incident ────────────────────────────────────────────────────────────
export async function logIncident(
  incident: Omit<Tables<"fg_incidents">, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .from("fg_incidents")
    .insert(incident)
    .select()
    .single();
  return { data, error };
}

// ── Verification queue ─────────────────────────────────────────────────────
export function useVerificationQueue() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("fg_client_verifications")
      .select("*")
      .in("status", ["pending", "required"])
      .order("created_at", { ascending: false });

    if (err) setError(err.message);
    else setVerifications((data as Verification[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { verifications, loading, error, refetch: fetch };
}

// ── Email queue ────────────────────────────────────────────────────────────
export function useEmailQueue() {
  const [emails, setEmails] = useState<EmailQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("fg_email_queue")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (err) setError(err.message);
    else setEmails((data as EmailQueueItem[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { emails, loading, error, refetch: fetch };
}

// ── Queue an email ──────────────────────────────────────────────────────────
export async function queueEmail(
  email: Omit<Tables<"fg_email_queue">, "id" | "created_at" | "updated_at" | "attempts" | "status">
) {
  const { data, error } = await supabase
    .from("fg_email_queue")
    .insert({ ...email, status: "pending", attempts: 0 })
    .select()
    .single();
  return { data, error };
}

// ── Booking lifecycle events ────────────────────────────────────────────────
export function useLifecycleEvents(bookingId: string | undefined) {
  const [events, setEvents] = useState<LifecycleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!bookingId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("fg_booking_lifecycle_events")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: true });
    setEvents((data as LifecycleEvent[]) ?? []);
    setLoading(false);
  }, [bookingId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { events, loading, refetch: fetch };
}

// ── Session notes ──────────────────────────────────────────────────────────
export function useSessionNotes(bookingId: string | undefined) {
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!bookingId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("fg_session_notes")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: true });
    setNotes((data as SessionNote[]) ?? []);
    setLoading(false);
  }, [bookingId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { notes, loading, refetch: fetch };
}

// ── Update booking status ──────────────────────────────────────────────────
export async function updateBookingStatus(
  bookingId: string,
  newStatus: string,
  extraFields?: Partial<BookingRow>
) {
  const { error } = await supabase
    .from("bookings")
    .update({ status: newStatus, ...extraFields })
    .eq("id", bookingId);
  return error;
}

// ── Today's room status (RPC) ──────────────────────────────────────────────
export function useTodaysRoomStatus() {
  const [rooms, setRooms] = useState<Array<{
    room_id: string;
    room_name: string;
    room_slug: string;
    room_color: string;
    current_booking_id: string | null;
    current_booking_status: string | null;
    current_client_user_id: string | null;
    current_session_type: string | null;
    current_start_time: string | null;
    current_end_time: string | null;
    next_booking_id: string | null;
    next_start_time: string | null;
    assigned_producer_id: string | null;
    cleaning_task_id: string | null;
    cleaning_task_status: string | null;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase.rpc("fg_todays_room_status");
    if (err) setError(err.message);
    else setRooms(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { rooms, loading, error, refetch: fetch };
}
