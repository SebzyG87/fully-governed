import { useState, useEffect } from "react";
import { Timer, Play, Square, History, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { StudioOpsCard, StudioOpsSection } from "./StudioOpsPrimitives";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Shift {
  id: string;
  clockIn: string;
  clockOut: string;
  durationMs: number;
  role: string;
}

export const StaffClockPanel = ({ staffRole }: { staffRole: string }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [activeShiftId, setActiveShiftId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [history, setHistory] = useState<Shift[]>([]);
  const [isLiveData, setIsLiveData] = useState(false);

  const loadLiveShifts = async () => {
    if (!user) return false;
    const { data, error } = await supabase
      .from("fg_staff_shifts" as any)
      .select("*")
      .eq("staff_user_id", user.id)
      .order("clock_in_at", { ascending: false })
      .limit(30);
    if (error || !data) return false;

    const active = (data as any[]).find((shift) => !shift.clock_out_at);
    if (active) {
      setActiveShiftId(active.id);
      setIsClockedIn(true);
      setClockInTime(active.clock_in_at);
      const elapsed = Math.floor((Date.now() - new Date(active.clock_in_at).getTime()) / 1000);
      setElapsedSeconds(elapsed > 0 ? elapsed : 0);
    }

    setHistory((data as any[])
      .filter((shift) => shift.clock_out_at)
      .map((shift) => ({
        id: shift.id,
        clockIn: shift.clock_in_at,
        clockOut: shift.clock_out_at,
        durationMs: (shift.duration_seconds ?? 0) * 1000,
        role: shift.staff_role,
      })));
    setIsLiveData(true);
    return true;
  };

  useEffect(() => {
    loadLiveShifts().then((loaded) => {
      if (loaded) return;

    const activeClockIn = localStorage.getItem("fg_staff_clock_in");
    if (activeClockIn) {
      setIsClockedIn(true);
      setClockInTime(activeClockIn);
      const elapsed = Math.floor((Date.now() - new Date(activeClockIn).getTime()) / 1000);
      setElapsedSeconds(elapsed > 0 ? elapsed : 0);
    }

    const savedHistory = localStorage.getItem("fg_staff_shift_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch {
        // use default mock baseline
      }
    } else {
      // Create baseline mock shifts
      const baseline: Shift[] = [
        { id: "1", clockIn: new Date(Date.now() - 86400000 * 2 - 3600000 * 8).toISOString(), clockOut: new Date(Date.now() - 86400000 * 2).toISOString(), durationMs: 3600000 * 8, role: staffRole },
        { id: "2", clockIn: new Date(Date.now() - 86400000 * 1 - 3600000 * 6.5).toISOString(), clockOut: new Date(Date.now() - 86400000 * 1).toISOString(), durationMs: 3600000 * 6.5, role: staffRole },
      ];
      setHistory(baseline);
      localStorage.setItem("fg_staff_shift_history", JSON.stringify(baseline));
    }
    });
  }, [staffRole, user?.id]);

  // Live timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isClockedIn && clockInTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - new Date(clockInTime).getTime()) / 1000);
        setElapsedSeconds(elapsed > 0 ? elapsed : 0);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isClockedIn, clockInTime]);

  const handleClockIn = async () => {
    const now = new Date().toISOString();
    if (user) {
      const { data, error } = await supabase
        .from("fg_staff_shifts" as any)
        .insert({
          staff_user_id: user.id,
          staff_role: staffRole,
          clock_in_at: now,
          activity_log: [{ at: now, action: "clock_in", role: staffRole }],
        })
        .select("id")
        .single();
      if (!error && data) {
        setActiveShiftId(data.id);
        setIsLiveData(true);
      } else if (error && isLiveData) {
        toast({ title: "Clock in failed", description: error.message, variant: "destructive" });
        return;
      }
    }
    localStorage.setItem("fg_staff_clock_in", now);
    setClockInTime(now);
    setIsClockedIn(true);
    setElapsedSeconds(0);
    toast({ title: "Clocked In", description: `Shift started at ${new Date(now).toLocaleTimeString()}` });
  };

  const handleClockOut = async () => {
    if (!clockInTime) return;
    const now = new Date().toISOString();
    const duration = Date.now() - new Date(clockInTime).getTime();

    if (activeShiftId && isLiveData) {
      const { error } = await supabase
        .from("fg_staff_shifts" as any)
        .update({
          clock_out_at: now,
          activity_log: [
            { at: clockInTime, action: "clock_in", role: staffRole },
            { at: now, action: "clock_out", role: staffRole },
          ],
        })
        .eq("id", activeShiftId);
      if (error) {
        toast({ title: "Clock out failed", description: error.message, variant: "destructive" });
        return;
      }
    }

    const newShift: Shift = {
      id: Math.random().toString(36).substring(2, 9),
      clockIn: clockInTime,
      clockOut: now,
      durationMs: duration,
      role: staffRole,
    };

    const updatedHistory = [newShift, ...history];
    setHistory(updatedHistory);
    localStorage.setItem("fg_staff_shift_history", JSON.stringify(updatedHistory));

    // Clear active shift
    localStorage.removeItem("fg_staff_clock_in");
    setIsClockedIn(false);
    setClockInTime(null);
    setActiveShiftId(null);
    setElapsedSeconds(0);
    toast({ title: "Clocked Out", description: `Shift completed. Duration: ${formatElapsed(Math.floor(duration / 1000))}` });
  };

  const formatElapsed = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Hours calculated stats
  const getHoursStats = () => {
    let todaySecs = 0;
    let weekSecs = 0;
    let monthSecs = 0;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    history.forEach((shift) => {
      const shiftDate = new Date(shift.clockIn);
      const secs = shift.durationMs / 1000;

      if (shiftDate >= startOfToday) todaySecs += secs;
      if (shiftDate >= startOfWeek) weekSecs += secs;
      if (shiftDate >= startOfMonth) monthSecs += secs;
    });

    // Add current active shift
    if (isClockedIn) {
      todaySecs += elapsedSeconds;
      weekSecs += elapsedSeconds;
      monthSecs += elapsedSeconds;
    }

    return {
      today: (todaySecs / 3600).toFixed(2),
      week: (weekSecs / 3600).toFixed(2),
      month: (monthSecs / 3600).toFixed(2),
    };
  };

  const stats = getHoursStats();

  return (
    <StudioOpsSection title="Staff Shift Console" eyebrow="Ops tracking" icon={Timer}>
      <div className="grid gap-4 md:grid-cols-3">
        {/* Clocking Controls */}
        <StudioOpsCard className="md:col-span-1 flex flex-col justify-between space-y-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Shift Control</p>
            <h3 className="font-bebas text-2xl tracking-wide text-foreground mt-1">
              {isClockedIn ? "Active Shift Running" : "Off Duty"}
            </h3>
            {isClockedIn && clockInTime && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Clocked in at {new Date(clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 bg-background/50 rounded-2xl border border-border p-4">
            <Clock className={`w-5 h-5 ${isClockedIn ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
            <span className="font-mono text-2xl font-bold tracking-wider text-foreground">
              {formatElapsed(elapsedSeconds)}
            </span>
          </div>

          <div className="flex gap-2">
            {!isClockedIn ? (
              <Button onClick={handleClockIn} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bebas text-sm tracking-wider">
                <Play className="w-4 h-4 mr-1.5" /> Clock In
              </Button>
            ) : (
              <Button onClick={handleClockOut} className="w-full bg-red-600 hover:bg-red-700 text-white font-bebas text-sm tracking-wider">
                <Square className="w-4 h-4 mr-1.5" /> Clock Out
              </Button>
            )}
          </div>
        </StudioOpsCard>

        {/* Shift statistics */}
        <StudioOpsCard className="md:col-span-2 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Hours Statistics</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card/60 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Today</p>
              <p className="font-mono text-2xl font-bold text-foreground mt-1">{stats.today}h</p>
            </div>
            <div className="rounded-xl border border-border bg-card/60 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">This Week</p>
              <p className="font-mono text-2xl font-bold text-foreground mt-1">{stats.week}h</p>
            </div>
            <div className="rounded-xl border border-border bg-card/60 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">This Month</p>
              <p className="font-mono text-2xl font-bold text-foreground mt-1">{stats.month}h</p>
            </div>
          </div>

          <div className="border-t border-border/40 pt-3">
            <h4 className="font-bebas text-base tracking-wide text-foreground flex items-center gap-1.5 mb-2">
              <History className="w-4 h-4 text-primary" /> Timesheet History {isLiveData ? "" : "Fallback"}
            </h4>
            <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1 text-xs font-mono">
              {history.length === 0 ? (
                <p className="text-muted-foreground text-center py-2">No shift history found.</p>
              ) : (
                history.map((h) => (
                  <div key={h.id} className="flex justify-between items-center rounded bg-background/30 p-2 border border-border/50 text-[10px]">
                    <span className="text-muted-foreground">
                      {new Date(h.clockIn).toLocaleDateString()} · {new Date(h.clockIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(h.clockOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <span className="text-foreground font-semibold">
                      {(h.durationMs / 3600000).toFixed(2)} hrs ({h.role})
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </StudioOpsCard>
      </div>
    </StudioOpsSection>
  );
};
