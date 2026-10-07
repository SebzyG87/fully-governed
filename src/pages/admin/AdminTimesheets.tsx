import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Clock, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShiftRow {
  id: string;
  staff_user_id: string;
  staff_role: string;
  clock_in_at: string;
  clock_out_at: string | null;
  duration_seconds: number | null;
  reviewed_at?: string | null;
  review_status?: string | null;
  notes: string | null;
}

const formatDuration = (seconds: number | null) => {
  if (!seconds) return "Active";
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
};

export default function AdminTimesheets() {
  const { toast } = useToast();
  const [shifts, setShifts] = useState<ShiftRow[]>([]);

  const loadShifts = async () => {
    const { data } = await supabase
      .from("fg_staff_shifts" as any)
      .select("*")
      .order("clock_in_at", { ascending: false })
      .limit(200);
    setShifts((data as ShiftRow[]) || []);
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const totalSeconds = useMemo(() => shifts.reduce((sum, shift) => sum + (shift.duration_seconds || 0), 0), [shifts]);
  const reviewedCount = useMemo(() => shifts.filter((shift) => shift.review_status === "approved").length, [shifts]);

  const exportCsv = () => {
    const csv = [
      "Staff ID,Role,Clock In,Clock Out,Duration,Review Status,Notes",
      ...shifts.map((shift) => [
        shift.staff_user_id,
        shift.staff_role,
        format(new Date(shift.clock_in_at), "yyyy-MM-dd HH:mm"),
        shift.clock_out_at ? format(new Date(shift.clock_out_at), "yyyy-MM-dd HH:mm") : "Active",
        formatDuration(shift.duration_seconds),
        shift.review_status || "pending",
        (shift.notes || "").replace(/"/g, '""'),
      ].map((value) => `"${value}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timesheets-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const markReviewed = async (shiftId: string) => {
    const { error } = await supabase
      .from("fg_staff_shifts" as any)
      .update({ review_status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", shiftId);

    if (error) {
      toast({ title: "Review failed", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Shift reviewed" });
    loadShifts();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl text-foreground">TIMESHEETS</h1>
          <p className="text-muted-foreground font-barlow text-sm">Clock in/out history, hours worked and active shifts.</p>
        </div>
        <Button variant="outline" onClick={exportCsv} className="font-bebas tracking-wider">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Recorded shifts</p>
          <p className="mt-2 font-mono text-3xl text-foreground">{shifts.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Completed hours</p>
          <p className="mt-2 font-mono text-3xl text-foreground">{(totalSeconds / 3600).toFixed(1)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Active now</p>
          <p className="mt-2 font-mono text-3xl text-foreground">{shifts.filter((shift) => !shift.clock_out_at).length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Reviewed</p>
          <p className="mt-2 font-mono text-3xl text-foreground">{reviewedCount}</p>
        </div>
      </div>

      {shifts.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <Clock className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">No shifts found yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">Staff ID</th>
                <th className="p-3">Role</th>
                <th className="p-3">Clock in</th>
                <th className="p-3">Clock out</th>
                <th className="p-3">Review</th>
                <th className="p-3 text-right">Duration</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr key={shift.id} className="border-b border-border/50">
                  <td className="p-3 font-mono text-xs text-muted-foreground">{shift.staff_user_id}</td>
                  <td className="p-3 text-foreground">{shift.staff_role}</td>
                  <td className="p-3 text-muted-foreground">{format(new Date(shift.clock_in_at), "d MMM yyyy HH:mm")}</td>
                  <td className="p-3 text-muted-foreground">{shift.clock_out_at ? format(new Date(shift.clock_out_at), "d MMM yyyy HH:mm") : "Active"}</td>
                  <td className="p-3">
                    <span className={`rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-wide ${shift.review_status === "approved" ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : "border-amber-500/25 bg-amber-500/10 text-amber-300"}`}>
                      {shift.review_status || "pending"}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono text-foreground">{formatDuration(shift.duration_seconds)}</td>
                  <td className="p-3 text-right">
                    {shift.review_status !== "approved" && shift.clock_out_at ? (
                      <Button size="sm" variant="outline" onClick={() => markReviewed(shift.id)} className="font-mono text-xs">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Review
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
