import { useEffect, useState } from "react";
import { FileText, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface TodayBooking {
  id: string;
  start_time: string;
  end_time: string;
  session_type: string;
  num_guests: number | null;
  notes: string | null;
  rooms: { name: string } | null;
  profiles: { full_name: string } | null;
}

const AdminSignIn = () => {
  const [bookings, setBookings] = useState<TodayBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    const fetchToday = async () => {
      const startOfDay = `${today}T00:00:00`;
      const endOfDay = `${today}T23:59:59`;
      const { data } = await (supabase
        .from("bookings")
        .select("id, start_time, end_time, session_type, num_guests, notes, rooms(name), user_id") as any)
        .eq("status", "confirmed")
        .gte("start_time", startOfDay)
        .lte("start_time", endOfDay)
        .order("start_time", { ascending: true });

      // Fetch profile names for each booking
      if (data && data.length > 0) {
        const userIdSet = new Set<string>();
        data.forEach((b: any) => userIdSet.add(String(b.user_id)));
        const userIds = Array.from(userIdSet);
        const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
        const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p.full_name]));
        const enriched = data.map((b: any) => ({ ...b, profiles: { full_name: profileMap.get(b.user_id) || "Unknown" } }));
        setBookings(enriched);
      } else {
        setBookings([]);
      }
      setLoading(false);
    };
    fetchToday();
  }, [today]);

  const handlePrint = () => window.print();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bebas text-3xl text-foreground tracking-wider">DAILY SIGN-IN SHEET</h1>
          <p className="text-sm text-muted-foreground font-barlow">{format(new Date(), "EEEE, d MMMM yyyy")} · {bookings.length} sessions</p>
        </div>
        <Button size="sm" onClick={handlePrint}><Printer className="w-4 h-4 mr-1" />Print</Button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16"><FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No bookings today.</p></div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-3 font-bebas tracking-wider text-foreground">Time</th>
                <th className="text-left p-3 font-bebas tracking-wider text-foreground">Room</th>
                <th className="text-left p-3 font-bebas tracking-wider text-foreground">Member</th>
                <th className="text-left p-3 font-bebas tracking-wider text-foreground">Session</th>
                <th className="text-left p-3 font-bebas tracking-wider text-foreground">Guests</th>
                <th className="text-left p-3 font-bebas tracking-wider text-foreground print:block hidden">Sign</th>
              </tr>
            </thead>
            <tbody className="font-barlow">
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-border">
                  <td className="p-3 text-primary font-mono">{format(new Date(b.start_time), "HH:mm")}–{format(new Date(b.end_time), "HH:mm")}</td>
                  <td className="p-3 text-foreground">{b.rooms?.name || "—"}</td>
                  <td className="p-3 text-foreground">{b.profiles?.full_name || "—"}</td>
                  <td className="p-3 text-muted-foreground">{b.session_type}</td>
                  <td className="p-3 text-muted-foreground">{b.num_guests || 0}</td>
                  <td className="p-3 print:block hidden">____________</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSignIn;
