import { useCallback, useEffect, useState } from "react";
import type { ElementType } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Calendar, User, LogOut, Star, Shield, FileText, ShoppingBag, Users, Clock, Pencil, X as XIcon, PoundSterling, Upload, Shirt, Music, Headphones, ClipboardCheck, BriefcaseBusiness } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import EditBookingModal from "@/components/EditBookingModal";
import OnboardingModal from "@/components/OnboardingModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSEO } from "@/hooks/useSEO";
import WalletHistoryModal from "@/components/WalletHistoryModal";
import { getStudioRoleLabel } from "@/lib/studioRoles";
import { getVisibleDashboardEntries, type RoleDashboardEntry } from "@/lib/roleAccessConfig";

const TIERS = [
  { name: "BRONZE", min: 0, max: 99, color: "hsl(30 60% 50%)" },
  { name: "SILVER", min: 100, max: 499, color: "hsl(0 0% 70%)" },
  { name: "GOLD", min: 500, max: 999, color: "hsl(43 76% 52%)" },
  { name: "PLATINUM", min: 1000, max: Infinity, color: "hsl(220 20% 80%)" },
];

const getTier = (pts: number) => TIERS.find(t => pts >= t.min && pts <= t.max) || TIERS[0];

const roleDashboardIcons: Record<RoleDashboardEntry["key"], ElementType> = {
  admin: Shield,
  studio_manager: BriefcaseBusiness,
  session_producer: Headphones,
  cleaner: ClipboardCheck,
  client_artist: Calendar,
};

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

interface PastBooking extends UpcomingBooking {
  hasRating?: boolean;
}

const ROOM_NAME_MAPPING: Record<string, string> = {
  "Studio A (The Gold Room)": "Recording Studio",
  "Studio B (The Neon Suite)": "Multi-Use Room",
  "The Creator Hub": "Content Creation Centre",
  "Room 1B — Recording Studio": "Recording Studio",
  "Room 1A — Multi-Use Room": "Multi-Use Room",
  "Room 2 — Content Creation Centre": "Content Creation Centre"
};

