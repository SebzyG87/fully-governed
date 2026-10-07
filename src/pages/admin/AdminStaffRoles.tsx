import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, UserPlus, UserX, RefreshCw, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const STUDIO_ROLES = [
  { value: "super_admin",      label: "Super Admin",       description: "Full access to everything." },
  { value: "studio_manager",   label: "Studio Manager",    description: "Bookings, rooms, staff, cleaning, verification." },
  { value: "session_producer", label: "Session Producer",  description: "Assigned sessions, packages, notes, incidents." },
  { value: "cleaner",          label: "Cleaner",           description: "Assigned cleaning tasks and room readiness." },
  { value: "client_artist",    label: "Client / Artist",   description: "Own bookings and package details only." },
] as const;

type StaffRow = {
  user_id: string;
  email: string;
  full_name: string;
  studio_role: string;
  updated_at: string;
};

const ROLE_BADGE: Record<string, string> = {
  super_admin:      "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300",
  studio_manager:   "border-sky-500/30 bg-sky-500/10 text-sky-300",
  session_producer: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  cleaner:          "border-amber-500/30 bg-amber-500/10 text-amber-300",
  client_artist:    "border-border bg-muted/20 text-muted-foreground",
};

export default function AdminStaffRoles() {
  const { studioRole } = useAuth();
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("studio_manager");
  const [working, setWorking] = useState(false);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("fg_list_staff_roles" as never);
    if (!error && data) setStaff(data as StaffRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const assignRole = async () => {
    if (!email.trim()) return;
    setWorking(true);
    const { data, error } = await supabase.rpc(
      "fg_assign_studio_role_by_email" as never,
      { p_email: email.trim().toLowerCase(), p_role: selectedRole } as never
    );
    setWorking(false);
    if (error) {
      toast({ title: "Assignment failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role assigned", description: String(data) });
      setEmail("");
      fetchStaff();
    }
  };

  const revokeRole = async (targetEmail: string) => {
    setWorking(true);
    const { data, error } = await supabase.rpc(
      "fg_revoke_studio_role_by_email" as never,
      { p_email: targetEmail } as never
    );
    setWorking(false);
    if (error) {
      toast({ title: "Revocation failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role revoked", description: String(data) });
      fetchStaff();
    }
  };

  if (studioRole !== "super_admin") {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <ShieldCheck className="mx-auto mb-4 h-8 w-8" />
        <p>Only super admins can manage staff roles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="font-bebas text-4xl tracking-wider text-foreground">Staff Role Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Assign operational roles to staff by their account email. Roles are stored in <code className="text-xs bg-card px-1 rounded">profiles.studio_role</code>.
        </p>
      </div>

      {/* Role reference */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {STUDIO_ROLES.map((r) => (
          <div key={r.value} className={`rounded-2xl border p-4 ${ROLE_BADGE[r.value]}`}>
            <p className="font-mono text-xs uppercase tracking-widest">{r.value}</p>
            <p className="mt-1 font-semibold">{r.label}</p>
            <p className="mt-1 text-xs opacity-70">{r.description}</p>
          </div>
        ))}
      </div>

      {/* Bootstrap note */}
      <div className="flex gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-100">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        <div>
          <p className="font-semibold">First super_admin setup</p>
          <p className="mt-1 text-xs">
            To bootstrap the very first super_admin, run in the Supabase SQL editor (as service role):{" "}
            <code className="rounded bg-black/30 px-1">SELECT fg_bootstrap_super_admin('your-user-uuid-here');</code>
          </p>
        </div>
      </div>

      {/* Assign form */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-bebas text-2xl tracking-wider text-foreground">Assign Role</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="staff-email">Staff email address</Label>
            <Input
              id="staff-email"
              type="email"
              placeholder="staff@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-role">Role to assign</Label>
            <select
              id="staff-role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {STUDIO_ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>
        <Button
          onClick={assignRole}
          disabled={working || !email.trim()}
          className="font-bebas tracking-wider"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {working ? "Assigning..." : "Assign Role"}
        </Button>
      </div>

      {/* Current staff list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bebas text-2xl tracking-wider text-foreground">Current Staff Roles</h2>
          <Button variant="outline" size="sm" onClick={fetchStaff} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading staff list...</p>
        ) : staff.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card/50 p-8 text-center text-muted-foreground text-sm">
            No staff roles assigned yet. Use the form above to assign the first admin.
          </div>
        ) : (
          <div className="space-y-2">
            {staff.map((s) => (
              <div
                key={s.user_id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card p-4"
              >
                <div>
                  <p className="font-semibold text-foreground">{s.full_name || "—"}</p>
                  <p className="text-xs text-muted-foreground">{s.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full border px-3 py-1 text-xs font-mono ${ROLE_BADGE[s.studio_role] ?? "border-border text-muted-foreground"}`}>
                    {s.studio_role}
                  </span>
                  {s.studio_role !== "client_artist" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeRole(s.email)}
                      disabled={working}
                      className="text-destructive hover:text-destructive"
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
