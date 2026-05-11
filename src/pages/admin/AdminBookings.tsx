import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Search, X, Download, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import EditBookingModal from "@/components/EditBookingModal";

interface BookingWithProfile {
  id: string;
  room_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  session_type: string;
  status: string;
  num_guests: number | null;
  notes: string | null;
  beat_needed: boolean | null;
  is_private: boolean | null;
  created_at: string;
  amendment_count?: number;
  profiles?: { full_name: string } | null;
  rooms?: { name: string; color: string } | null;
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState<BookingWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editBooking, setEditBooking] = useState<BookingWithProfile | null>(null);
  const { toast } = useToast();

  const fetchBookings = async () => {
    const { data } = await (supabase
      .from("bookings")
      .select("*, rooms!inner(name, color)") as any)
      .order("start_time", { ascending: false })
      .limit(200);
    setBookings((data as BookingWithProfile[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id: string) => {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Booking cancelled" });
      fetchBookings();
    }
  };

  const handleExport = () => {
    const csv = [
      "Date,Time,Room,Member,Type,Guests,Status",
      ...bookings.map(b =>
        `${format(new Date(b.start_time), "yyyy-MM-dd")},${format(new Date(b.start_time), "HH:mm")}-${format(new Date(b.end_time), "HH:mm")},${b.rooms?.name || ""},${b.profiles?.full_name || ""},${b.session_type},${b.num_guests || 0},${b.status}`
      )
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const filtered = bookings.filter(b =>
    !search || (b.profiles?.full_name || "").toLowerCase().includes(search.toLowerCase()) || b.session_type.toLowerCase().includes(search.toLowerCase())
  );

  const roomColor = (color: string) => {
    if (color === "#D4AF37") return "text-room-studio";
    if (color === "#C0392B") return "text-room-multi";
    return "text-room-content";
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl text-foreground">BOOKINGS</h1>
          <p className="text-muted-foreground font-barlow text-sm">{bookings.length} total bookings</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="font-barlow">
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by member or session type..." className="pl-10 bg-card" />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-interactive"><X className="w-4 h-4" /></button>}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><CalendarDays className="w-6 h-6 text-primary animate-pulse" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-mono text-xs">
                <th className="text-left py-3 px-2">Date</th>
                <th className="text-left py-3 px-2">Time</th>
                <th className="text-left py-3 px-2">Room</th>
                <th className="text-left py-3 px-2">Member</th>
                <th className="text-left py-3 px-2">Type</th>
                <th className="text-left py-3 px-2">Guests</th>
                <th className="text-left py-3 px-2">Status</th>
                <th className="text-left py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-2 font-mono text-foreground">{format(new Date(b.start_time), "d MMM yy")}</td>
                  <td className="py-3 px-2 font-mono text-muted-foreground">{format(new Date(b.start_time), "HH:mm")}-{format(new Date(b.end_time), "HH:mm")}</td>
                  <td className={`py-3 px-2 font-bebas tracking-wider ${roomColor(b.rooms?.color || "")}`}>{b.rooms?.name || "-"}</td>
                  <td className="py-3 px-2 text-foreground">{b.profiles?.full_name || "-"}</td>
                  <td className="py-3 px-2 text-muted-foreground">{b.session_type}</td>
                  <td className="py-3 px-2 text-muted-foreground font-mono">{b.num_guests || 0}</td>
                  <td className="py-3 px-2">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${b.status === "confirmed" ? "bg-green-500/20 text-green-400" : b.status === "cancelled" ? "bg-destructive/20 text-destructive" : "bg-secondary text-secondary-foreground"}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex gap-2">
                      {b.status === "confirmed" && (
                        <>
                          <button onClick={() => setEditBooking(b)} className="text-xs text-muted-foreground hover:text-interactive transition-colors font-mono"><Pencil className="w-3 h-3 inline mr-1" />Edit</button>
                          <button onClick={() => handleCancel(b.id)} className="text-xs text-muted-foreground hover:text-destructive transition-colors font-mono">Cancel</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Booking Modal (Admin mode) */}
      {editBooking && (
        <EditBookingModal
          open={!!editBooking}
          onOpenChange={(o) => { if (!o) setEditBooking(null); }}
          booking={editBooking}
          isAdmin
          onUpdated={fetchBookings}
        />
      )}
    </div>
  );
};

export default AdminBookings;
