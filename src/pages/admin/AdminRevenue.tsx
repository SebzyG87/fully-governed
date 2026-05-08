import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PoundSterling, TrendingUp, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, startOfYear, subMonths, eachDayOfInterval } from "date-fns";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface SessionLog {
  id: string;
  session_date: string;
  revenue: number | null;
  room_id: string | null;
  rooms?: { name: string; color: string } | null;
}

const AdminRevenue = () => {
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase
      .from("session_logs")
      .select("id, session_date, revenue, room_id, rooms(name, color)") as any)
      .order("session_date", { ascending: false })
      .limit(1000)
      .then(({ data }: any) => {
        setLogs(data || []);
        setLoading(false);
      });
  }, []);

  const now = new Date();
  const todayStr = format(now, "yyyy-MM-dd");
  const monthStart = startOfMonth(now);
  const yearStart = startOfYear(now);
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);

  const sum = (filter: (l: SessionLog) => boolean) =>
    logs.filter(filter).reduce((acc, l) => acc + (l.revenue || 0), 0);

  const todayRev = sum(l => l.session_date === todayStr);
  const weekRev = sum(l => new Date(l.session_date) >= weekStart);
  const monthRev = sum(l => new Date(l.session_date) >= monthStart);
  const yearRev = sum(l => new Date(l.session_date) >= yearStart);

  // Daily revenue this month
  const daysThisMonth = eachDayOfInterval({ start: monthStart, end: endOfMonth(now) });
  const dailyData = daysThisMonth.map(day => {
    const ds = format(day, "yyyy-MM-dd");
    return { day: format(day, "d"), revenue: sum(l => l.session_date === ds) };
  });

  // Monthly trend (last 12)
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const m = subMonths(now, 11 - i);
    const ms = startOfMonth(m);
    const me = endOfMonth(m);
    return {
      month: format(m, "MMM"),
      revenue: sum(l => { const d = new Date(l.session_date); return d >= ms && d <= me; }),
    };
  });

  // Room breakdown
  const roomMap = new Map<string, { name: string; total: number }>();
  logs.forEach(l => {
    if (!l.rooms) return;
    const key = l.room_id || "unknown";
    const entry = roomMap.get(key) || { name: l.rooms.name, total: 0 };
    entry.total += l.revenue || 0;
    roomMap.set(key, entry);
  });

  const handleExport = () => {
    const csv = ["Date,Room,Revenue", ...logs.map(l => `${l.session_date},${l.rooms?.name || ""},£${(l.revenue || 0).toFixed(2)}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `revenue-${format(now, "yyyy-MM-dd")}.csv`; a.click();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl text-foreground">REVENUE</h1>
          <p className="text-muted-foreground font-barlow text-sm">Revenue tracking & analytics</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="font-barlow">
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </motion.div>

      {loading ? (
        <PoundSterling className="w-8 h-8 text-primary animate-pulse mx-auto" />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "TODAY", value: todayRev },
              { label: "THIS WEEK", value: weekRev },
              { label: "THIS MONTH", value: monthRev },
              { label: "THIS YEAR", value: yearRev },
            ].map((c) => (
              <div key={c.label} className="bg-card border border-border rounded-lg p-4">
                <p className="text-xs text-muted-foreground font-mono">{c.label}</p>
                <p className="text-2xl font-mono text-primary mt-1">£{c.value.toFixed(0)}</p>
              </div>
            ))}
          </div>

          {/* Room Breakdown */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl text-foreground mb-4">REVENUE BY ROOM</h2>
            <div className="space-y-2">
              {[...roomMap.values()].map((r) => (
                <div key={r.name} className="flex justify-between items-center">
                  <span className="text-sm text-foreground">{r.name}</span>
                  <span className="font-mono text-primary">£{r.total.toFixed(0)}</span>
                </div>
              ))}
              {roomMap.size === 0 && <p className="text-muted-foreground text-sm">No revenue data yet</p>}
            </div>
          </div>

          {/* Daily Chart */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl text-foreground mb-4">DAILY REVENUE — {format(now, "MMMM yyyy").toUpperCase()}</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> 12-MONTH TREND
            </h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminRevenue;
