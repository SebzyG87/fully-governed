import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Users, Activity, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addHours } from "date-fns";

interface Stats {
  bookingsToday: number;
  bookingsWeek: number;
  bookingsMonth: number;
  totalMembers: number;
  adminCount: number;
  familyCount: number;
  customerCount: number;
  upcoming24h: number;
}

interface RoomStatus {
  id: string;
  name: string;
  color: string;
  status: "LIVE" | "AVAILABLE" | "UPCOMING";
  currentUser: string | null;
  until: string | null;
  nextBooking: string | null;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  time: string;
}

const colorMap: Record<string, string> = {
  "#D4AF37": "border-room-studio text-room-studio",
  "#C0392B": "border-room-multi text-room-multi",
  "#7B2FBE": "border-room-content text-room-content",
};

const statusColors: Record<string, string> = {
  LIVE: "bg-green-500",
  AVAILABLE: "bg-muted-foreground",
  UPCOMING: "bg-primary",
};

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats>({ bookingsToday: 0, bookingsWeek: 0, bookingsMonth: 0, totalMembers: 0, adminCount: 0, familyCount: 0, customerCount: 0, upcoming24h: 0 });
  const [roomStatuses, setRoomStatuses] = useState<RoomStatus[]>([]);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const now = new Date();
      const todayStart = startOfDay(now).toISOString();
      const todayEnd = endOfDay(now).toISOString();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 }).toISOString();
      const monthStart = startOfMonth(now).toISOString();
      const monthEnd = endOfMonth(now).toISOString();
      const next24h = addHours(now, 24).toISOString();

      const [todayRes, weekRes, monthRes, membersRes, rolesRes, roomsRes, upcomingRes, recentRes] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact", head: true }).gte("start_time", todayStart).lte("start_time", todayEnd).eq("status", "confirmed"),
        supabase.from("bookings").select("id", { count: "exact", head: true }).gte("start_time", weekStart).lte("start_time", weekEnd).eq("status", "confirmed"),
        supabase.from("bookings").select("id", { count: "exact", head: true }).gte("start_time", monthStart).lte("start_time", monthEnd).eq("status", "confirmed"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("role"),
        supabase.from("rooms").select("*"),
        supabase.from("bookings").select("id", { count: "exact", head: true }).gte("start_time", now.toISOString()).lte("start_time", next24h).eq("status", "confirmed"),
        supabase.from("bookings").select("*, profiles!inner(full_name)").eq("status", "confirmed").order("created_at", { ascending: false }).limit(10),
      ]);

      const adminCount = (rolesRes.data || []).filter(r => r.role === "creator_admin").length;
      const familyCount = (rolesRes.data || []).filter(r => r.role === "family").length;
      const customerCount = (rolesRes.data || []).filter(r => r.role === "customer").length;
      setStats({
        bookingsToday: todayRes.count || 0,
        bookingsWeek: weekRes.count || 0,
        bookingsMonth: monthRes.count || 0,
        totalMembers: membersRes.count || 0,
        adminCount,
        familyCount,
        customerCount,
        upcoming24h: upcomingRes.count || 0,
      });

      // Room statuses
      const rooms = roomsRes.data || [];
      const nowISO = now.toISOString();
      const bookingsNow = await supabase.from("bookings").select("*").eq("status", "confirmed").lte("start_time", nowISO).gte("end_time", nowISO);
      const bookingsNext = await supabase.from("bookings").select("*").eq("status", "confirmed").gt("start_time", nowISO).order("start_time", { ascending: true });

      const statuses: RoomStatus[] = rooms.map(room => {
        const current = (bookingsNow.data || []).find(b => b.room_id === room.id);
        const next = (bookingsNext.data || []).find(b => b.room_id === room.id);
        if (current) {
          return { id: room.id, name: room.name, color: room.color, status: "LIVE" as const, currentUser: null, until: format(new Date(current.end_time), "HH:mm"), nextBooking: next ? format(new Date(next.start_time), "HH:mm") : null };
        }
        if (next) {
          return { id: room.id, name: room.name, color: room.color, status: "UPCOMING" as const, currentUser: null, until: null, nextBooking: format(new Date(next.start_time), "HH:mm") };
        }
        return { id: room.id, name: room.name, color: room.color, status: "AVAILABLE" as const, currentUser: null, until: null, nextBooking: null };
      });
      setRoomStatuses(statuses);

      // Recent activity
      const recentBookings = (recentRes.data || []).map((b: any) => ({
        id: b.id,
        type: "booking",
        description: `${b.profiles?.full_name || "Member"} booked ${b.session_type}`,
        time: format(new Date(b.created_at), "d MMM HH:mm"),
      }));
      setActivity(recentBookings);
      setLoading(false);
    };

    fetchAll();
  }, []);

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><Activity className="w-6 h-6 text-primary animate-pulse" /></div>;
  }

  const statCards = [
    { label: "Today", value: stats.bookingsToday, icon: CalendarDays },
    { label: "This Week", value: stats.bookingsWeek, icon: CalendarDays },
    { label: "This Month", value: stats.bookingsMonth, icon: CalendarDays },
    { label: "Total Members", value: stats.totalMembers, sub: `🛡️ ${stats.adminCount} · 👑 ${stats.familyCount} · 🎤 ${stats.customerCount}`, icon: Users },
    { label: "Next 24h", value: stats.upcoming24h, icon: Clock },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl text-foreground">OVERVIEW</h1>
        <p className="text-muted-foreground font-barlow text-sm">Live studio dashboard</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-lg p-4 hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all">
            <card.icon className="w-4 h-4 text-muted-foreground mb-2" />
            <p className="font-mono text-2xl text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground font-barlow">{card.label}</p>
            {card.sub && <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>}
          </motion.div>
        ))}
      </div>

      {/* Room Status Board */}
      <div>
        <h2 className="text-2xl text-foreground mb-4">ROOM STATUS</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roomStatuses.map((room) => {
            const cc = colorMap[room.color] || "border-primary text-primary";
            return (
              <div key={room.id} className={`bg-card border-2 ${cc.split(" ")[1]} rounded-lg p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-xl ${cc.split(" ")[0]}`}>{room.name.toUpperCase()}</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusColors[room.status]} ${room.status === "LIVE" ? "animate-pulse" : ""}`} />
                    <span className="text-xs font-mono text-muted-foreground">{room.status}</span>
                  </div>
                </div>
                {room.status === "LIVE" && <p className="text-sm text-foreground">In session until {room.until}</p>}
                {room.nextBooking && <p className="text-xs text-muted-foreground mt-1">Next: {room.nextBooking}</p>}
                {room.status === "AVAILABLE" && !room.nextBooking && <p className="text-sm text-muted-foreground">No upcoming bookings</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl text-foreground mb-4">RECENT ACTIVITY</h2>
        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          {activity.length === 0 ? (
            <p className="p-4 text-muted-foreground text-sm">No recent activity</p>
          ) : (
            activity.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-interactive" />
                  <span className="text-sm text-foreground">{item.description}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{item.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