const Dashboard = () => {
  const { user, profile, studioRole, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [upcoming, setUpcoming] = useState<UpcomingBooking[]>([]);
  const [recentActivity, setRecentActivity] = useState<PastBooking[]>([]);
  const [lastSession, setLastSession] = useState<string | null>(null);
  const [editBooking, setEditBooking] = useState<UpcomingBooking | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Post-session rating
  const [ratingBookingId, setRatingBookingId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState("");

  const [walletHistoryOpen, setWalletHistoryOpen] = useState(false);

  useSEO({
    title: "Dashboard",
    description: "Manage your studio bookings, loyalty points, and digital vinyl collection.",
  });

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { state: { from: "/dashboard" } });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!loading && profile && !(profile as any).onboarding_complete) {
      setShowOnboarding(true);
    }
  }, [loading, profile]);

  const fetchBookings = useCallback(() => {
    if (!user) return;
    (supabase
      .from("bookings")
      .select("id, start_time, end_time, session_type, num_guests, notes, is_private, beat_needed, room_id, amendment_count, rooms(name, color)") as any)
      .eq("user_id", user.id)
      .eq("status", "confirmed")
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(5)
      .then(({ data }: any) => setUpcoming(data || []));

    // Past bookings — check for ratings needed (48hrs+ ago)
    const cutoff48h = new Date(Date.now() - 48 * 3600000).toISOString();
    (supabase
      .from("bookings")
      .select("id, start_time, end_time, session_type, num_guests, notes, is_private, beat_needed, room_id, rooms(name, color)") as any)
      .eq("user_id", user.id)
      .lt("start_time", new Date().toISOString())
      .order("start_time", { ascending: false })
      .limit(5)
      .then(async ({ data }: any) => {
        const past = data || [];
        if (past.length > 0) {
          setLastSession(formatDistanceToNow(new Date(past[0].start_time), { addSuffix: true }));
          // Check which have ratings
          const { data: ratings } = await supabase.from("session_ratings").select("booking_id").eq("user_id", user.id);
          const ratedIds = new Set((ratings || []).map((r: any) => r.booking_id));
          const withRatings = past.map((b: any) => ({ ...b, hasRating: ratedIds.has(b.id) }));
          setRecentActivity(withRatings);

          // Find first unrated booking older than 48hrs
          const needsRating = withRatings.find((b: PastBooking) => !b.hasRating && new Date(b.end_time) < new Date(cutoff48h));
          if (needsRating && !ratingBookingId) {
            setRatingBookingId(needsRating.id);
          }
        } else {
          setRecentActivity([]);
        }
      });
  }, [ratingBookingId, user]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleCancel = async () => {
    if (!cancelId) return;
    const { data: cancelled, error } = await supabase.rpc("fg_cancel_own_booking" as any, { _booking_id: cancelId });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (!cancelled) {
      toast({ title: "Could not cancel session", description: "Only your upcoming bookings can be cancelled here.", variant: "destructive" });
    } else {
      toast({ title: "Session cancelled" });
      fetchBookings();
    }
    setCancelId(null);
  };

  const handleSubmitRating = async () => {
    if (!ratingBookingId || !ratingValue || !user) return;
    const { error } = await supabase.from("session_ratings").insert({
      booking_id: ratingBookingId,
      user_id: user.id,
      rating: ratingValue,
      comment: ratingComment || null,
    } as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Thanks for your feedback! ⭐" });
      setRatingBookingId(null);
      setRatingValue(0);
      setRatingComment("");
      fetchBookings();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <div className="grain-overlay" />
        <header className="border-b border-border bg-card/50 backdrop-blur-xl">
          <div className="container flex items-center justify-between h-16">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </header>
        <div className="container py-8 space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  const tierEmoji = studioRole === "super_admin" ? "🛡️" : studioRole === "studio_manager" ? "🎛️" : "🎤";
  const tierLabel = getStudioRoleLabel(studioRole).toUpperCase();
  const pts = Math.max(0, profile.loyalty_points);
  const tier = getTier(pts);
  const nextTier = TIERS[TIERS.indexOf(tier) + 1];
  const tierProgress = nextTier ? ((pts - tier.min) / (nextTier.min - tier.min)) * 100 : 100;
  const visibleDashboardEntries = getVisibleDashboardEntries(studioRole);

  const roomColorClass = (color: string | undefined) => {
    if (color === "#D4AF37") return "border-l-room-studio";
    if (color === "#C0392B") return "border-l-room-multi";
    return "border-l-room-content";
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="grain-overlay" />
      <header className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-primary" />
            <span className="font-bebas text-2xl tracking-widest text-foreground">FULLY GOVERNED</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground font-barlow hidden sm:block">{profile.full_name}</span>
            <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8 space-y-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl text-foreground uppercase">WELCOME BACK, {profile.display_name || profile.full_name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground font-barlow mt-1">
            {tierEmoji} {tierLabel} TIER
            {lastSession && <span className="ml-2">· Last session {lastSession}</span>}
          </p>
        </motion.div>

        {/* Post-session rating prompt */}
        {ratingBookingId && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-primary/30 rounded-lg p-5">
            <h3 className="text-lg text-foreground mb-2">HOW WAS YOUR LAST SESSION?</h3>
            <p className="text-sm text-muted-foreground mb-3">Rate your experience to help us improve.</p>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRatingValue(s)} className={`text-2xl transition-colors ${s <= ratingValue ? "text-primary" : "text-muted-foreground/30"}`}>
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              rows={2}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm resize-none focus:border-interactive focus:ring-1 focus:ring-interactive focus:outline-none mb-3"
              placeholder="Any feedback? (optional)"
            />
            <div className="flex gap-2">
              <Button onClick={handleSubmitRating} disabled={!ratingValue} size="sm" className="font-bebas tracking-wider">SUBMIT</Button>
              <Button variant="ghost" size="sm" onClick={() => setRatingBookingId(null)}>Skip</Button>
            </div>
          </motion.div>
        )}

        {/* Upcoming Sessions */}
        {upcoming.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <h2 className="text-2xl text-foreground mb-3">UPCOMING SESSIONS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcoming.map((b) => (
                <div key={b.id} className={`bg-card border border-border rounded-lg p-4 border-l-4 ${roomColorClass(b.rooms?.color)}`}>
                  <p className="font-bebas text-lg text-foreground tracking-wider">
                    {(b.rooms?.name ? ROOM_NAME_MAPPING[b.rooms.name] || b.rooms.name : "UNKNOWN ROOM").toUpperCase()}
                  </p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {format(new Date(b.start_time), "EEE d MMM · HH:mm")}–{format(new Date(b.end_time), "HH:mm")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{b.session_type}</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => setEditBooking(b)} className="text-xs font-mono">
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setCancelId(b.id)} className="text-xs font-mono text-destructive hover:text-destructive">
                      <XIcon className="w-3 h-3 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Role Dashboard Menu */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">Studio operations</p>
              <h2 className="text-2xl text-foreground">ROLE DASHBOARDS</h2>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              Access is based on your current role: {getStudioRoleLabel(studioRole)}.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {visibleDashboardEntries.map((entry) => {
              const Icon = roleDashboardIcons[entry.key];
              return (
                <Link key={entry.key} to={entry.route} className="group">
                  <div className="flex h-full min-h-[160px] flex-col justify-between rounded-lg border border-border bg-card p-5 transition-all hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))]">
                    <div>
                      <Icon className="mb-3 h-8 w-8 text-primary transition-colors group-hover:text-interactive" />
                      <h3 className="font-bebas text-2xl tracking-wide text-foreground">{entry.label}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{entry.description}</p>
                    </div>
                    <span className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Open workspace</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/book" className="group">
            <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between min-h-[160px] hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all cursor-pointer h-full">
              <div>
                <Calendar className="w-8 h-8 text-primary mb-3 group-hover:text-interactive transition-colors" />
                <h2 className="text-2xl text-foreground font-bebas tracking-wide">BOOK A SESSION</h2>
                <p className="text-sm text-muted-foreground mt-1">Reserve your studio time</p>
              </div>
            </div>
          </Link>
          
          <Link to="/profile" className="group">
            <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between min-h-[160px] hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all cursor-pointer h-full">
              <div>
                <User className="w-8 h-8 text-primary mb-3 group-hover:text-interactive transition-colors" />
                <h2 className="text-2xl text-foreground font-bebas tracking-wide">YOUR PROFILE</h2>
                <p className="text-sm text-muted-foreground mt-1">Edit your artist profile</p>
              </div>
            </div>
          </Link>

          {/* Build Points */}
          <Link to="/dashboard/build-points" className="group">
            <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between min-h-[160px] hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all cursor-pointer h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Star className="w-12 h-12 text-primary" />
              </div>
              <div className="relative z-10">
                <Star className="w-8 h-8 text-primary mb-3 transition-colors group-hover:text-interactive" />
                <h2 className="text-2xl text-foreground font-bebas tracking-wide">BUILD POINTS</h2>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-3xl font-mono text-primary">{pts}</p>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border" style={{ borderColor: `${tier.color}40`, color: tier.color, background: `${tier.color}10` }}>
                    {tier.name}
                  </span>
                </div>
              </div>
              <div className="mt-4 relative z-10">
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(tierProgress, 100)}%`, background: tier.color }} />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
                    {nextTier ? `${nextTier.min - pts} pts to ${nextTier.name}` : "Max tier"}
                  </p>
                  <span className="text-[10px] text-primary font-bebas tracking-widest group-hover:underline">DETAILS</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Studio Credits */}
          <Link to="/dashboard/credits" className="group">
            <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between min-h-[160px] hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all cursor-pointer h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Clock className="w-12 h-12 text-emerald-500" />
              </div>
              <div className="relative z-10">
                <Clock className="w-8 h-8 text-emerald-500 mb-3 transition-colors group-hover:text-interactive" />
                <h2 className="text-2xl text-foreground font-bebas tracking-wide">STUDIO CREDITS</h2>
                <p className="text-3xl font-mono text-emerald-500">
                  {Number((profile as any)?.credits_balance || 0).toFixed(1)} HRS
                </p>
              </div>
              <div className="flex justify-between items-center relative z-10">
                <p className="text-[10px] text-muted-foreground font-mono uppercase">Available balance</p>
                <span className="text-[10px] text-emerald-500 font-bebas tracking-widest group-hover:underline">MANAGE</span>
              </div>
            </div>
          </Link>

          <Link to="/log" className="group">
            <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between min-h-[160px] hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all cursor-pointer h-full">
              <div>
                <FileText className="w-8 h-8 text-primary mb-3 group-hover:text-interactive transition-colors" />
                <h2 className="text-2xl text-foreground font-bebas tracking-wide">SESSION LOG</h2>
                <p className="text-sm text-muted-foreground mt-1">View your booking history</p>
              </div>
            </div>
          </Link>

          <Link to="/shop" className="group">
            <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between min-h-[160px] hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all cursor-pointer h-full">
              <div>
                <ShoppingBag className="w-8 h-8 text-primary mb-3 group-hover:text-interactive transition-colors" />
                <h2 className="text-2xl text-foreground font-bebas tracking-wide">SHOP</h2>
                <p className="text-sm text-muted-foreground mt-1">Merch & exclusive drops</p>
              </div>
            </div>
          </Link>

          <Link to="/community" className="group">
            <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between min-h-[160px] hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all cursor-pointer h-full">
              <div>
                <Users className="w-8 h-8 text-primary mb-3 group-hover:text-interactive transition-colors" />
                <h2 className="text-2xl text-foreground font-bebas tracking-wide">COMMUNITY</h2>
                <p className="text-sm text-muted-foreground mt-1">Collabo board & connections</p>
              </div>
            </div>
          </Link>

          <Link to="/dashboard/upload-music" className="group">
            <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between min-h-[160px] hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all cursor-pointer h-full">
              <div>
                <Upload className="w-8 h-8 text-primary mb-3 group-hover:text-interactive transition-colors" />
                <h2 className="text-2xl text-foreground font-bebas tracking-wide">UPLOAD MUSIC</h2>
                <p className="text-sm text-muted-foreground mt-1">Sell on Digital Vinyl store</p>
              </div>
            </div>
          </Link>

          <Link to="/artist-clothing/designer" className="group">
            <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between min-h-[160px] hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all cursor-pointer h-full">
              <div>
                <Shirt className="w-8 h-8 text-primary mb-3 group-hover:text-interactive transition-colors" />
                <h2 className="text-2xl text-foreground font-bebas tracking-wide">CLOTHING DESIGNER</h2>
                <p className="text-sm text-muted-foreground mt-1">Create your merch line</p>
              </div>
            </div>
          </Link>

          <Link to="/dashboard/earnings" className="group">
            <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between min-h-[160px] hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all cursor-pointer h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <PoundSterling className="w-12 h-12 text-emerald-500" />
              </div>
              <div className="relative z-10">
                <PoundSterling className="w-8 h-8 text-emerald-500 mb-3 transition-colors group-hover:text-interactive" />
                <h2 className="text-2xl text-foreground font-bebas tracking-wide">ROYALTIES & EARNINGS</h2>
                <p className="text-sm text-muted-foreground mt-1">Track sales & payouts</p>
              </div>
            </div>
          </Link>

          <Link to="/dashboard/my-vault" className="group">
            <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between min-h-[160px] hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all cursor-pointer h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Music className="w-12 h-12 text-blue-500" />
              </div>
              <div className="relative z-10">
                <Music className="w-8 h-8 text-blue-500 mb-3 transition-colors group-hover:text-interactive" />
                <h2 className="text-2xl text-foreground font-bebas tracking-wide">MY VAULT</h2>
                <p className="text-sm text-muted-foreground mt-1">Your purchased items</p>
              </div>
            </div>
          </Link>

        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-2xl text-foreground mb-3">RECENT ACTIVITY</h2>
            <div className="bg-card border border-border rounded-lg divide-y divide-border">
              {recentActivity.map((b) => (
                <div key={b.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-foreground">{b.session_type} — {b.rooms?.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{format(new Date(b.start_time), "d MMM yyyy · HH:mm")}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-primary">+10 pts</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Edit Booking Modal */}
      {editBooking && (
        <EditBookingModal
          open={!!editBooking}
          onOpenChange={(o) => { if (!o) setEditBooking(null); }}
          booking={editBooking}
          onUpdated={fetchBookings}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!cancelId} onOpenChange={(o) => { if (!o) setCancelId(null); }}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl text-foreground">CANCEL SESSION?</DialogTitle>
            <DialogDescription className="text-muted-foreground">This action cannot be undone. Your session will be released.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <Button variant="destructive" onClick={handleCancel} className="font-bebas tracking-wider">CONFIRM CANCEL</Button>
            <Button variant="ghost" onClick={() => setCancelId(null)}>Keep It</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Onboarding */}
      {showOnboarding && user && (
        <OnboardingModal open={showOnboarding} onComplete={() => setShowOnboarding(false)} userId={user.id} />
      )}
      {/* Wallet History */}
      {user && (
        <WalletHistoryModal open={walletHistoryOpen} onOpenChange={setWalletHistoryOpen} userId={user.id} />
      )}
    </div>
  );
};

export default Dashboard;
