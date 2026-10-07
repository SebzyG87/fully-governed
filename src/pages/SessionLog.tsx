import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, FileText, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import EditBookingModal from "@/components/EditBookingModal";
import Navbar from "@/components/Navbar";
import BackLink from "@/components/BackLink";
import Footer from "@/components/Footer";

interface LogEntry {
  id: string;
  session_date: string;
  start_time: string | null;
  end_time: string | null;
  session_type: string | null;
  member_name: string | null;
  duration_hours: number | null;
  guests: number;
  status: string;
  notes: string | null;
}

interface UpcomingBooking {
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
  rooms: { name: string; color: string } | null;
}

const SessionLog = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingBooking[]>([]);
  const [fetching, setFetching] = useState(true);
  const [editBooking, setEditBooking] = useState<UpcomingBooking | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { state: { from: "/log" } });
  }, [loading, user, navigate]);

  const fetchData = () => {
    if (!user) return;
    // Past session logs
    supabase.from("session_logs").select("*").order("session_date", { ascending: false }).limit(100).then(({ data }) => {
      setLogs((data as LogEntry[]) || []);
      setFetching(false);
    });
    // Upcoming bookings
    (supabase
      .from("bookings")
      .select("id, start_time, end_time, session_type, num_guests, notes, is_private, beat_needed, room_id, amendment_count, rooms(name, color)") as any)
      .eq("user_id", user.id)
      .eq("status", "confirmed")
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(10)
      .then(({ data }: any) => setUpcoming(data || []));
  };

  useEffect(() => { fetchData(); }, [user]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Crown className="w-8 h-8 text-primary animate-pulse-gold" />
      </div>
    );
  }

  const roomColorClass = (color: string | undefined) => {
    if (color === "#D4AF37") return "border-l-room-studio";
    if (color === "#C0392B") return "border-l-room-multi";
    return "border-l-room-content";
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />

      <div className="container pt-24 pb-8 space-y-6">
        <div className="mb-4">
          <BackLink to="/dashboard" label="Back to Dashboard" className="px-0" />
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl text-foreground">SESSION LOG</h1>
          <p className="text-muted-foreground font-barlow">Your booking history</p>
        </motion.div>

        {/* Upcoming Bookings */}
        {upcoming.length > 0 && (
          <div>
            <h2 className="text-2xl text-foreground mb-3">UPCOMING</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcoming.map((b) => (
                <div key={b.id} className={`bg-card border border-border rounded-lg p-4 border-l-4 ${roomColorClass(b.rooms?.color)}`}>
                  <p className="font-bebas text-lg text-foreground tracking-wider">{b.rooms?.name?.toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {format(new Date(b.start_time), "EEE d MMM · HH:mm")}–{format(new Date(b.end_time), "HH:mm")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{b.session_type}</p>
                  <Button variant="outline" size="sm" onClick={() => setEditBooking(b)} className="mt-3 text-xs font-mono">
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Sessions */}
        <div>
          <h2 className="text-2xl text-foreground mb-3">PAST SESSIONS</h2>
          {logs.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-barlow text-lg">No sessions logged yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-mono text-xs">
                    <th className="text-left py-3 px-2">Date</th>
                    <th className="text-left py-3 px-2">Time</th>
                    <th className="text-left py-3 px-2">Type</th>
                    <th className="text-left py-3 px-2">Duration</th>
                    <th className="text-left py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                      <td className="py-3 px-2 text-foreground font-mono">{log.session_date}</td>
                      <td className="py-3 px-2 text-muted-foreground font-mono">{log.start_time || "—"} – {log.end_time || "—"}</td>
                      <td className="py-3 px-2 text-foreground">{log.session_type || "—"}</td>
                      <td className="py-3 px-2 text-muted-foreground font-mono">{log.duration_hours ? `${log.duration_hours}h` : "—"}</td>
                      <td className="py-3 px-2"><span className="text-xs font-mono px-2 py-0.5 rounded bg-secondary text-secondary-foreground capitalize">{log.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Booking Modal */}
      {editBooking && (
        <EditBookingModal
          open={!!editBooking}
          onOpenChange={(o) => { if (!o) setEditBooking(null); }}
          booking={editBooking}
          onUpdated={fetchData}
        />
      )}
      <Footer />
    </div>
  );
};

export default SessionLog;
